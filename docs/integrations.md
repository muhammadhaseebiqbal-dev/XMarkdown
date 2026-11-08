# Install and integrate XMarkdown

The showcase uses **our native renderer**. Its static fixtures are built by `createParser()` from the Node entry; edited source is parsed locally by the browser entry. React's live example mounts the exported component. Both entries share `src/core.js`, validators, geometry, expressions, and renderers. Markdown-it processes Markdown, KaTeX processes equations, and saxes tokenizes imported XML. The surrounding website HTML/CSS is only the interface and theme.

## Install today

The source package is ready to install from GitHub. It has not been published to the npm registry; do not assume `npm install xmarkdown` resolves this project.

```sh
npm install github:muhammadhaseebiqbal-dev/XMarkdown
```

For reproducible production use, pin a verified release tag or commit, for example `github:muhammadhaseebiqbal-dev/XMarkdown#v0.2.0` once that tag exists. A repository clone can also produce a distributable archive with `npm pack`; install the resulting `.tgz`. Package files include source, declarations, shared CSS, license, README, and changelog, with no showcase/dev dependencies in the runtime payload.

Node.js 22+ is supported. Core dependencies are installed automatically. React is an optional peer: non-React consumers do not need it. TypeScript declarations are included.

## Entry points

| Export | Environment | API |
| --- | --- | --- |
| `xmarkdown` | Node | Synchronous `createParser().parse(source)` and streaming |
| `xmarkdown/browser` | Browser bundler | Asynchronous `await parser.parse(source)`; shared core |
| `xmarkdown/react` | React 18+ | `<XMarkdown source={source} />` or a parsed `document` |
| `xmarkdown/widgets` | Browser | `mountWidgets(container)` for parsed markup |
| `xmarkdown/frame` | Browser/Node | Trusted CSP document wrapper for isolated previews |
| `xmarkdown/styles.css` | CSS bundler | Shared base graphic/widget styles; host may override |

## React and Vite

```sh
npm install github:muhammadhaseebiqbal-dev/XMarkdown
```

```jsx
import { XMarkdown } from 'xmarkdown/react';
import 'xmarkdown/styles.css';

export default function Report({ source }) {
  return <XMarkdown source={source}
    onDiagnostics={items => console.log(items)}
    onError={error => console.error(error.message)} />;
}
```

Source parsing starts in an effect on the client. Optional math/XML modules are dynamically imported when source needs them. Shared widget behavior mounts automatically. Keep the `options` object stable if supplied, so normal React rerenders can reuse its parser/cache. The host controls themes; no remote CSS/assets are fetched by the document renderer. See the live React page on the showcase for larger fixtures.

## Next.js App Router

Parse once on the server and pass the serializable result to the client component:

```jsx
// app/report/page.jsx — server component
import { createParser } from 'xmarkdown';
import { XMarkdown } from 'xmarkdown/react';
import 'xmarkdown/styles.css';

export default function Page() {
  const document = createParser().parse('# Report\n\n$E = mc^2$');
  return <XMarkdown document={document} />;
}
```

This renders initial HTML on the server. The client only mounts widgets when required; the browser parser is not imported on the parsed-document path. The Node entry requires the Node runtime, not an Edge runtime. For editable source use the `source` prop instead. These are integration recipes; a complete Next deployment is not part of the verification matrix.

## Vue 3

```vue
<script setup>
import { ref, watch, nextTick } from 'vue';
import { createParser } from 'xmarkdown/browser';
import { mountWidgets } from 'xmarkdown/widgets';
import 'xmarkdown/styles.css';

const props = defineProps({ source: String });
const html = ref('');
const container = ref();
const parser = createParser();
let revision = 0;
watch(() => props.source, async source => {
  const current = ++revision;
  const result = await parser.parse(source || '');
  if (current !== revision) return;
  html.value = result.html;
  await nextTick();
  if (container.value && result.assets.modules.includes('widgets'))
    mountWidgets(container.value);
}, { immediate: true });
</script>
<template><div ref="container" class="xmarkdown" v-html="html" /></template>
```

Add application error/diagnostic handling. `v-html` must receive renderer output, never unparsed source. This is a recipe using the generic browser API; no dedicated Vue component package is claimed.

## Svelte and other browser frameworks

Use `xmarkdown/browser` to parse, render the returned HTML into a container owned by the framework, then call `mountWidgets` after its DOM update. Svelte's `{@html result.html}` and Vue's `v-html` have the same trust requirement: only parser-generated output. Angular's normal HTML sanitizer may remove SVG/MathML or widget attributes; an isolated preview frame avoids framework markup rewriting and preserves the renderer profile. A dedicated Angular adapter is not shipped.

For plain JavaScript:

```js
import { createParser } from 'xmarkdown/browser';
import { mountWidgets } from 'xmarkdown/widgets';
import 'xmarkdown/styles.css';

const parser = createParser();
const result = await parser.parse(source);
container.innerHTML = result.html;
if (result.assets.modules.includes('widgets')) mountWidgets(container);
```

## Browser loading and streaming

Browser imports assume a bundler that resolves npm packages. The showcase uses esbuild ESM splitting; Vite/Webpack/Next can resolve these entry points too. This MVP does not ship a standalone CDN/global bundle. Browser parsing is asynchronous only for processor preparation; core work runs on the main thread. A cancellable worker distribution remains planned.

```js
const parser = createParser(); // imported from xmarkdown/browser
const stream = await parser.stream(); // prepares math/XML once for unknown future input
const { updates } = stream.write(chunk);
const { document } = stream.finish();
```

For full-source parsing, math and XML imports are lazy. A stream prepares both because future features are not yet known. JavaScript runs the same validation and bounded cache in either environment; browser import/painting costs are not covered by the old Node benchmarks. The build emits a bundle-size report at `/assets/bundle-report.json`.

## Python, Go, Rust, Ruby, and other server languages

There is one JavaScript implementation today, not independently ported parsers for every language. Use a local Node service, a serverless endpoint, or build-time rendering. The checked-in `api/render.js` provides a bounded JSON HTTP bridge:

```python
import requests

response = requests.post(
    'https://YOUR_DEPLOYMENT/api/render',
    json={'source': '# Report\n\n$E = mc^2$'}, timeout=10)
response.raise_for_status()
frame_html = response.json()['html']
```

```go
// Encode a struct with json:"source", POST it with application/json,
// check the status, then decode {"html": "...", "diagnostics": [...] }.
```

The example API returns a complete isolated preview document and diagnostics, capped at 32,768 source code units. Host it under your own deployment for private documents. Network latency is an integration cost; it does not make non-JavaScript parsing native. Serve frame assets (`preview.css`, widget module, expression module) under the documented paths, or use the core on a Node service to return fragments for your host.

## Verification matrix

| Integration | Evidence in this repository | Status |
| --- | --- | --- |
| Node package exports | Parser regressions + packed-package install smoke check | Tested |
| Browser engine | HTML parity with Node for complex fixtures and SVG imports; actual showcase edits | Tested |
| React component | Server-rendered document regression; live browser component with controls | Tested |
| TypeScript imports | Strict NodeNext declaration smoke check | Tested |
| Next.js / Vue / Svelte | Recipes built on the same exports | Documented; full framework apps not tested |
| Python/Go/Rust/Ruby bridge | Bounded HTTP endpoint | Bridge pattern; no native ports |

The theme is separable from parsing. For hostile source, use an isolated iframe/process/worker and host budgets; React DOM rendering is not an iframe sandbox. Do not supply hand-authored HTML as a `document` prop or mount widgets on arbitrary author markup. See SECURITY.md for the trust boundary.
