import { ChromaClient } from 'chromadb';

async function main() {
  const client = new ChromaClient();

  const collections = await client.listCollections();

  for (const collection of collections) {
    await client.deleteCollection({ name: collection.name });
    console.log(`✅ Colección ${collection.name} eliminada`);
  }
}

main();