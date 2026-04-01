import { StdioConfig } from '@ai-sdk/mcp/mcp-stdio';
import path from 'path';

export const projectTmp = path.join(process.cwd(), "tmp");

export const MCP_SERVERS_UI = [
  "filesystem",
  "fetch",
  "dynamicServers",
  // "memory",
] as const;

export type MCPServerName = (typeof MCP_SERVERS_UI)[number];

export const SERVER_ICONS: Record<MCPServerName, string> = {
  filesystem: "📁",
  fetch: "🌐",
  dynamicServers: "🤖",
  // memory: "🧠",
};


export const MCP_SERVERS: Record<MCPServerName, StdioConfig> = {
  filesystem: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", projectTmp],
  },
  fetch: {
    command: "npx",
    args: ["tsx", "app/lib/servers/fetch.ts"],
  },
  dynamicServers: {
    command: "npx",
    args: ["tsx", "app/lib/servers/dynamicServers.ts"],
  },
  // memory: {
  //   command: "npx",
  //   args: ["-y", "@modelcontextprotocol/server-memory"],
  // },
};