<!-- MVP launch update: native browser and React integration added on 2026-11-08. -->
# Parser architecture and API

Prototype implemented on **8 November 2026**.

## Performance decision

For streaming AI documents, the largest avoidable cost is parsing the entire growing document after every chunk. XMarkdown instead scans complete lines, retains an unfinished tail, parses candidate sections at boundaries, and emits provisional patches. It performs one full parse at completion to preserve document-wide Markdown semantics.

This is a workflow optimization. It does not make the underlying single-document Markdown parser 50× faster. There is no single “original Markdown parser”; the rebuilt benchmark names **markdown-it 14.3.3** as its baseline and also compares incremental XMarkdown with repeated full-prefix XMarkdown parsing.

The implementation uses JavaScript and a mature Markdown front end. Version 0.2 adds Node lazy adapters for KaTeX and SAX SVG imports; a browser entry now prepares optional adapters asynchronously; a cancellable worker remains planned. A native or WASM implementation is a later profiling decision: encoding text, crossing the interface, and materializing a document tree also cost time. A 50× claim cannot be inferred from a language choice.

## Processing stages

```text
Source -> markdown-it block tokens -> typed graphics validation
       -> inline parsing -> token document -> trusted HTML/SVG templates
```

`src/core.js` owns extension rules, API limits, streaming state, and finalization. `src/index.js` supplies lazy Node processors; `src/browser/parser.js` prepares browser processors through dynamic imports. `src/graphics.js` owns charts/graphs; `src/svg.js` owns scenes/imports; `src/math.js` owns math; `src/widgets.js` and `src/expressions.js` own controls/drawing. `src/extensions.js` dispatches blocks and caches specifications/geometry. Both entries use the same native renderer and reused Markdown core. See [integrations](integrations.md) and [extended capabilities](extended-capabilities.md).

The AST is currently markdown-it's token document with typed metadata on graphic fences, not a new independent cross-language tree schema. Tokens retain source line maps; preview maps are relative to their patch and include a `startLine` offset. The final document's maps cover the complete source.

## Supported source

Ordinary Markdown uses markdown-it's default syntax, including tables and strikethrough. This prototype does not implement GFM task-list checkboxes. Raw HTML is displayed as text, images display alt text without fetching their source, and links permit relative/fragment destinations and HTTP, HTTPS, or mailto schemes. Automatic linkification is disabled.

Callouts use:

```markdown
:::note[Optional title]
Markdown content.
:::
```

The registered types are `note`, `tip`, and `warning`. Callouts may nest, subject to the parser's nesting limit. Closing markers inside fenced code remain literal code. An unclosed callout falls back to ordinary Markdown text.

Graphics use exact code-fence identifiers `x-chart`, `x-diagram`, `mermaid`, `x-svg`, `x-widget`, and `x-math`. Other identifiers stay ordinary code fences. An unclosed extension fence is not rendered as a visual. Inline/display math is additionally recognized through dollar delimiters.

### Charts

````markdown
```x-chart
{
  "type": "bar",
  "title": "Requests",
  "description": "Monday 24, Tuesday 31.",
  "x": "day",
  "y": "requests",
  "data": [
    {"day": "Mon", "requests": 24},
    {"day": "Tue", "requests": 31}
  ]
}
```
````

`type` is `bar` or `line`. Each data row contains the named x and y fields. The x value is a nonempty category string; the y value is a finite number within ±1e12. Titles and descriptions are required. The renderer supplies axes, scale, and sizing. This first line chart uses categorical spacing, not continuous numeric/time x coordinates.

### Diagrams

````markdown
```x-diagram
{
  "title": "Pipeline",
  "description": "Requests pass from validation to storage.",
  "direction": "LR",
  "nodes": [
    {"id": "validate", "label": "Validate"},
    {"id": "store", "label": "Store"}
  ],
  "edges": [["validate", "store"]]
}
```
````

Node IDs must be unique; edges must name existing nodes. `direction` is `LR` or `TD`. Directed acyclic graphs use topological ranks. Cycles use a deterministic grid. Edge routing is deliberately basic; complex diagrams can have crossings, and long labels are shortened visually with full labels in SVG titles.

Mermaid source is recognized and preserved in typed metadata. Document-supplied configuration is rejected. **This prototype does not run the Mermaid renderer**: it displays Mermaid as source. Use `x-diagram` for rendered flow diagrams in the playground.

Unknown fields, invalid data, or oversized graphics generate a diagnostic and escaped-source fallback. JSON uses `JSON.parse`; duplicate JSON keys currently follow its last-value behavior. Graph IDs are checked separately for duplicates.

## API

```js
const parser = createParser({ maxChartRows: 128 });
const result = parser.parse(source); // { version, source, tokens, diagnostics, html, env, assets }
const tokensOnly = parser.parse(source, { render: false });

const stream = parser.stream({ renderPreviews: true });
const { updates, pendingCodeUnits } = stream.write(chunk);
const { document, stats, replacePreview } = stream.finish();
```

Each update contains a source `start` and `end` offset, `startLine`, tokens, diagnostics, optional HTML, and `provisional: true`. The application appends new patches and may display still-pending source through a text API. It should replace the provisional document with the final document once `finish()` returns. Do not re-render the whole accumulated document after every patch, or that application will reintroduce work outside the parser.

Short unbroken paragraphs can remain pending until completion. Paragraph previews can lag by one block; ambiguous lists or containers can defer longer. References defined later can change earlier text, so provisional previews are not an irrevocable parse. Final output always uses the complete source. `finish()` currently performs one full reparse, rather than maintaining a dependency graph for reference-link invalidation.

The Node parser and stream are synchronous. The browser entry asynchronously prepares optional processors, then runs the same synchronous core on the main thread; a worker is not included. HTML generation is optional; math compilation occurs during validation even with `render:false`. SVG geometry and browser painting are separate costs. `result.assets.modules` lists `widgets` only when required, including in preview patches.

## Work budget and limits

Default limits:

| Setting | Default |
| --- | --- |
| Document input | 2,097,152 UTF-16 code units |
| One graphic's source | 65,536 UTF-16 code units |
| Chart rows | 256 |
| Diagram nodes / edges | 32 / 128 |
| Markdown nesting | 32 |
| Token count | 200,000, checked after parsing |
| Generated HTML | 8,388,608 code units, checked after generation |
| Preview parsing budget | 3 × received source length |

Counters track input code units submitted to preview parses. By default, previews submit at most 3N and the final parse submits N, for at most 4N total. This bounds repeated parser input; it is not a proof of hard CPU or memory limits. Input-size limits are enforced before parsing, but token/output limits are checked after allocation. A cancellable worker and measured memory policy would be needed for stronger resource isolation.

The streaming scanner is conservative around fences and callouts. It can defer work when its lexical view differs from nested Markdown structure; final correctness comes from the complete parse.

## Rendering boundary

Document authors supply text and validated data. The registered schemas reject programs, event handlers, arbitrary imports, and external resource fetches. Checked SVG imports accept geometry and supported presentation attributes; their unsupported content is rejected. Controls use interpreted expressions without eval, and drawing uses a fixed runtime. The playground sandbox omits same-origin permission and enables scripts only for documents that need the nonce-authorized widget module. Static SVG/math documents load no script.

The public parser's `renderTokens` helper assumes tokens generated by this parser and a trusted host environment. Do not pass an untrusted prebuilt token tree to it. Host limits and options are separate from document content.

The tests exercise Markdown behavior, graphics schemas, hostile labels/links, limits, container syntax, and final streaming equivalence. This is not a completed CommonMark conformance run, fuzzing campaign, or independent security audit.
