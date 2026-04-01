import { deleteDocument, listDocuments } from "../app/lib/ddbb/chroma";


async function main() {
  const docs = await listDocuments('conversations');
  docs.forEach((d) => deleteDocument({ collectionName: 'conversations', id: d.id }));
  console.log('Conversaciones eliminadas ✅');
}

main();