import { projectTmp } from './mcp/mcp-config';

export function buildSystemPrompt(activeServers: string[]) {
  const mcpCapabilities = activeServers.map((s) => ({
    filesystem: "reading and writing files",
    fetch: "making HTTP requests and fetching URLs",
    memory: "storing and retrieving information",
  }[s])).filter(Boolean);

  const filesystemInstructions = activeServers.includes("filesystem")
    ? `\nWhen creating or reading files, always use the full path starting with ${projectTmp}. Example: ${projectTmp}/hola.txt`
    : "";

  const fetchInstructions = activeServers.includes("fetch")
    ? `\nWhen fetching URLs, prefer JSON APIs over HTML pages. Summarize the response concisely, do not dump raw data.`
    : "";

  const capabilities = [
    "math calculations",
    "weather",
    "pokemon info",
    "semantic document and conversation search",
    ...mcpCapabilities,
  ].join(", ");

  return `You have access to tools for: ${capabilities}.
    If the user asks for something outside these tools, let them know politely.
    Never use Markdown formatting. No bold, no LaTeX, no bullet points. Plain text only.
    When returning math results, write in plain text: "1337 × 42 = 56154".
    When using get_pokemon_info, present the information as a summary of the pokemon.
    ${filesystemInstructions}
    ${fetchInstructions}
    You have NO memory between conversations.
    If there is a "Context from memory" section in this prompt, those are facts the user has shared before.
    Use them to answer naturally in second person. For example, if the context says "My favorite movie is Interestellar", respond "Your favorite movie is Interestellar".
    Never repeat the context verbatim — always reformulate in second person.
    If the context contains the answer, respond directly and confidently. Do not say you need to search or look up anything.
    If there is no context, say you don't have that information.
    Do not say "I don't have access to personal information" — search first, then answer.`;
}