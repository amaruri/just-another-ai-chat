import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({ name: "fetch", version: "1.0.0" });

server.registerTool(
  "fetch",
  {
    description: "Fetch a URL",
    inputSchema: z.object({
      url: z.url(),
    }),
  },
  async ({ url }) => {
    const response = await fetch(url);
    const text = await response.text();

    const truncated = text.slice(0, 8000);
    return {
      content: [{ type: 'text', text: truncated }],
    }
  }
)

const transport = new StdioServerTransport();
server.connect(transport);
