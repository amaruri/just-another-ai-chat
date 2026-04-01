// scripts/test-chroma.ts
import { addDocument, queryDocuments } from "../app/lib/ddbb/chroma";

async function main() {
  console.log("Indexando documentos...");

  await addDocument({
    collectionName: "test",
    id: "doc-1",
    text: "El usuario configuró el servidor MCP en el puerto 3001",
    metadata: { type: "conversation", date: "2026-03-25" },
  });

  await addDocument({
    collectionName: "test",
    id: "doc-2",
    text: "Se registró una tool dinámica llamada calculate",
    metadata: { type: "conversation", date: "2026-03-25" },
  });

  await addDocument({
    collectionName: "test",
    id: "doc-3",
    text: "El clima en Ciudad de México estaba nublado",
    metadata: { type: "conversation", date: "2026-03-25" },
  });

  console.log("Buscando...");

  const results = await queryDocuments({
    collectionName: "test",
    text: "cómo configuré el servidor",
    topK: 3,
  });

  console.log(JSON.stringify(results, null, 2));
}

main();