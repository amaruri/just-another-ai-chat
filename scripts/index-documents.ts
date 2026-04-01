// scripts/index-documents.ts
import { addDocument } from '../app/lib/ddbb/chroma';
import { chunkText } from '../app/lib/chunker';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

async function main() {
  const tmpDir = join(process.cwd(), 'tmp');
  const files = await readdir(tmpDir);

  console.log(`Encontrados ${files.length} archivos en tmp/`);

  for (const file of files) {
    const filePath = join(tmpDir, file);
    const text = await readFile(filePath, 'utf-8');
    const chunks = chunkText({ text, chunkSize: 200, overlap: 50 });

    console.log(`\n📄 ${file} → ${chunks.length} chunks`);

    for (const chunk of chunks) {
      await addDocument({
        collectionName: 'documents',
        id: `file-${file}-chunk-${chunk.index}`,
        text: chunk.text,
        metadata: {
          type: 'document',
          filename: file,
          indexedAt: new Date().toISOString(),
        },
      });

      console.log(`  ✅ chunk ${chunk.index}: palabras ${chunk.start}-${chunk.end}`);
    }

    console.log(`✅ Indexado: ${file}`);
  }

  console.log('Listo.');
}

main();