import { getDynamicMCPClient } from "@/app/lib/mcp/mcp-dynamic";

export async function POST(req: Request) {
  const { toolName, description, argsSchema, code } = await req.json();

  try {
    const client = await getDynamicMCPClient();

    // Llama al register_tool del MCP server dinámico
    await client.callTool({
      name: "register_tool",
      arguments: {
        toolName,
        description,
        argsSchema: JSON.stringify(argsSchema),
        code,
      },
    });

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("register-tool error:", err);
    return Response.json({ success: false, error: err.message });
  }
}