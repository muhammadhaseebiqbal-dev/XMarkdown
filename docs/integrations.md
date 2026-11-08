# Install and integrate XMarkdown

The showcase uses **our native renderer**. Its static fixtures are built by `createParser()` from the Node entry; edited source is parsed locally by the browser entry. React's live example mounts the exported component. Both entries share `src/core.js`, validators, geometry, expressions, and renderers. Markdown-it processes Markdown, KaTeX processes equations, and saxes tokenizes imported XML. The surrounding website HTML/CSS is only the interface and theme.

## Install today

The npm package is named **`xmarkdown-renderer`**. The name `xmarkdown-renderer` belongs to another publisher.

```sh
npm install xmarkdown-renderer
```

Pin `xmarkdown-renderer@0.2.1` when you need this exact MVP version. Package files include source, declarations, shared CSS, license, README, and changelog, with no showcase/dev dependencies in the runtime payload.

Node.js 22+ is supported. Core dependencies are installed automatically. React is an optional peer: non-React consumers do not need it. TypeScript declarations are included.

For an existing React 18+ application, this is the only package installation command needed. Import the component and shared CSS, then pass XMarkdown source as shown below. Your application bundles the renderer and uses its usual hosting workflow. The [showcase deployment guide](deployment.md) covers hosting this repository's demo and optional HTTP bridge; it is separate from integrating the library.

## Entry points

| Export | Environment | API |
| --- | --- | --- |
| `xmarkdown-renderer` | Node | Synchronous `createParser().parse(source)` and streaming |
| `xmarkdown-renderer/browser` | Browser bundler | Asynchronous `await parser.parse(source)`; shared core |
| `xmarkdown-renderer/react` | React 18+ | `<XMarkdown source={source} />` or a parsed `document` |
| `xmarkdown-renderer/widgets` | Browser | `mountWidgets(container)` for parsed markup |
| `xmarkdown-renderer/frame` | Browser/Node | Trusted CSP document wrapper for isolated previews |
| `xmarkdown-renderer/styles.css` | CSS bundler | Shared base graphic/widget styles; host may override |

## React and Vite

```sh
npm install xmarkdown-renderer
```

```jsx
import React, { useState } from 'react';
import { XMarkdown } from 'xmarkdown-renderer/react';
import 'xmarkdown-renderer/styles.css';

export const initialSource = String.raw`# Team capacity report

This is **XMarkdown inside React**: prose, a chart, math, and a live control.

~~~x-chart
{
  "type": "bar",
  "title": "Requests per day",
  "description": "Monday 24; Tuesday 31; Wednesday 28.",
  "x": "day",
  "y": "requests",
  "data": [
    {"day": "Mon", "requests": 24},
    {"day": "Tue", "requests": 31},
    {"day": "Wed", "requests": 28}
  ]
}
~~~

For the queue model, stable arrival requires $\lambda < \mu$.

~~~x-widget
{
  "type": "controls",
  "title": "Try the arrival rate",
  "description": "Move the slider to compare arrival with a capacity of 100.",
  "inputs": [{"id": "rate", "label": "Requests per minute", "type": "range", "min": 0, "max": 180, "value": 80}],
  "outputs": [{"id": "status", "label": "Queue", "expr": "rate <= 100 ? 'within capacity' : 'queue grows'"}]
}
~~~

:::tip[Try an edit]
Change a chart value in the editor, or move the rendered slider.
:::
`;

export default function ReportDemo() {
  const [source, setSource] = useState(initialSource);
  const [diagnostics, setDiagnostics] = useState([]);
  const [error, setError] = useState(null);

  return (
    <section className="react-quickstart">
      <label htmlFor="report-source">Edit the XMarkdown document</label>
      <textarea id="report-source" rows={14} value={source}
        onChange={event => setSource(event.target.value)} />

      {error && <p role="alert">{error.message}</p>}
      {diagnostics.map((item, index) => (
        <p role="status" key={index}>Line {item.line}: {item.message}</p>
      ))}

      <XMarkdown source={source} className="xmarkdown react-native"
        onDiagnostics={items => { setDiagnostics(items); setError(null); }}
        onError={cause => { setError(cause); setDiagnostics([]); }} />
    </section>
  );
}
```

Copy the complete example into `App.jsx` in an existing React/Vite project. `initialSource` is a real XMarkdown document: the chart renders automatically, the math becomes MathML, and moving the slider changes the queue output. Editing the textarea updates the document through the native browser parser. Tilde fences are standard Markdown and avoid escaping backticks inside the JavaScript template literal; backtick fences work too. `String.raw` preserves TeX backslashes.

Source parsing starts in an effect on the client. Optional math/XML modules are dynamically imported when source needs them. Shared widget behavior mounts automatically. Keep the `options` object stable if supplied, so normal React rerenders can reuse its parser/cache. The host controls themes; no remote CSS/assets are fetched by the document renderer. [Try this component and the larger fixtures live](https://xmarkdown-zeta.vercel.app/integrations/react.html).

### Why the CSS import exists

Import `xmarkdown-renderer/styles.css` once at your application entry, or once in this component module. It supplies shared chart, diagram, callout, table, and widget styles. These rules belong to the installed renderer; document authors do not include CSS in each XMarkdown document. This is the same kind of setup used by other styled React libraries.

The renderer emits semantic HTML/SVG/MathML without the stylesheet too, but the presentation is incomplete. A host that supplies equivalent styles may omit the default file. Automatic CSS injection is not used, keeping stylesheet loading explicit for server rendering, content security policies, and host themes. The current showcase bundles the shared stylesheet at about 0.75 kB gzip; the browser parser and optional processors are much larger costs. The site theme and React demo are separate assets.

## Next.js App Router

Parse once on the server and pass the serializable result to the client component:

```jsx
// app/report/page.jsx — server component
import { createParser } from 'xmarkdown-renderer';
import { XMarkdown } from 'xmarkdown-renderer/react';
import 'xmarkdown-renderer/styles.css';

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
import { createParser } from 'xmarkdown-renderer/browser';
import { mountWidgets } from 'xmarkdown-renderer/widgets';
import 'xmarkdown-renderer/styles.css';

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

Use `xmarkdown-renderer/browser` to parse, render the returned HTML into a container owned by the framework, then call `mountWidgets` after its DOM update. Svelte's `{@html result.html}` and Vue's `v-html` have the same trust requirement: only parser-generated output. Angular's normal HTML sanitizer may remove SVG/MathML or widget attributes; an isolated preview frame avoids framework markup rewriting and preserves the renderer profile. A dedicated Angular adapter is not shipped.

For plain JavaScript:

```js
import { createParser } from 'xmarkdown-renderer/browser';
import { mountWidgets } from 'xmarkdown-renderer/widgets';
import 'xmarkdown-renderer/styles.css';

const parser = createParser();
const result = await parser.parse(source);
container.innerHTML = result.html;
if (result.assets.modules.includes('widgets')) mountWidgets(container);
```

## Browser loading and streaming

Browser imports assume a bundler that resolves npm packages. The showcase uses esbuild ESM splitting; Vite/Webpack/Next can resolve these entry points too. This MVP does not ship a standalone CDN/global bundle. Browser parsing is asynchronous only for processor preparation; core work runs on the main thread. A cancellable worker distribution remains planned.

```js
const parser = createParser(); // imported from xmarkdown-renderer/browser
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
