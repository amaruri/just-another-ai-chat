import express, { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const DYNAMIC_TOOLS_DIR = path.join(process.cwd(), 'app', 'lib', 'tools', 'dynamic');
const PORT = 3001;

const transports: Record<string, StreamableHTTPServerTransport> = {};

// Registry de tools creadas en runtime
const dynamicTools: Record<string, {
  description: string;
  code: string;
  argsSchema: string;
}> = {};

async function loadPersistedTools() {
  try {
    await mkdir(DYNAMIC_TOOLS_DIR, { recursive: true });
    const files = await readdir(DYNAMIC_TOOLS_DIR, { withFileTypes: true });
    const jsonFiles = files.filter(f => f.name.endsWith('.json'));

    for (const file of jsonFiles) {
      const content = await readFile(path.join(DYNAMIC_TOOLS_DIR, file.name), 'utf8');
      const { toolName, description, argsSchema, code } = JSON.parse(content);
      dynamicTools[toolName] = { description, code, argsSchema };
    }

    console.error(`Loaded ${jsonFiles.length} persisted tools`);
  } catch (err) {
    console.error('Error loading persisted tools:', err);
  }
}

function registerDynamicTool(
  server: McpServer,
  toolName: string,
  description: string,
  argsSchema: string,
  code: string
) {
  dynamicTools[toolName] = { description, code, argsSchema };

  server.registerTool(
    toolName,
    {
      description,
      inputSchema: z.object(
        Object.fromEntries(
          Object.entries(JSON.parse(argsSchema)).map(([key, type]) => [
            key,
            type === "number" ? z.number() : z.string(),
          ])
        )
      ),
    },
    async (args) => {
      try {
        const fn = new Function("args", code);
        const result = fn(args);
        return {
          content: [{ type: "text" as const, text: String(result) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text" as const, text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    }
  );
}

function buildServer() {
  const server = new McpServer({ name: "dynamic-tools", version: "1.0.0" });
  // Tool 1: registrar una nueva tool
  server.registerTool(
    "register_tool",
    {
      description: `Creates, registers, and persists a new tool at runtime.
        The code must be a JavaScript function body that receives (args) and returns a result string.
        Example code for celsius to fahrenheit: return String((args.value * 9/5) + 32)
        Also writes a .ts file for reference.`,
      inputSchema: z.object({
        toolName: z.string().describe("Name of the new tool, snake_case"),
        description: z.string().describe("What the tool does"),
        argsSchema: z.string().describe('JSON schema of the args, e.g. {"value": "number", "from": "string", "to": "string"}'),
        code: z.string().describe("JS function body that receives (args) and returns a result string. Example: return String(args.value * 2)"),
      }),
    },
    async ({ toolName, description, argsSchema, code }) => {
      try {
        registerDynamicTool(server, toolName, description, argsSchema, code);

        await mkdir(DYNAMIC_TOOLS_DIR, { recursive: true });

        const jsonPath = path.join(DYNAMIC_TOOLS_DIR, `${toolName}.json`);

        await writeFile(jsonPath, JSON.stringify({
          toolName, description, argsSchema, code
        }, null, 2));
        const tsContent = `
  import { tool } from 'ai';
  import { z } from 'zod';

  // Auto-generated dynamic tool
  export const ${toolName} = tool({
    description: '${description}',
    inputSchema: z.object(${argsSchema}),
    execute: async (args) => {
      ${code}
    },
  });
        `;
        const tsPath = path.join(DYNAMIC_TOOLS_DIR, `${toolName}.ts`);
        await writeFile(tsPath, tsContent);

        return {
          content: [{
            type: "text" as const,
            text: `Tool "${toolName}" registered and persisted at ${tsPath}`
          }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text" as const, text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    }
  );

  // Tool 2: listar tools registradas
  server.registerTool(
    "list_dynamic_tools",
    {
      description: "Lists all dynamically registered tools in this session",
      inputSchema: z.object({}),
    },
    async () => {
      const names = Object.keys(dynamicTools);
      const text = names.length === 0
        ? "No dynamic tools registered yet."
        : `Registered tools:\n${names.map(n => `- ${n}: ${dynamicTools[n].description}`).join("\n")}`;

      return {
        content: [{ type: "text" as const, text }],
      };
    }
  );

  for (const [toolName, { description, argsSchema, code }] of Object.entries(dynamicTools)) {
    registerDynamicTool(server, toolName, description, argsSchema, code);
  }

  return server;
}

const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  let transport: StreamableHTTPServerTransport;

  try {
    if (sessionId && transports[sessionId]) {
      // Reusar transport existente
      transport = transports[sessionId];
      await transport.handleRequest(req, res, req.body);
      return;
    }

    if (!sessionId && isInitializeRequest(req.body)) {
      // Nueva sesión
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          transports[newSessionId] = transport;
          console.log(`Session created: ${newSessionId}`);
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
          console.log(`Session closed: ${transport.sessionId}`);
        }
      };

      const server = buildServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    }

    res.status(400).json({ error: "Bad request: missing or invalid session" });
  } catch (err) {
    console.error("Transport error:", err); // 👈
    res.status(500).json({ error: String(err) });
  }
});

app.get('/mcp', async (req, res) => {
  console.log('GET /mcp');
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).json({ error: "Invalid session" });
    return;
  }
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
});

loadPersistedTools().then(async () => {
  app.listen(PORT, () => {
    console.log(`Dynamic MCP server running on port ${PORT}`);
  });
});