# XMarkdown

**Markdown for reports that need charts, math, controls, and SVG.** Write familiar prose and structured visual data; use one shared renderer in Node, the browser, or React.

[![CI](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/actions/workflows/ci.yml/badge.svg)](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-d8ee91)](LICENSE)
[![Stage: MVP](https://img.shields.io/badge/stage-MVP%200.2.0-d8ee91)](CHANGELOG.md)

[**Live showcase & playground →**](https://xmarkdown-zeta.vercel.app) · [Syntax reference](docs/extended-capabilities.md) · [Architecture](docs/parser-architecture.md) · [All examples](comparison/samples.md) · [Roadmap](docs/status.md)

XMarkdown lets an author describe content and visual meaning while a shared renderer supplies layout, geometry, styles, and supported interactions. HTML, SVG, and MathML remain rendering targets. The Markdown core is **markdown-it**, with custom extensions; this repository does not introduce a replacement CommonMark parser.

Use it for generated reports, technical explanations, and documents with supported interactive graphics. For plain prose, standard Markdown is simpler. Existing Markdown plugin stacks may already meet your needs; XMarkdown's value is one consistent document profile and renderer. [Compare the tradeoffs](docs/ground-reality.md).

**Release status:** First public integration MVP, version 0.2.0. The synchronous Node API runs on Node.js 22+. The async browser entry and React component share its native core. The package is **installable from GitHub**, with TypeScript declarations, but is **not published to npm**. APIs and schemas may change before 1.0. See [compatibility policy](docs/compatibility.md).

## Install

```sh
npm install github:muhammadhaseebiqbal-dev/XMarkdown#v0.2.0
```

Copy this complete example into `App.jsx` in an existing React project. It includes a chart, math, an interactive slider, editable source, and diagnostic handling. [Try the same component live](https://xmarkdown-zeta.vercel.app/integrations/react.html).

<details>
<summary><strong>Complete React example with real XMarkdown source</strong></summary>

```jsx
import React, { useState } from 'react';
import { XMarkdown } from 'xmarkdown/react';
import 'xmarkdown/styles.css';

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

The CSS import supplies the renderer's shared styles once for the app; each document contains only XMarkdown. `String.raw` preserves TeX backslashes, and standard tilde fences keep the JavaScript template literal readable.

</details>

[Complete Node/browser/React/Next/Vue integration guide](docs/integrations.md). The GitHub package name is `xmarkdown`; plain `npm install xmarkdown` is not a verified registry installation path for this project.

## Try it

Explore [the dark showcase](https://xmarkdown-zeta.vercel.app): eighteen rendered examples, including layered architecture, capacity planning, rollback workflows, advanced equations, and a combined report, XMarkdown/HTML source views, token measurements, downloadable sources, a two-input control, and an editable playground using the native browser renderer.

```sh
git clone https://github.com/muhammadhaseebiqbal-dev/XMarkdown.git
cd XMarkdown
npm ci
npm test
npm run build
npm run site
```

The showcase runs at <http://127.0.0.1:4320>. The original development playground is available with `npm run demo` at <http://127.0.0.1:4317>; `/extended` demonstrates all extensions and local SVG file import, and `/compare` shows the source comparison gallery.

## What stays familiar, and what changes

Headings, paragraphs, emphasis, lists, blockquotes, links, code fences, tables, and strikethrough keep their usual syntax. New constructs are opt-in directives, math delimiters, and named code fences. There is no wholesale syntax replacement.

The rendering profile intentionally changes some inherited behaviors: author HTML is escaped, Markdown images show alt text without fetching resources, unsafe link schemes are blocked, automatic linkification is disabled, and nesting is bounded. This is not a claim of full CommonMark/GFM conformance. Task-list checkboxes and Mermaid rendering are not implemented.

| Capability | Original Markdown / reused core | XMarkdown MVP addition | Current limit |
| --- | --- | --- | --- |
| Prose, lists, quotes, links, code | Preserved through markdown-it | Checked links; bounded profile | Raw HTML escaped; images show alt text |
| Tables and strikethrough | markdown-it extensions | Retained | No cell spanning or custom table controls |
| Callouts | Not in original Markdown | `:::note`, `:::tip`, `:::warning` | Known kinds; optional text title |
| Charts | Code/source only | `x-chart` → SVG | Categorical bar/line, up to 256 rows |
| Directed diagrams | Code/source only | `x-diagram` → SVG | Basic placement; 32 nodes, 128 edges |
| Mathematics | Usually requires an adapter | `$…$`, display `$$`, `x-math` | Bounded TeX; native MathML via KaTeX |
| Calculated controls | Usually requires HTML/JS | `x-widget` controls | Range/number/select/toggle; bounded expressions |
| Drawing | Usually requires HTML/JS | `x-widget` draw | SVG strokes, undo/clear; 8,192 points |
| Vector scenes | Usually embedded SVG/HTML | `x-svg` scene tuples | Paths, groups, gradients, clips, masks, symbols |
| Existing SVG imports | Usually embedded raw markup | `x-svg` checked markup | Static subset; 512 nodes, depth 16 |
| Streamed output | Common hosts reparse prefixes | Provisional sections + final parse | Final parse restores document-wide correctness |

## Implementation and provenance matrix

These processors are reused as dependencies; they were not rewritten or claimed as original XMarkdown processors.

| Component | Origin | What XMarkdown implements |
| --- | --- | --- |
| Markdown blocks, inline syntax, tokenization | [markdown-it](https://github.com/markdown-it/markdown-it), 15.0.3 on main; 14.3.3 in v0.2.0 | Configuration, directives, math/fence dispatch, link/image policy |
| TeX processing | [KaTeX 0.19.1](https://github.com/KaTeX/KaTeX), loaded on first use | Bounded inputs, trust disabled, MathML output and cache |
| XML/SVG import tokenization | [saxes 6.0.0](https://github.com/lddubeau/saxes), loaded on first use | Element/attribute profile, references, bounds, scene validation |
| Chart and graph geometry | Custom JavaScript | Schemas, basic layout, accessible labels, SVG templates |
| Scene rendering | Custom JavaScript | Tuple schema, paths/references, validated SVG output |
| Control expressions | Custom JavaScript | Bounded parser/interpreter; no `eval`, programs, property access |
| Browser widgets | Custom JavaScript | Shared input updates, SVG drawing, undo/clear |
| Streaming and cache | Custom JavaScript | Bounded provisional work, final parse, reuse, ID rewriting/eviction |
| Token measurement | [js-tiktoken 1.0.21](https://github.com/dqbd/tiktoken) | Named encoding comparisons and checked-in reports |
| Showcase | Custom static HTML/CSS/ESM + native browser parser | Pre-rendered examples, native edits, React integration, bounded HTTP bridge |

## Accomplishment matrix

| Area | Delivered in this MVP | Evidence | Remaining work |
| --- | --- | --- | --- |
| Syntax and API | Markdown + extension families | [API](docs/parser-architecture.md), [syntax](docs/extended-capabilities.md), tests | Stable normalized AST; conformance corpus |
| Rich rendering | Charts, graphs, equations, controls, drawing, scenes/imports | [Extended example](examples/extended.md), live examples | Better graph routing; additional chart types |
| Efficiency | Optional adapters/runtime; bounded cache; streamed sections | [Feature measurements](benchmark/features-report.md) | Worker package; real AI trials |
| Source comparison | Twelve measured X/HTML examples, two tokenizers | [Report](comparison/report.md), [JSON](comparison/results.json) | Capability-matched model evaluations |
| Validation | Input budgets, checked SVG/expressions/links; escaped fallback | [Tests](test), [security policy](SECURITY.md) | Fuzzing, independent review, isolation |
| Developer experience | Local demos, hosted editor, downloadable snippets, docs | [Showcase](https://xmarkdown-zeta.vercel.app), [examples](examples) | npm registry release and framework app coverage |
| Maintenance | CI, policies, templates, changelog | [.github](.github), [CONTRIBUTING](CONTRIBUTING.md) | Maintainer review and release cadence |

## Examples: easy to difficult

Ordinary Markdown and a callout:

````markdown
# A release worth reading

Keep the **idea** in the document.

:::tip[Authoring]
Describe the visual with data, then reuse the renderer.
:::
````

A chart — geometry and axes are supplied by the renderer:

````markdown
```x-chart
{"type":"bar","title":"Requests per day","description":"Monday 24; Tuesday 31.","x":"day","y":"requests","data":[{"day":"Mon","requests":24},{"day":"Tue","requests":31}]}
```
````

A directed graph:

````markdown
```x-diagram
{"title":"Request pipeline","description":"Validate before storing.","nodes":[{"id":"validate","label":"Validate"},{"id":"store","label":"Store"}],"edges":[["validate","store"]]}
```
````

Math and a calculated control:

````markdown
Energy: $E = mc^2$.

```x-widget
{"type":"controls","title":"Capacity check","description":"Move the slider to test capacity.","inputs":[{"id":"rate","label":"Requests per minute","type":"range","min":0,"max":180,"value":80}],"outputs":[{"id":"status","label":"Queue","expr":"rate <= 100 ? 'capacity is sufficient' : 'queue grows'"}]}
```
````

Drawing uses a known widget rather than an author program:

````markdown
```x-widget
{"type":"draw","title":"Sketch an idea","description":"Drag to draw. Undo and clear are available.","width":640,"height":320,"color":"#2563eb","lineWidth":3}
```
````

A compact vector scene uses `[tag, attributes, ...children]` tuples:

````markdown
```x-svg
{"title":"A curve","description":"A simple vector path.","viewBox":[0,0,320,120],"children":[["path",{"d":"M20 90C90 0 230 0 300 90","fill":"none","stroke":"#38bdf8","stroke-width":4}]]}
```
````

Existing SVG is also accepted **inside an `x-svg` fence**, checked against the static import profile. See [the artwork](examples/artwork.svg), [complex scene and import](examples/extended.md), and [all twelve XMarkdown/HTML pairs](comparison/samples.md).

“Impossible” applications are not made universally expressible by this format. The MVP covers several previously unsupported document tasks through trusted widgets and vector scenes. Unrestricted UI design, author JavaScript, external assets, SVG animation/filters, and arbitrary application logic remain outside the profile.

## Parser API and browser integration

```js
import { createParser } from './src/index.js';

const parser = createParser();
const result = parser.parse('# Hello\n\nCompact **Markdown**.');
console.log(result.html, result.diagnostics, result.assets);

const stream = parser.stream();
for (const chunk of chunksFromYourModel) {
  const { updates } = stream.write(chunk);
  // Apply update.html as provisional sections in your UI.
}
const { document, stats } = stream.finish();
// Replace provisional content with document.html once at completion.
```

Results include source, markdown-it tokens, diagnostics, HTML, environment, and asset requirements. Widgets appear in `result.assets.modules` only when needed. Disable caching with `cacheEntries: 0`, inspect `parser.cacheStats()`, or call `parser.clearCache()`.

For integrations installing the source package locally, exports are `xmarkdown` and `xmarkdown/widgets`. Mount shared widget code only in parser-generated markup:

```js
if (result.assets.modules.includes('widgets')) {
  const { mountWidgets } = await import('xmarkdown/widgets');
  mountWidgets(documentContainer);
}
```

The showcase pre-renders fixtures with the Node entry and uses the same parser locally through `xmarkdown/browser` for edits. The browser wrapper prepares optional processors asynchronously, then runs the same core. A separate `/api/render` bridge remains available for non-JavaScript hosts. Preview frames allow trusted widget scripts and omit `allow-same-origin`; author source is not executed as code. The endpoint caps source at 32,768 code units and does not log/persist documents in application code. Hosting providers may retain ordinary access metadata.

## Performance: what was actually measured

These checked-in measurements describe the v0.2.0 implementation using markdown-it 14.3.3. Main now uses 15.0.3 after a tested dependency upgrade; these are not new benchmarks for that version.

There is **no universal 50× batch-parsing improvement**. XMarkdown delegates normal parsing to markdown-it and adds validation/rendering work. Some batch workloads are slower. Streaming gains come from avoiding repeated full-prefix parsing.

| Measurement | Observed local result | Interpretation |
| --- | ---: | --- |
| Original demo source | 839 UTF-8 bytes / 208 o200k_base tokens | Same fixture as the original demo |
| Compact HTML/SVG | 3,492 bytes / 1,219 tokens | X source uses 82.9% fewer tokens |
| Shared-component HTML | 1,044 bytes / 261 tokens | X source uses 20.3% fewer tokens |
| Raw SVG import example | 225 X tokens / 219 HTML tokens | Fence overhead adds 2.7% |
| Plain full render, 6,320-character source | markdown-it 0.259 ms; X 0.268 ms | X adds overhead |
| Extended empty-cache parse + render | 0.652 ms | Dependencies already loaded |
| Extended cache disabled / cached render | 0.508 ms / 0.075 ms | Cache overhead versus exact reuse |
| Extended streamed render vs repeated prefixes | 5.48× | Synthetic local streaming workload |
| Long-prose streamed parse vs repeated prefixes | 64.20× | Separate parse-only workload; rendering excluded |

These are local measurements, not service-level promises. First-use math/XML dependencies add latency. Browser layout/painting, model generation, billing, repair rates, and reader studies are unmeasured. Named local encodings are not current Claude usage. The format guide adds 383 o200k_base tokens when supplied and is excluded from output-fragment savings; shared runtime code is excluded on both sides.

```sh
npm run bench
npm run bench:features
npm run compare
```

[Parser benchmark](benchmark/report.md) · [Feature benchmark](benchmark/features-report.md) · [Token comparison](comparison/report.md) · [Evaluation plan](docs/evaluation-plan.md)

## Security and resource profile

SVG scripts, event attributes, `foreignObject`, external resources, CSS stylesheets/classes, DTDs, animation, and filters are rejected. References stay local and validated. Mathematical trust is disabled. Widget expressions cannot run programs or access properties. Invalid graphic content produces diagnostics and an escaped-source fallback.

Limits bound source/graphic sizes, nodes/depth/expansion, tokens, output, expressions, and drawing points. These are **not hard CPU/memory isolation**; hostile-input applications need their own isolation, resource/time, and network policies. No independent audit has been completed. See [SECURITY.md](SECURITY.md) and [exact limits](docs/extended-capabilities.md).

## Repository structure

```text
src/           Parser, validators, renderers, streaming/cache, browser widgets
test/          Parser and extension regressions
examples/      Source documents and SVG artwork
demo/          Original playground and shared fixtures
comparison/    Complete X/HTML sources, token counts and gallery
benchmark/     Reproducible workloads and reports
website/       Static showcase builder, browser UI and local server
api/           Bounded hosted playground endpoint
docs/          Architecture, syntax, research, status and compatibility
.github/       CI, dependency updates and issue/PR templates
```

## Development and deployment

| Command | Purpose |
| --- | --- |
| `npm test` | Parser, validation, cache and streaming regressions |
| `npm run build` | Build showcase, examples and documentation into `dist/` |
| `npm run check:site` | Verify examples/downloads and local links |
| `npm run site` | Serve showcase and rendering API locally |
| `npm run demo` | Original authoring/import/comparison playground |
| `npm run compare` | Regenerate representation reports |
| `npm run bench` / `npm run bench:features` | Regenerate workload measurements |

CI covers Node.js 22 and 24, native browser/Node parity, React server markup, package exports, and strict TypeScript imports. Vercel settings are committed in `vercel.json`; deploy with `vercel --prod` in an authenticated existing scope. Do not commit `.vercel/`, environment files, credentials, or private documents. See [deployment guide](docs/deployment.md).

## Roadmap and maintenance

Next priorities: conformance/fuzzing, a stable versioned document model, a cancellable worker distribution, better graph routing and accessible data tables, then capability-matched AI and reader evaluations. Mermaid, task lists, controlled images, and more chart types need explicit decisions and evidence. See [status and roadmap](docs/status.md).

Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes. Report vulnerabilities privately through [SECURITY.md](SECURITY.md). User-visible changes go in [CHANGELOG.md](CHANGELOG.md). Source is licensed under [MIT](LICENSE); dependency licenses remain with their authors.

## Ground reality

Markdown readability depends on theme and host. HTML enables arbitrary layouts and interactions but requires more author markup for some visuals and a broader validation boundary. MyST, Markdoc, MDX, Mermaid, Vega-Lite, and unified explore parts of this space. This MVP tests a bounded declarative document profile. See [prior art and sources](docs/ground-reality.md).
