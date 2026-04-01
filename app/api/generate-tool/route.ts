import { generateText } from "ai";
import { createOllama } from "ollama-ai-provider-v2";

const ollama = createOllama({ baseURL: "http://localhost:11434/api" });

export async function POST(req: Request) {
  const { toolName, description } = await req.json();

  const { text } = await generateText({
    model: ollama("qwen3:8b"),
    system: `You are a code generator. Always respond with a valid JSON object only.
      No markdown, no explanation, no backticks. Just the raw JSON.`,
    prompt: `Generate a tool definition for the following:
      Tool name: ${toolName}
      Description: ${description}

      Respond with this exact JSON structure:
      {
        "toolName": "snake_case_name",
        "description": "what it does",
        "argsSchema": {"argName": "number|string"},
        "code": "JS function body that receives (args) and returns a result string"
      }

      Example code for celsius to fahrenheit:
      "code": "return String((args.value * 9/5) + 32)"

      Keep the code simple, pure JS, no imports, no async.`,
  });

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return Response.json({ success: true, tool: parsed });
  } catch {
    return Response.json({ success: false, error: "Failed to parse generated tool" });
  }
}