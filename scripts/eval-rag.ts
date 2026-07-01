import { queryDocuments } from '../app/lib/ddbb/chroma';

const SIMILARITY_THRESHOLD = 0.56;

// Preguntas con el texto esperado que debe aparecer en los resultados
const evalSet = [
  {
    question: '¿Qué es el mecanismo de atención en los Transformers?',
    expectedChunk: 'mecanismo llamado atención',
  },
  {
    question: '¿Cuándo nació oficialmente la inteligencia artificial?',
    expectedChunk: 'conferencia de Dartmouth',
  },
  {
    question: '¿Qué demostró AlexNet en 2012?',
    expectedChunk: 'AlexNet demostró',
  },
  {
    question: '¿Qué son los LLMs?',
    expectedChunk: 'modelos de lenguaje grande',
  },
  {
    question: '¿Quién propuso el Test de Turing?',
    expectedChunk: 'Alan Turing',
  },
];

async function main() {
  let hits = 0;

  console.log('Evaluando RAG...\n');

  for (const { question, expectedChunk } of evalSet) {
    const results = await queryDocuments({
      collectionName: 'documents',
      text: question,
      topK: 3,
    });

    if (question.includes('AlexNet')) {
      console.log('   Scores de AlexNet:');
      results.forEach(r =>
        console.log(`   ${r.similarity?.toFixed(4)} | ${r.text?.slice(0, 60)}`)
      );
    }

    const relevant = results.filter(r => (r.similarity ?? 0) > SIMILARITY_THRESHOLD);
    const found = relevant.some(r =>
      r.text?.toLowerCase().includes(expectedChunk.toLowerCase())
    );

    if (found) hits++;

    console.log(`${found ? '✅' : '❌'} "${question}"`);
    if (!found) {
      console.log(`   Esperaba encontrar: "${expectedChunk}"`);
      console.log(`   Top resultado: "${results[0]?.text?.slice(0, 80)}"`);
      console.log(`   Similitud: ${results[0]?.similarity?.toFixed(4)}`);
    }
  }

  const recall = hits / evalSet.length;
  console.log(`\nRecall@3: ${hits}/${evalSet.length} = ${recall.toFixed(2)}`);

  if (recall === 1) console.log('🟢 Perfecto');
  else if (recall >= 0.7) console.log('🟡 Aceptable');
  else console.log('🔴 Necesita mejoras');
}

main();