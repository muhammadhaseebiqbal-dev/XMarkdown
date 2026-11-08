<!-- MVP launch update: native browser and React integration added on 2026-11-08. -->
# XMarkdown status and remaining work

Status checked on **8 November 2026**, prototype version **0.2.0**. The extended renderer, comparison fixtures, and local demo exist. The format and integration are not ready for a production release.

## Implemented

- Ordinary Markdown through patched markdown-it 14.3.3, including tables and strikethrough. The core syntax has not been replaced.
- `:::note`, `:::tip`, and `:::warning` callouts containing Markdown.
- Closed `x-chart` fences with validated JSON for categorical bar and line charts.
- Closed `x-diagram` fences with validated JSON for basic directed graphs, automatic placement, and SVG output.
- Inline/display TeX and `x-math`, compiled by lazily loaded KaTeX 0.19.1 to native MathML.
- `x-widget` controls with a bounded expression interpreter; a drawing widget with undo/clear and SVG polylines.
- `x-svg` scenes and existing SVG imports with paths, groups, gradients, clipping, masks, markers, patterns, and reusable symbols.
- Bounded caching of validated specifications and generated geometry; optional widget modules/styles and gzip/ETag delivery in the demo.
- Diagnostics and escaped-source fallback for invalid graphics; source line maps and explicit resource limits.
- Provisional streaming section patches and one complete parse at completion. The playground currently displays a complete document and inspection counters.
- An HTML/SVG/MathML renderer, shared document styling, and a sandbox without same-origin permission. Interactive documents load only the trusted widget module.
- A reproducible comparison with twelve examples, two named tokenizers, complete source artifacts, and a gallery. The HTML JSON adapter reuses the chart/diagram renderer; controls use the shared widget module. SVG scenes remain literal SVG in this HTML adapter comparison.
- Installable GitHub source package with Node/browser/React/CSS exports and TypeScript declarations. Both parser entries share the native core; browser optional processors use dynamic imports.
- Dark showcase with eighteen examples, five larger fixtures, native local edits, a live React component page, CI, maintenance policies, and installation guides. Full framework applications beyond the React smoke page remain untested.

Raw author HTML is escaped; ordinary Markdown images show alt text without fetching. Unsafe link schemes are blocked. Task-list checkboxes and automatic linkification remain absent. Mermaid stays source. Arbitrary author programs, external resource loads, SVG filters/animation, and unrestricted application logic remain outside the profile. SVG import accepts a validated subset and rejects unsupported content. See [extended capabilities](extended-capabilities.md) for exact syntax and limits.

## Measured and unmeasured

The [comparison](../comparison/report.md) still counts the original demo as 839 UTF-8 bytes / 208 o200k_base tokens of XMarkdown, 3,492 bytes / 1,219 tokens of compact HTML/SVG, or 1,044 bytes / 261 tokens of shared-component HTML. Source-token reduction stays 82.9% versus compact HTML/SVG and 20.3% versus shared-component HTML. Extended cases now include math, controls, drawing, scenes, and imports. Raw SVG imports add fence overhead. Counts exclude reusable runtimes and instructions; the extended guide adds 383 tokens if sent. No current Claude tokenizer, model API, generation latency, billed usage, or repair rate was measured.

The [parser benchmark](../benchmark/report.md) has been rebuilt for the patched core. The [extended capability benchmark](../benchmark/features-report.md) separates first use, empty-cache, disabled-cache, cached rendering, and streaming. Cached source is cheaper to process, but new capabilities have real costs and short documents may gain nothing from streaming. The requested 50× single-parse improvement remains unachieved. Browser layout/painting and model generation remain unmeasured.

## Remaining work, in recommended order

| Priority | Work | Completion evidence |
| --- | --- | --- |
| 1 | Validate the product hypothesis against styled Markdown/plugins, Markdoc/MyST, shared-component HTML, and standalone HTML. | Capability-matched model trials with total prompt/output tokens, latency, valid output, repairs, and reader task results. |
| 2 | Stabilize the small grammar and versioned API. Evaluate JSON versus a more compact graphics notation before changing syntax. | Written compatibility policy, versioned normalized nodes independent of markdown-it tokens, and measured generation/error tradeoffs. |
| 3 | Integrate actual model streaming in a browser with a cancellable worker. | Patch-based UI updates, pending-content display, final equivalence, cancellation, and measured first useful display/interaction latency. |
| 4 | Complete remaining Markdown and asset features. | Explicit choices for task lists, Mermaid rendering, citations, and images with a controlled host policy. Math, controls, drawing, and supported SVG imports are implemented. |
| 5 | Improve graphics quality and accessibility. | Better edge routing and labels, additional chart types if justified, accessible data tables, keyboard/screen-reader review, responsive checks, and reliable static export. |
| 6 | Harden the parser and renderer. | Chosen CommonMark/GFM conformance corpus, fuzzing, truncation and malformed-input tests, network-boundary checks, memory/time measurements, and dependency/security review. Current allocation limits are not hard isolation. |
| 7 | Prepare an npm registry release and broaden integration verification. | Source packaging, browser exports, React, TypeScript and CI are implemented. Complete conformance/migration work and test full framework applications before registry publication. |

The implementation should not grow into a second HTML/CSS/JavaScript language. Known document widgets can be added through trusted schemas; unrestricted application design can use HTML and JavaScript directly. A new native or WASM parser is justified only if profiling identifies a remaining bottleneck and conformance can be maintained.
