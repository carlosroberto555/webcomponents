#!/usr/bin/env node
import { readFile, writeFile, readdir, unlink } from 'fs/promises';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { loadConfig } from '../lib/config.js';
import { log, minifyCss } from '../lib/utils.js';

export async function buildCss(config) {
  const { cssBundleDir, cssBundleFiles, indexHtml, useHash } = config;

  const parts = await Promise.all(cssBundleFiles.map(f => readFile(f, 'utf8')));
  const css = parts.map(minifyCss).join('');
  const hash = createHash('sha256').update(css).digest('hex').slice(0, 8);
  const filename = useHash ? `bundle.${hash}.min.css` : 'bundle.min.css';
  const outPath = `${cssBundleDir}/${filename}`;

  const stale = (await readdir(cssBundleDir))
    .filter(f => /^bundle\.[a-f0-9]{8}\.min\.css$/.test(f));
  await Promise.all(stale.map(f => unlink(`${cssBundleDir}/${f}`)));

  await writeFile(outPath, css, 'utf8');

  const html = await readFile(indexHtml, 'utf8');
  await writeFile(indexHtml, html.replace(/bundle(\.[a-f0-9]{8})?\.min\.css/, filename), 'utf8');

  log(`Built ${outPath} from: ${cssBundleFiles.map(f => f.split('/').pop()).join(', ')}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const config = await loadConfig();
  await buildCss(config);
}
