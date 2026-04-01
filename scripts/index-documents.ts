// scripts/index-documents.ts
import { addDocument } from '../app/lib/ddbb/chroma';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

async function main() {
  const tmpDir = join(process.cwd(), 'tmp');
  const files = await readdir(tmpDir);

  console.log(`Encontrados ${files.length} archivos en tmp/`);

  for (const file of files) {
    const filePath = join(tmpDir, file);
    const text = await readFile(filePath, 'utf-8');

    await addDocument({
      collectionName: 'documents',
      id: `file-${file}`,
      text,
      metadata: {
        type: 'document',
        filename: file,
        indexedAt: new Date().toISOString(),
      },
    });

    console.log(`✅ Indexado: ${file}`);
  }

  console.log('Listo.');
}

main();