import { listDocuments } from '../app/lib/ddbb/chroma';

async function main() {
  const docs = await listDocuments('conversations');
  docs.forEach((d) => console.log(d.id, '|', d.text?.slice(0, 80)));
}

main();