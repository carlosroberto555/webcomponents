#!/usr/bin/env node
import { loadConfig } from '../lib/config.js';
import { buildJs } from './build-js.js';
import { buildCss } from './build-css.js';

const config = await loadConfig();
await Promise.all([buildJs(config), buildCss(config)]);
