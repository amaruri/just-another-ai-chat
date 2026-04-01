import { ChromaClient } from 'chromadb';

const client = new ChromaClient();

async function embed(
  text: string,
  type: 'document' | 'query' = 'document'
): Promise<number[]> {
  const prefix = type === 'document' ? 'search_document' : 'search_query';

  const res = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mxbai-embed-large",
      prompt: `${prefix}: ${text}`,
    }),
  });

  const data = await res.json();
  return data.embedding;
}

async function getCollection(name: string) {
  return client.getOrCreateCollection({
    name,
    embeddingFunction: {
      generate: async (texts: string[]) => {
        // Nunca se llama — nosotros pasamos embeddings manualmente
        return [];
      },
    },
  });
}

export async function addDocument({
  collectionName,
  id,
  text,
  metadata = {},
}: {
  collectionName: string;
  id: string;
  text: string;
  metadata?: Record<string, string>;
}) {
  const collection = await getCollection(collectionName);
  const embedding = await embed(text, 'document');

  await collection.add({
    ids: [id],
    embeddings: [embedding],
    documents: [text],
    metadatas: [metadata],
  });
}

export async function queryDocuments({
  collectionName,
  text,
  topK = 3,
}: {
  collectionName: string;
  text: string;
  topK?: number;
}) {
  const collection = await getCollection(collectionName);
  const embedding = await embed(text, 'query');

  const results = await collection.query({
    queryEmbeddings: [embedding],
    nResults: topK,
    include: ['documents', 'metadatas', 'distances'],
  });

  // Devuelve los textos con su distancia
  return results.documents[0].map((doc, i) => {
    const distance = results.distances?.[0][i] ?? Infinity;

    const similarity = 1 / (1 + distance);

    return {
      text: doc,
      distance,
      similarity,
      metadata: results.metadatas?.[0][i],
    };
  });
}

export async function deleteDocument({
  collectionName,
  id,
}: {
  collectionName: string;
  id: string;
}) {
  const collection = await getCollection(collectionName);
  await collection.delete({ ids: [id] });
}

export async function listDocuments(collectionName: string) {
  const collection = await getCollection(collectionName);
  const result = await collection.get();
  return result.ids.map((id, i) => ({
    id,
    text: result.documents[i],
    metadata: result.metadatas[i],
  }));
}