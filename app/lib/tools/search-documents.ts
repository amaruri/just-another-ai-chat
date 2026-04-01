import { tool } from 'ai';
import { z } from 'zod';
import { queryDocuments } from '../ddbb/chroma';

export const searchDocuments = tool({
  description: 'Searches through indexed documents and past conversations using semantic search. Use this when the user asks about something that might have been discussed before or references a document.',
  inputSchema: z.object({
    query: z.string().describe('The search query to find relevant documents or conversations.'),
    collection: z.enum(['documents', 'conversations']).describe('Which collection to search in. Use "documents" for files and "conversations" for past chat history.'),
    topK: z.number().optional().describe('Number of results to return. Defaults to 3.'),
  }),
  execute: async ({ query, collection, topK = 3 }) => {
    try {
      const results = await queryDocuments({
        collectionName: collection,
        text: query,
        topK,
      });

      if (results.length === 0) {
        return { message: 'No relevant documents found.', results: [] };
      }

      return {
        message: `Found ${results.length} relevant results.`,
        results: results.map((r) => ({
          text: r.text,
          metadata: r.metadata,
          relevance: r.distance,
        })),
      };
    } catch (error) {
      return { error: 'Failed to search documents', details: String(error) };
    }
  },
});