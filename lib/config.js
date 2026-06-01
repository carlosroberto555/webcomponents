import { pathToFileURL } from 'url';
import { join } from 'path';

const defaults = {
  componentsDir: './assets/components',
  jsOutFile: './assets/js/components.min.js',
  cssBundleDir: './assets/css',
  cssBundleFiles: [
    './assets/css/style.slim.css',
    './assets/components/components.css',
  ],
  indexHtml: './index.html',
  devServer: { port: 8080 },
};

export async function loadConfig() {
  let fileConfig = {};
  try {
    const configUrl = pathToFileURL(join(process.cwd(), 'wc.config.js')).href;
    const mod = await import(configUrl);
    fileConfig = mod.default ?? {};
  } catch {
    // no config file — use defaults
  }

  return {
    ...defaults,
    ...fileConfig,
    devServer: { ...defaults.devServer, ...(fileConfig.devServer ?? {}) },
    useHash: process.argv.includes('--hash'),
  };
}
