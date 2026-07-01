import { queryDocuments } from '../app/lib/ddbb/chroma';

async function main() {
  const results = await queryDocuments({
    collectionName: 'documents',
    text: 'AlexNet redes neuronales profundas reconocimiento imagenes',
    topK: 3,
  });

  console.log(JSON.stringify(results, null, 2));
}

main();