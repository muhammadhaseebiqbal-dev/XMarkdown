# Exact-demo representation comparison

Representation counts, not an LLM generation experiment. Named local encodings are not current Claude token counts. LF line endings. No editor, server, parser, or shared runtime code in author-fragment counts.

## Exact live demo

The source is imported from the same fixture as the playground. The literal HTML is its actual rendered body. Compact SVG rounds numeric attributes to 0.001 units and retains labels, descriptions, axes, and elements. The standalone variant adds document boilerplate and CSS. These are concrete equivalent implementations, not a proof of the shortest possible HTML.

| Representation | UTF-16 code units | UTF-8 bytes | o200k_base tokens | cl100k_base tokens |
| --- | ---: | ---: | ---: | ---: |
| XMarkdown source | 839 | 839 | 208 | 205 |
| Literal HTML + SVG | 3610 | 3610 | 1259 | 1239 |
| Compact HTML + SVG | 3492 | 3492 | 1219 | 1199 |
| Standalone styled HTML | 4914 | 4914 | 1689 | 1666 |
| HTML with shared graphics components | 1044 | 1044 | 261 | 257 |

XMarkdown uses **82.9% fewer o200k_base tokens** than compact literal HTML/SVG, **87.7% fewer** than the styled standalone page, and **20.3% fewer** than shared-component HTML author markup.

A negative saving means XMarkdown uses more tokens. Shared-component HTML uses the same validation and graphics renderer through template-runtime.js, without a Markdown parser. Its runtime is excluded from per-document author markup, just as XMarkdown's runtime is excluded.

The complete playground editor and Node server are not equivalent to the displayed document and are not counted as document HTML. A standalone HTML page includes CSS that a hosted renderer can share; a hosted XMarkdown document also relies on a renderer and theme.

## Easy through unsupported

| Example | X tokens | Compact literal HTML tokens | Shared-component HTML tokens | X reduction vs literal HTML |
| --- | ---: | ---: | ---: | ---: |
| Easy: Headings, emphasis, and lists | 20 | 42 | 42 | 52.4% |
| Easy: A comparison table | 23 | 68 | 68 | 66.2% |
| Easy: A callout | 19 | 47 | 47 | 59.6% |
| Complex: A chart with axes and labels | 79 | 635 | 88 | 87.6% |
| Complex: An automatically placed pipeline | 79 | 494 | 88 | 84.0% |
| Difficult: A branching dependency graph | 128 | 727 | 137 | 82.4% |
| Difficult: The exact playground document | 208 | 1219 | 261 | 82.9% |
| Complex: Rendered mathematical notation | 14 | 75 | 106 | 81.3% |
| Complex: A live queue what-if control | 112 | 148 | 546 | 24.3% |
| Complex: A drawing application | 52 | 317 | 252 | 83.6% |
| Difficult: A complex vector scene | 844 | 978 | 978 | 13.7% |
| Difficult: An existing SVG import | 225 | 219 | 368 | -2.7% |

All table values use o200k_base. Both encoding counts for every representation are retained in [results.json](results.json). See [samples.md](samples.md) for every source example and [gallery.html](gallery.html) for a side-by-side viewer.

## Instructions and total-workflow limits

The supplied [format guide](format-guide.txt) contains 383 o200k_base tokens and 383 cl100k_base tokens. It is not included in output-fragment savings. Whether it must be sent, cached, or repeated depends on the integration. No model was called, so no actual generation-time, billed-cost, correction-turn, or provider-usage reduction has been measured.

Total-workflow savings require counting each format's instructions, examples, output, repeated context, and repairs. A registered HTML component API also needs documentation. Shared renderer code is shifted into reusable software; it is not eliminated.

## Interpretation

Literal SVG grows because it describes positions, geometry, axes, labels, and element attributes. Both XMarkdown and shared-component HTML can replace that with data. The strongest advantage here is reuse and abstraction, rather than a magical property of Markdown syntax.

XMarkdown suits prose plus known document graphics. HTML suits unrestricted layouts, custom SVG, math, native controls, and applications when paired with JavaScript. If a feature is unsupported, counting a shorter fallback as a saving would be an invalid comparison.

Rebuild with `npm run compare`. Sample pages can be opened as files. The shared HTML sample requires template-runtime.js beside the artifacts directory; it also works through the local demo server.
