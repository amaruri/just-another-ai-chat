async function embed(text: string): Promise<number[]> {
  const res = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'mxbai-embed-large', prompt: text }),
  });
  const data = await res.json();
  return data.embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

async function main() {
  const base = "search_document: mi cumpleaños es el 29 de febrero";

  const comparisons = [
    "search_query: cuando es mi fecha de nacimiento",
    "search_query: que dia naci",
    "search_query: cual es tu color favorito",
    "search_query: el clima en cdmx",
  ];

  // const base = "search_document: my birthday is february 29th";

  // const comparisons = [
  //   "search_query: when is my date of birth",
  //   "search_query: what day was I born",
  //   "search_query: what is your favorite color",
  //   "search_query: the weather in mexico city",
  // ];

  const baseEmbedding = await embed(base);

  console.log(`Base: "${base}"\n`);

  for (const text of comparisons) {
    const embedding = await embed(text);
    const similarity = cosineSimilarity(baseEmbedding, embedding);
    console.log(`"${text}"`);
    console.log(`  similitud: ${similarity.toFixed(4)}`);
    console.log(`  ${similarity > 0.7 ? '🟢 cercano' : similarity > 0.5 ? '🟡 medio' : '🔴 lejano'}\n`);
  }
}

main();