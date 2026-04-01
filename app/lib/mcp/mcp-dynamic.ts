import { createMCPClient } from '@ai-sdk/mcp';
import { Experimental_StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio';
import { Client } from '@modelcontextprotocol/sdk/client';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const MCP_URL = new URL('http://localhost:3001/mcp');

let mcpSdkClient: Client | null = null;

export async function getDynamicMCPClient() {
  if (!mcpSdkClient) {
    mcpSdkClient = new Client({ name: 'mcp-dynamic-tools', version: '1.0.0' });
    await mcpSdkClient.connect(new StreamableHTTPClientTransport(MCP_URL));
  }
  return mcpSdkClient;
}

export async function getDynamicTools() {
  const client = await createMCPClient({
    transport: new StreamableHTTPClientTransport(MCP_URL),
  });
  const tools = await client.tools();
  return tools;
}