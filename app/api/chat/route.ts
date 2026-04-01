import { ollama } from 'ollama-ai-provider-v2';
import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { createMCPTools } from "@/app/lib/mcp/mcp";
import { buildSystemPrompt } from '@/app/lib/prompts';
import { calculate } from '@/app/lib/tools/calculate';
import { trigonometry } from '@/app/lib/tools/trigonometry';
import { getWeather } from '@/app/lib/tools/getWeather';
import { getPokemonInfo } from '@/app/lib/tools/getPokemonInfo';
import { getDynamicTools } from '@/app/lib/mcp/mcp-dynamic';
import { searchDocuments } from '@/app/lib/tools/search-documents';
import { addDocument, queryDocuments } from '@/app/lib/ddbb/chroma';
import { isWorthSaving } from '../../lib/worth-saving';

const SIMILARITY_THRESHOLD = 0.72;

export async function POST(req: Request) {
  const { messages, activeServers = [] } = await req.json();

  // Servers normales — proceso nuevo por request (está bien)
  const regularServers = activeServers.filter((s: string) => s !== "dynamicServers");
  const { tools: mcpTools, cleanup } = await createMCPTools(regularServers);

  let systemWithContext = buildSystemPrompt(activeServers);

  const lastUserMessage = messages
    .filter((m: { role: string }) => m.role === 'user')
    .at(-1);

  let userText = '';
  if (lastUserMessage) {
    userText = lastUserMessage.parts
      ?.filter((p: { type: string }) => p.type === 'text')
      ?.map((p: { type: string; text: string }) => p.text)
      ?.join(' ');
  }

  const [docResults, convResults] = await Promise.all([
    queryDocuments({ collectionName: 'documents', text: userText, topK: 3 }),
    queryDocuments({ collectionName: 'conversations', text: userText, topK: 3 }),
  ]);

  // Filtrar por relevancia
  const relevantDocs = docResults.filter(r => r.similarity ?? 0 < SIMILARITY_THRESHOLD);
  const relevantConvs = convResults.filter(r => r.similarity ?? 0 < SIMILARITY_THRESHOLD);

  const ragContext = [
    relevantDocs.length > 0
      ? `Facts from user documents:\n${relevantDocs.map((r) => r.text).join('\n---\n')}`
      : '',
    relevantConvs.length > 0
      ? `Facts the user has shared in past conversations:\n${relevantConvs.map((r) => r.text).join('\n---\n')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  if (ragContext) {
    systemWithContext = `${systemWithContext}\n\nContext from memory:\n${ragContext}`;
    console.log('RAG context inyectado ✅');
  } else {
    console.log('Sin contexto relevante, respondiendo directo');
  }

  // Dynamic server — proceso persistente
  let dynamicTools = {};
  if (activeServers.includes("dynamicServers")) {
    console.log("Dynamic server is active");
    dynamicTools = await getDynamicTools();
  }

  const allTools = {
    calculate,
    trigonometry,
    getWeather,
    getPokemonInfo,
    searchDocuments,
    ...mcpTools,
    ...dynamicTools,
  };

  console.log('systemWithContext', systemWithContext);

  const result = streamText({
    model: ollama('qwen3:8b'),
    maxOutputTokens: 1200,
    messages: await convertToModelMessages(messages),
    system: systemWithContext,
    stopWhen: [
      stepCountIs(5),
    ],
    tools: allTools,
    onFinish: async ({ text }) => {
      await cleanup();

      // Guardar la conversación en Chroma
      if (text && text.trim().length > 0) {
        const lastUserMessage = messages
          .filter((m: { role: string }) => m.role === 'user')
          .at(-1);

        console.log('lastUserMessage', lastUserMessage);

        if (lastUserMessage) {
          const userText = lastUserMessage.parts
            .filter((p: { type: string }) => p.type === 'text')
            .map((p: { type: string; text: string }) => p.text)
            .join(' ');

          const worthSaving = await isWorthSaving(userText);

          if (!worthSaving) {
            console.log('Conversación no es relevante, no se guardará');
            return;
          }

          await addDocument({
            collectionName: 'conversations',
            id: `conv-${Date.now()}`,
            text: userText,
            metadata: {
              type: 'conversation',
              date: new Date().toISOString(),
            },
          });

          console.log('Conversación guardada ✅');
        }
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
