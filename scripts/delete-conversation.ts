import { deleteDocument } from "../app/lib/ddbb/chroma";

async function main(id: string) {
  await deleteDocument({ collectionName: 'conversations', id });
  console.log('Conversación eliminada ✅');
}

main(process.argv[2]);