# XMarkdown

**Markdown for reports that need charts, diagrams, math, controls, and SVG.**

[![CI](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/actions/workflows/ci.yml/badge.svg)](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/actions/workflows/ci.yml)
[![MIT license](https://img.shields.io/badge/license-MIT-d8ee91)](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/LICENSE)
[![MVP 0.2.1](https://img.shields.io/badge/MVP-0.2.1-d8ee91)](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/CHANGELOG.md)

[**Try the playground →**](https://xmarkdown-zeta.vercel.app) · [Examples](https://xmarkdown-zeta.vercel.app/#examples) · [Syntax guide](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/docs/extended-capabilities.md) · [React demo](https://xmarkdown-zeta.vercel.app/integrations/react.html)

Write familiar Markdown, describe a visual with data, and let the renderer draw it. The same engine runs in Node, the browser, and React. The showcase uses this engine too.

Use XMarkdown for generated reports, technical explanations, and documents with interactive visuals. For a document that only needs prose, regular Markdown is simpler. This is an experimental MVP; APIs and syntax may change before 1.0.

## Install

```sh
npm install xmarkdown-renderer
```

Requires Node.js 22+. React integration supports React 18+. Dependencies and TypeScript declarations are included.

The npm package is named **`xmarkdown-renderer`**. The name `xmarkdown` belongs to a different publisher.

## Use it in React

Import the component and shared styles once, then pass a document as `source`:

```jsx
import { XMarkdown } from 'xmarkdown-renderer/react';
import 'xmarkdown-renderer/styles.css';

const report = String.raw`# Team report

Requests increased this week. **Here is the breakdown.**

~~~x-chart
{"type":"bar","title":"Requests per day","description":"Monday 24; Tuesday 31; Wednesday 28.","x":"day","y":"requests","data":[{"day":"Mon","requests":24},{"day":"Tue","requests":31},{"day":"Wed","requests":28}]}
~~~

A stable queue requires $\lambda < \mu$.

:::tip[Try it]
Change a chart value and render the document again.
:::
`;

export default function App() {
  return <XMarkdown source={report} />;
}
```

The stylesheet supplies the shared chart, diagram, and widget styles. It is loaded once for the app. You can override it with your own theme.

[Complete editable React example with a live slider and error handling](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/integration/react-quickstart.jsx) · [Node, browser, Next.js, and Vue recipes](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/docs/integrations.md)

## What is supported?

| Capability | Delivered | Example or limit |
| --- | --- | --- |
| Familiar Markdown | Headings, emphasis, lists, quotes, links, code, tables, strikethrough | Uses markdown-it; HTML is escaped and images show alt text |
| Callouts | Notes, tips, and warnings | `:::tip[Title]` |
| Charts | Bar and line charts rendered as SVG | `x-chart`; up to 256 rows |
| Diagrams | Directed graphs with automatic placement | `x-diagram`; 32 nodes, 128 edges |
| Math | Inline and display equations | `$…$`, `$$`, or `x-math`; KaTeX to MathML |
| Interactive controls | Sliders, numbers, selects, toggles, calculated outputs | `x-widget`; expressions run without `eval` |
| Drawing | Sketch, undo, and clear | `x-widget` drawing canvas |
| Complex SVG scenes | Paths, groups, gradients, clipping, masks, patterns, symbols | `x-svg` with structured scene data |
| SVG imports | Existing static SVG inside an `x-svg` fence | Checked subset; external resources and scripts rejected |
| Streaming | Partial previews followed by a complete final render | Bounded caching and section updates |
| Integrations | Node, browser, React, and TypeScript exports | Native JavaScript implementation |

This keeps the usual Markdown syntax and adds optional blocks. It does not replace Markdown with a new language. Task-list checkboxes, Mermaid rendering, external images, SVG animation/filters, and arbitrary author JavaScript are not implemented.

## What we built, and what we reused

| Part | Reused processor | XMarkdown's contribution |
| --- | --- | --- |
| Markdown | [markdown-it](https://github.com/markdown-it/markdown-it) | Document rules, callouts, feature dispatch, checked links |
| Equations | [KaTeX](https://github.com/KaTeX/KaTeX) | Input limits, lazy loading, MathML output, caching |
| SVG imports | [saxes](https://github.com/lddubeau/saxes) | Allowed elements/attributes, local references, size limits |
| Charts and diagrams | Custom JavaScript | Data checks, geometry, labels, SVG rendering |
| Scenes and controls | Custom JavaScript | Scene format, SVG output, expression interpreter, widgets |
| Streaming and cache | Custom JavaScript | Partial updates, final render, bounded reuse |

There is one JavaScript implementation today. Other server languages can call a Node/HTTP service; independent Python, Go, or Rust ports are not shipped.

## What this MVP has achieved

| Area | Accomplished | Evidence | Next step |
| --- | --- | --- | --- |
| Rich documents | Charts, diagrams, math, controls, drawing, SVG scenes/imports | [18 live examples](https://xmarkdown-zeta.vercel.app/#examples) | Better graph routing and more chart types |
| Shared renderer | Node/browser engine and React component | [Integration checks](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/test/integration.test.js) | Full framework applications and a browser worker |
| Source efficiency | Complete XMarkdown/HTML comparisons with token counts | [12 measured pairs](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/comparison/report.md) | Real model generation and reader trials |
| Validation | Checked SVG, links, and expressions; limits and diagnostics | [Tests](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/tree/main/test) | Fuzzing and independent security review |
| Maintenance | CI on Node 22/24, TypeScript declarations, policies, changelog | [CI](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/actions) | Stable API and compatibility coverage |

## More examples

A diagram:

````markdown
```x-diagram
{"title":"Request pipeline","description":"Validate before storing.","nodes":[{"id":"validate","label":"Validate"},{"id":"store","label":"Store"}],"edges":[["validate","store"]]}
```
````

A calculated control:

````markdown
```x-widget
{"type":"controls","title":"Capacity check","description":"Move the slider to test capacity.","inputs":[{"id":"rate","label":"Requests per minute","type":"range","min":0,"max":180,"value":80}],"outputs":[{"id":"status","label":"Queue","expr":"rate <= 100 ? 'within capacity' : 'queue grows'"}]}
```
````

A vector path:

````markdown
```x-svg
{"title":"A curve","description":"A simple vector path.","viewBox":[0,0,320,120],"children":[["path",{"d":"M20 90C90 0 230 0 300 90","fill":"none","stroke":"#38bdf8","stroke-width":4}]]}
```
````

For larger examples, try the [architecture diagram, capacity model, rollback workflow, equations, and combined report](https://xmarkdown-zeta.vercel.app/#examples). [Full syntax and SVG import examples](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/docs/extended-capabilities.md).

## Is it faster or smaller?

XMarkdown uses markdown-it for ordinary Markdown. Added features have processing costs; there is **no universal 50× parsing improvement**.

| Measured example | Result |
| --- | --- |
| Original demo source vs literal HTML/SVG | 208 vs 1,219 tokens: 82.9% fewer source tokens |
| Same source vs shared-component HTML | 208 vs 261 tokens: 20.3% fewer |
| Existing raw SVG import | Fence overhead uses 2.7% more tokens |
| Plain full-document render | XMarkdown 0.268 ms; bare markdown-it 0.259 ms |
| Extended streaming vs repeatedly parsing full prefixes | 5.48× in a synthetic local workload |

These are v0.2.0 fixture measurements using markdown-it 14.3.3 and the named `o200k_base` tokenizer. Version 0.2.1 uses markdown-it 15.0.3. Counts exclude shared runtime and author instructions. AI generation latency, billed usage, browser painting, and reader benefits have not been measured.

[Token comparisons](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/comparison/report.md) · [Benchmarks](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/benchmark/features-report.md) · [Evaluation plan](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/docs/evaluation-plan.md)

## Contribute

[Report an issue](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/issues) · [Contributing](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/CONTRIBUTING.md) · [Roadmap](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/docs/status.md) · [Changelog](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/CHANGELOG.md)

For applications handling hostile input, follow the [security guide](https://github.com/muhammadhaseebiqbal-dev/XMarkdown/blob/main/SECURITY.md). Input validation is implemented; an independent security audit and hard resource isolation are still future work.

MIT licensed.
