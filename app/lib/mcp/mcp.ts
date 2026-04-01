import { createMCPClient } from "@ai-sdk/mcp";
import { Experimental_StdioMCPTransport } from "@ai-sdk/mcp/mcp-stdio";
import { MCP_SERVERS, MCPServerName } from './mcp-config';

export async function createMCPTools(activeServers: MCPServerName[]) {
  const clients = await Promise.all(
    activeServers.map((name) =>
      createMCPClient({
        transport: new Experimental_StdioMCPTransport(MCP_SERVERS[name]),
      })
    )
  );

  const toolSets = await Promise.all(clients.map((c) => c.tools()));

  return {
    tools: Object.assign({}, ...toolSets),
    cleanup: () => Promise.all(clients.map((c) => c.close())),
  };
}