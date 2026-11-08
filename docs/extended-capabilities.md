<!-- MVP launch update: native browser and React integration added on 2026-11-08. -->
# Extended capabilities

Implemented 8 November 2026. Ordinary Markdown remains the prose syntax. Supported visual content is data, compiled into MathML, SVG, and native controls. Author scripts are not part of this format.

## Mathematics

Use `$E=mc^2$` inline, a `$$` delimiter on its own line at both ends of a display equation, or an `x-math` fence:

````markdown
```x-math
\int_0^1 x^2\,dx = \frac{1}{3}
```
````

KaTeX loads on first mathematical use. Its supported TeX compiles to native MathML, so the document does not need a math JavaScript runtime, external fonts, or a math stylesheet. Trust is disabled, expansion is limited to 256, equation input to 4,096 code units, and maximum size to 20 em. This is KaTeX's supported notation, not arbitrary TeX packages. Code spans and ordinary currency stay text. Inline dollar notation must remain on one line and cannot start/end with whitespace. Unclosed display delimiters remain ordinary source. Invalid complete equations produce diagnostics and escaped fallback.

## Controls and expressions

````markdown
```x-widget
{"type":"controls","title":"Queue","description":"Arrival versus service capacity.","inputs":[{"id":"rate","label":"Requests/min","type":"range","min":0,"max":180,"value":80}],"outputs":[{"id":"backlog","label":"Queue growth","expr":"max(0, rate-100)","unit":"requests/min"}]}
```
````

Input types are `range`, `number`, `toggle`, and `select`. Numeric inputs require `min`, `max`, and `value`; `step` defaults to 1. A toggle value is boolean. Select inputs have `options:[{"label":"Two","value":2}]` and a matching default value.

Every output has a unique `id`, `label`, `expr`, and optional `unit`. Expressions can reference inputs and previously declared outputs. Supported operations: arithmetic `+ - * / %`, comparisons `< <= > >= == !=`, boolean `&& || !`, parentheses, and `condition ? yes : no`. Literals can be numbers, strings, or booleans. Functions are `min`, `max`, `abs`, `round`, `floor`, `ceil`, and `clamp`. There is no property access, assignment, function definition, import, network call, or `eval`.

Default limits: 16 inputs, 16 outputs, 2,048 characters / 256 tokens per expression, 32 levels of expression syntax, finite numbers and final numeric results within ±1e12. Initial results are computed during validation. Invalid results after an edit display `Invalid result`. The renderer emits native controls and initial output; the shared runtime updates them through text APIs.

## Drawing

````markdown
```x-widget
{"type":"draw","title":"Sketch a diagram","description":"Drag to draw, undo, or clear."}
```
````

Optional fields: `width` (default 640), `height` (320), `color` (`#2563eb`), `lineWidth` (3), and initial `strokes` as arrays of `[x,y]` points. Width/height are 64–2,048, stroke width 1–24, and colors are six-digit hex. Drawing uses SVG polylines with undo and clear, at most 128 strokes / 8,192 points. Coordinates use the SVG screen matrix so drawing remains aligned when responsive. Near-identical pointer positions are omitted. Initial strokes remain visible without JavaScript. Pointer drawing currently needs a pointing device; the action buttons are keyboard accessible.

## Vector scenes and SVG imports

````markdown
```x-svg
{"title":"Curve","description":"A cubic curve inside a group.","viewBox":[0,0,400,180],"children":[["g",{"fill":"none","stroke":"#2563eb","stroke-width":4},["path",{"d":"M20 140C110 0 290 0 380 140"}]]]}
```
````

Each child is a tuple `[tag, attributes, ...children]`. Text is a string child of `text`, `tspan`, `title`, or `desc`. Supported elements: `g`, `defs`, `path`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`, `text`, `tspan`, `linearGradient`, `radialGradient`, `stop`, `clipPath`, `mask`, `symbol`, `use`, `marker`, `pattern`, `title`, and `desc`. Geometry, presentation, transforms, and local references are validated against tag-specific attributes. Paths support the standard SVG path command letters, including cubic/quadratic curves and arcs; native SVG performs the final path interpretation.

Reuse symbols with `href="#id"`; reference gradients, clipping, masks, or markers with `url(#id)`. Scenes may optionally set `preserveAspectRatio`. IDs are unique within the source and rewritten for every rendered placement. Missing references, reference cycles, excessive nesting, and excessive symbol expansion are rejected. Patterns must have positive tile dimensions of at least 16 units in user space or 0.02 in bounding-box space.

To import an existing `.svg`, choose **Import SVG** in the playground or place its complete markup inside an `x-svg` fence. A strict SAX XML parser converts it to the same validated scene. Inline presentation `style` declarations are converted to supported attributes. The import does not fetch any linked file or URL. This is a checked SVG subset: scripts, event attributes, `foreignObject`, external images/resources, CSS stylesheets/classes, filters, animation, DTDs, and processing instructions are rejected with a source diagnostic. Editor-specific metadata/attributes may need removal before import. The original source remains available in the document.

Defaults: 64 Ki code units per extension block, 512 SVG nodes, depth 16, 4,096 expanded nodes, 65,536 path/point code units, and positive viewBox dimensions at most 16,384. Numeric coordinates must be finite within ±1e6. These reduce resource exposure; browser rendering time and total memory are not hard-isolated.

## Host integration and efficiency

```js
const parser = createParser();
const result = parser.parse(source);
// result.assets.modules is ['widgets'] only if widgets occur.
// Insert result.html using the host's trusted rendering boundary.
if (result.assets.modules.includes('widgets')) {
  const { mountWidgets } = await import('xmarkdown/widgets');
  mountWidgets(documentContainer);
}
```

The widget module has one shared implementation for all controls and drawings. Mounting is idempotent, and event listeners follow document lifetime. Public mounting assumes markup emitted by this parser; arbitrary untrusted DOM/config objects are not a supported input. The demo uses a sandbox without same-origin permission, and only loads the nonce-authorized runtime for interactive documents. Ordinary SVG/math documents need no script execution.

Math and XML load lazily on Node. The browser entry prepares those processors through dynamic imports before invoking the same core. Full-source browser parsing is asynchronous; its stream factory prepares both processors for unknown future content. A cancellable worker remains planned. React, CSS, and TypeScript exports are available; see [installation and integrations](integrations.md).

Validation and generated geometry use a bounded cache (128 entries / 512 Ki retained code-unit accounting by default). It helps streaming finalization and repeated graphics. `cacheEntries:0` disables it; `parser.clearCache()` clears retained entries; `parser.cacheStats()` exposes hit/miss and retained counters. Validated graphic metadata is frozen so callers cannot corrupt cached specifications. The complete Markdown document is still parsed at completion to preserve references and syntax semantics.

Measure cold processing, cached processing, and streaming separately with `npm run bench:features`. See [processing costs](../benchmark/features-report.md). Dependencies, generated DOM, and interaction logic have real costs. No universal zero-overhead, 50× batch, or AI-generation-speed claim is made.
