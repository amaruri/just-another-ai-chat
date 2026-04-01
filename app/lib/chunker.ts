export interface Chunk {
  text: string;
  index: number;
  start: number;
  end: number;
}

export function chunkText({
  text,
  chunkSize = 200,
  overlap = 50,
}: {
  text: string;
  chunkSize?: number;
  overlap?: number;
}): Chunk[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: Chunk[] = [];
  let i = 0;
  let index = 0;

  while (i < words.length) {
    const end = Math.min(i + chunkSize, words.length);
    const chunkWords = words.slice(i, end);
    const chunkText = chunkWords.join(' ');

    chunks.push({
      text: chunkText,
      index,
      start: i,
      end,
    });

    if (end === words.length) break;

    i += end - overlap;
    index++;
  }

  return chunks;
}
