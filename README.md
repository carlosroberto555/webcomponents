# @carlosroberto555/webcomponents

Build tooling for bundling, minifying, and serving web components.

## Scripts

| Command | Description |
|---|---|
| `npm run build` | Bundle JS components and CSS once |
| `npm run dev` | Build, watch for changes, and start a live-reload server |

Individual scripts can also be run directly:

```sh
node scripts/build-js.js   # JS only
node scripts/build-css.js  # CSS only (accepts --hash flag)
node scripts/build.js      # both
node scripts/dev.js        # build + watch + live server
```

Pass `--hash` to append a content hash to the CSS output filename (e.g. `bundle.a1b2c3d4.min.css`).

## Configuration

Create a `wc.config.js` at your project root to override defaults:

```js
// wc.config.js
export default {
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
```

All fields are optional — any omitted field falls back to the defaults above.

## Components

Each `.js` file in `componentsDir` should define a class that extends `HTMLElement` with a static `tagName` property. Registration calls (`customElements.define`) are injected automatically at bundle time.

```js
class MyButton extends HTMLElement {
  static tagName = 'my-button';

  connectedCallback() {
    this.innerHTML = html`<button>${this.textContent}</button>`;
  }
}
```

Use the `html` tagged template literal to strip indentation whitespace from inline templates before minification.

## Local usage

```sh
# in this repo
npm link

# in a consuming project
npm link @carlosroberto555/webcomponents
```
