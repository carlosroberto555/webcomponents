#!/usr/bin/env node
import { readFile, writeFile, readdir } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { minify } from 'terser';
import { loadConfig } from '../lib/config.js';
import { log } from '../lib/utils.js';
import { extractRegistrations, processTemplates } from '../lib/ast.js';

export async function buildJs(config) {
  const { componentsDir, jsOutFile } = config;

  const files = (await readdir(componentsDir))
    .filter(f => extname(f) === '.js')
    .sort();

  const concatenated = (await Promise.all(
    files.map(f => readFile(join(componentsDir, f), 'utf8'))
  )).join('\n');

  const source = processTemplates(concatenated) + extractRegistrations(concatenated);

  const result = await minify(source, {
    compress: true,
    mangle: true,
    format: { comments: false },
  });

  await writeFile(jsOutFile, result.code, 'utf8');
  log(`Built ${jsOutFile} (${result.code.length} bytes) from: ${files.join(', ')}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const config = await loadConfig();
  await buildJs(config);
}
