#!/usr/bin/env node
import { watch } from 'fs';
import { extname } from 'path';
import liveServer from 'live-server';
import { loadConfig } from '../lib/config.js';
import { log } from '../lib/utils.js';
import { buildJs } from './build-js.js';
import { buildCss } from './build-css.js';

const config = await loadConfig();

await Promise.all([buildJs(config), buildCss(config)]);

const { port } = config.devServer;
liveServer.start({ port, root: '.', open: true, logLevel: 0 });
log(`Live server running at http://localhost:${port}`);

watch(config.componentsDir, async (_, filename) => {
  if (!filename) return;
  if (extname(filename) === '.js') await buildJs(config);
  if (extname(filename) === '.css') await buildCss(config);
});
