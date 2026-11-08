# All side-by-side source examples

Generated from the checked-in examples. Full HTML fragments are included, without omitted SVG. Standalone pages are in artifacts/. “Impossible today” means unsupported by the current XMarkdown profile.

### Easy: Headings, emphasis, and lists

Markdown is concise and familiar. On long plain prose the relative savings shrink because most tokens are the same words.

XMarkdown source:

````markdown
# Release

The parser is **ready for review**.

- Check correctness
- Check performance
````

HTML source (compact literal HTML/SVG):

```html
<h1>Release</h1>
<p>The parser is <strong>ready for review</strong>.</p>
<ul>
<li>Check correctness</li>
<li>Check performance</li>
</ul>

```

HTML using shared graphics components:

```html
<h1>Release</h1>
<p>The parser is <strong>ready for review</strong>.</p>
<ul>
<li>Check correctness</li>
<li>Check performance</li>
</ul>

```


### Easy: A comparison table

Markdown usually saves table markup. HTML supports features this table syntax does not: row/column spans, custom cell layouts, and interactive controls.

XMarkdown source:

````markdown
| Format | Strength |
|---|---|
| XMarkdown | Structured documents |
| HTML | Custom interfaces |
````

HTML source (compact literal HTML/SVG):

```html
<table>
<thead>
<tr>
<th>Format</th>
<th>Strength</th>
</tr>
</thead>
<tbody>
<tr>
<td>XMarkdown</td>
<td>Structured documents</td>
</tr>
<tr>
<td>HTML</td>
<td>Custom interfaces</td>
</tr>
</tbody>
</table>

```

HTML using shared graphics components:

```html
<table>
<thead>
<tr>
<th>Format</th>
<th>Strength</th>
</tr>
</thead>
<tbody>
<tr>
<td>XMarkdown</td>
<td>Structured documents</td>
</tr>
<tr>
<td>HTML</td>
<td>Custom interfaces</td>
</tr>
</tbody>
</table>

```


### Easy: A callout

The directive is compact when a host supplies the appearance. A shared HTML callout component can be similarly compact.

XMarkdown source:

````markdown
:::warning[Input boundary]
Treat labels as **text** and validate graphic data.
:::
````

HTML source (compact literal HTML/SVG):

```html
<aside class="x-callout x-callout-warning"><strong class="x-callout-title">Input boundary</strong>
<p>Treat labels as <strong>text</strong> and validate graphic data.</p>
</aside>

```

HTML using shared graphics components:

```html
<aside class="x-callout x-callout-warning"><strong class="x-callout-title">Input boundary</strong>
<p>Treat labels as <strong>text</strong> and validate graphic data.</p>
</aside>

```


### Complex: A chart with axes and labels

The data specification avoids coordinates, axis construction, and repeated SVG tags. The advantage becomes much smaller if HTML uses a shared chart component.

XMarkdown source:

````markdown
```x-chart
{"type":"bar","title":"Requests per day","x":"day","y":"requests","description":"Monday 24, Tuesday 31, Wednesday 18, Thursday 42.","data":[{"day":"Mon","requests":24},{"day":"Tue","requests":31},{"day":"Wed","requests":18},{"day":"Thu","requests":42}]}
```
````

HTML source (compact literal HTML/SVG):

```html
<figure class="x-graphic"><figcaption>Requests per day</figcaption><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 350" role="img" aria-labelledby="xg-doc-1-title xg-doc-1-desc"><title id="xg-doc-1-title">Requests per day</title><desc id="xg-doc-1-desc">Monday 24, Tuesday 31, Wednesday 18, Thursday 42.</desc><path d="M72 274H696" class="x-grid"/><text x="62" y="278" text-anchor="end">0</text><path d="M72 211.5H696" class="x-grid"/><text x="62" y="215.5" text-anchor="end">10.5</text><path d="M72 149H696" class="x-grid"/><text x="62" y="153" text-anchor="end">21</text><path d="M72 86.5H696" class="x-grid"/><text x="62" y="90.5" text-anchor="end">31.5</text><path d="M72 24H696" class="x-grid"/><text x="62" y="28" text-anchor="end">42</text><path d="M72 274H696" class="x-axis"/><rect x="95.4" y="131.143" width="109.2" height="142.857" class="x-bar"><title>Mon: 24</title></rect><rect x="251.4" y="89.476" width="109.2" height="184.524" class="x-bar"><title>Tue: 31</title></rect><rect x="407.4" y="166.857" width="109.2" height="107.143" class="x-bar"><title>Wed: 18</title></rect><rect x="563.4" y="24" width="109.2" height="250" class="x-bar"><title>Thu: 42</title></rect><text x="150" y="298" text-anchor="middle"><title>Mon</title>Mon</text><text x="306" y="298" text-anchor="middle"><title>Tue</title>Tue</text><text x="462" y="298" text-anchor="middle"><title>Wed</title>Wed</text><text x="618" y="298" text-anchor="middle"><title>Thu</title>Thu</text><text x="384" y="338" text-anchor="middle">day</text><text x="16" y="149" transform="rotate(-90 16 149)" text-anchor="middle">requests</text></svg><p class="x-description">Monday 24, Tuesday 31, Wednesday 18, Thursday 42.</p></figure>

```

HTML using shared graphics components:

```html
<script type="application/json" data-graphic="x-chart">{"type":"bar","title":"Requests per day","x":"day","y":"requests","description":"Monday 24, Tuesday 31, Wednesday 18, Thursday 42.","data":[{"day":"Mon","requests":24},{"day":"Tue","requests":31},{"day":"Wed","requests":18},{"day":"Thu","requests":42}]}</script>

```


### Complex: An automatically placed pipeline

XMarkdown states relationships. HTML/SVG permits manual placement, custom shapes, and edge styling. Those controls are absent from this profile.

XMarkdown source:

````markdown
```x-diagram
{"title":"Pipeline","description":"Requests move through validation, storage, and a response.","nodes":[{"id":"request","label":"Request"},{"id":"validate","label":"Validate"},{"id":"store","label":"Store"},{"id":"response","label":"Response"}],"edges":[["request","validate"],["validate","store"],["store","response"]]}
```
````

HTML source (compact literal HTML/SVG):

```html
<figure class="x-graphic"><figcaption>Pipeline</figcaption><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 950 140" role="img" aria-labelledby="xg-doc-1-title xg-doc-1-desc"><title id="xg-doc-1-title">Pipeline</title><desc id="xg-doc-1-desc">Requests move through validation, storage, and a response.</desc><defs><marker id="xg-doc-1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="x-arrow"/></marker></defs><path d="M200 60L260 60" class="x-edge" marker-end="url(#xg-doc-1-arrow)"/><path d="M430 60L490 60" class="x-edge" marker-end="url(#xg-doc-1-arrow)"/><path d="M660 60L720 60" class="x-edge" marker-end="url(#xg-doc-1-arrow)"/><rect x="30" y="30" width="170" height="60" rx="10" class="x-node"/><text x="115" y="65" text-anchor="middle"><title>Request</title>Request</text><rect x="260" y="30" width="170" height="60" rx="10" class="x-node"/><text x="345" y="65" text-anchor="middle"><title>Validate</title>Validate</text><rect x="490" y="30" width="170" height="60" rx="10" class="x-node"/><text x="575" y="65" text-anchor="middle"><title>Store</title>Store</text><rect x="720" y="30" width="170" height="60" rx="10" class="x-node"/><text x="805" y="65" text-anchor="middle"><title>Response</title>Response</text></svg><p class="x-description">Requests move through validation, storage, and a response.</p></figure>

```

HTML using shared graphics components:

```html
<script type="application/json" data-graphic="x-diagram">{"title":"Pipeline","description":"Requests move through validation, storage, and a response.","nodes":[{"id":"request","label":"Request"},{"id":"validate","label":"Validate"},{"id":"store","label":"Store"},{"id":"response","label":"Response"}],"edges":[["request","validate"],["validate","store"],["store","response"]]}</script>

```


### Difficult: A branching dependency graph

The graph fits the current schema. Layout is basic and may contain crossings; exact routing, edge labels, and decision shapes favor custom HTML/SVG.

XMarkdown source:

````markdown
```x-diagram
{"title":"Release dependencies","description":"Build feeds unit tests and packaging. Unit tests and packaging feed integration tests. Integration tests feed release and notification.","direction":"LR","nodes":[{"id":"build","label":"Build"},{"id":"unit","label":"Unit tests"},{"id":"package","label":"Package"},{"id":"integration","label":"Integration tests"},{"id":"release","label":"Release"},{"id":"notify","label":"Notify"}],"edges":[["build","unit"],["build","package"],["unit","integration"],["package","integration"],["integration","release"],["release","notify"]]}
```
````

HTML source (compact literal HTML/SVG):

```html
<figure class="x-graphic"><figcaption>Release dependencies</figcaption><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1180 250" role="img" aria-labelledby="xg-doc-1-title xg-doc-1-desc"><title id="xg-doc-1-title">Release dependencies</title><desc id="xg-doc-1-desc">Build feeds unit tests and packaging. Unit tests and packaging feed integration tests. Integration tests feed release and notification.</desc><defs><marker id="xg-doc-1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="x-arrow"/></marker></defs><path d="M200 60L260 60" class="x-edge" marker-end="url(#xg-doc-1-arrow)"/><path d="M177.727 90L282.273 140" class="x-edge" marker-end="url(#xg-doc-1-arrow)"/><path d="M430 60L490 60" class="x-edge" marker-end="url(#xg-doc-1-arrow)"/><path d="M407.727 140L512.273 90" class="x-edge" marker-end="url(#xg-doc-1-arrow)"/><path d="M660 60L720 60" class="x-edge" marker-end="url(#xg-doc-1-arrow)"/><path d="M890 60L950 60" class="x-edge" marker-end="url(#xg-doc-1-arrow)"/><rect x="30" y="30" width="170" height="60" rx="10" class="x-node"/><text x="115" y="65" text-anchor="middle"><title>Build</title>Build</text><rect x="260" y="30" width="170" height="60" rx="10" class="x-node"/><text x="345" y="65" text-anchor="middle"><title>Unit tests</title>Unit tests</text><rect x="260" y="140" width="170" height="60" rx="10" class="x-node"/><text x="345" y="175" text-anchor="middle"><title>Package</title>Package</text><rect x="490" y="30" width="170" height="60" rx="10" class="x-node"/><text x="575" y="65" text-anchor="middle"><title>Integration tests</title>Integration tests</text><rect x="720" y="30" width="170" height="60" rx="10" class="x-node"/><text x="805" y="65" text-anchor="middle"><title>Release</title>Release</text><rect x="950" y="30" width="170" height="60" rx="10" class="x-node"/><text x="1035" y="65" text-anchor="middle"><title>Notify</title>Notify</text></svg><p class="x-description">Build feeds unit tests and packaging. Unit tests and packaging feed integration tests. Integration tests feed release and notification.</p></figure>

```

HTML using shared graphics components:

```html
<script type="application/json" data-graphic="x-diagram">{"title":"Release dependencies","description":"Build feeds unit tests and packaging. Unit tests and packaging feed integration tests. Integration tests feed release and notification.","direction":"LR","nodes":[{"id":"build","label":"Build"},{"id":"unit","label":"Unit tests"},{"id":"package","label":"Package"},{"id":"integration","label":"Integration tests"},{"id":"release","label":"Release"},{"id":"notify","label":"Notify"}],"edges":[["build","unit"],["build","package"],["unit","integration"],["package","integration"],["integration","release"],["release","notify"]]}</script>

```


### Difficult: The exact playground document

This is the same 839-code-unit source used by the live playground. It combines prose, a callout, a four-node diagram, and a four-value chart.

XMarkdown source:

````markdown
# How a request moves

The API validates a request before storing it. **The same document** contains prose and visual data.

:::note[Trust boundary]
Each visual uses a known schema. Labels remain text.
:::

```x-diagram
{"title":"Request pipeline","description":"A request passes through validation, storage, and a response.","nodes":[{"id":"request","label":"Request"},{"id":"validate","label":"Validate"},{"id":"store","label":"Store"},{"id":"response","label":"Response"}],"edges":[["request","validate"],["validate","store"],["store","response"]]}
```

```x-chart
{"type":"bar","title":"Requests per day","x":"day","y":"requests","description":"Sample data: Monday 24, Tuesday 31, Wednesday 18, Thursday 42.","data":[{"day":"Mon","requests":24},{"day":"Tue","requests":31},{"day":"Wed","requests":18},{"day":"Thu","requests":42}]}
```
````

HTML source (compact literal HTML/SVG):

```html
<h1>How a request moves</h1>
<p>The API validates a request before storing it. <strong>The same document</strong> contains prose and visual data.</p>
<aside class="x-callout x-callout-note"><strong class="x-callout-title">Trust boundary</strong>
<p>Each visual uses a known schema. Labels remain text.</p>
</aside>
<figure class="x-graphic"><figcaption>Request pipeline</figcaption><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 950 140" role="img" aria-labelledby="xg-doc-1-title xg-doc-1-desc"><title id="xg-doc-1-title">Request pipeline</title><desc id="xg-doc-1-desc">A request passes through validation, storage, and a response.</desc><defs><marker id="xg-doc-1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="x-arrow"/></marker></defs><path d="M200 60L260 60" class="x-edge" marker-end="url(#xg-doc-1-arrow)"/><path d="M430 60L490 60" class="x-edge" marker-end="url(#xg-doc-1-arrow)"/><path d="M660 60L720 60" class="x-edge" marker-end="url(#xg-doc-1-arrow)"/><rect x="30" y="30" width="170" height="60" rx="10" class="x-node"/><text x="115" y="65" text-anchor="middle"><title>Request</title>Request</text><rect x="260" y="30" width="170" height="60" rx="10" class="x-node"/><text x="345" y="65" text-anchor="middle"><title>Validate</title>Validate</text><rect x="490" y="30" width="170" height="60" rx="10" class="x-node"/><text x="575" y="65" text-anchor="middle"><title>Store</title>Store</text><rect x="720" y="30" width="170" height="60" rx="10" class="x-node"/><text x="805" y="65" text-anchor="middle"><title>Response</title>Response</text></svg><p class="x-description">A request passes through validation, storage, and a response.</p></figure>
<figure class="x-graphic"><figcaption>Requests per day</figcaption><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 350" role="img" aria-labelledby="xg-doc-2-title xg-doc-2-desc"><title id="xg-doc-2-title">Requests per day</title><desc id="xg-doc-2-desc">Sample data: Monday 24, Tuesday 31, Wednesday 18, Thursday 42.</desc><path d="M72 274H696" class="x-grid"/><text x="62" y="278" text-anchor="end">0</text><path d="M72 211.5H696" class="x-grid"/><text x="62" y="215.5" text-anchor="end">10.5</text><path d="M72 149H696" class="x-grid"/><text x="62" y="153" text-anchor="end">21</text><path d="M72 86.5H696" class="x-grid"/><text x="62" y="90.5" text-anchor="end">31.5</text><path d="M72 24H696" class="x-grid"/><text x="62" y="28" text-anchor="end">42</text><path d="M72 274H696" class="x-axis"/><rect x="95.4" y="131.143" width="109.2" height="142.857" class="x-bar"><title>Mon: 24</title></rect><rect x="251.4" y="89.476" width="109.2" height="184.524" class="x-bar"><title>Tue: 31</title></rect><rect x="407.4" y="166.857" width="109.2" height="107.143" class="x-bar"><title>Wed: 18</title></rect><rect x="563.4" y="24" width="109.2" height="250" class="x-bar"><title>Thu: 42</title></rect><text x="150" y="298" text-anchor="middle"><title>Mon</title>Mon</text><text x="306" y="298" text-anchor="middle"><title>Tue</title>Tue</text><text x="462" y="298" text-anchor="middle"><title>Wed</title>Wed</text><text x="618" y="298" text-anchor="middle"><title>Thu</title>Thu</text><text x="384" y="338" text-anchor="middle">day</text><text x="16" y="149" transform="rotate(-90 16 149)" text-anchor="middle">requests</text></svg><p class="x-description">Sample data: Monday 24, Tuesday 31, Wednesday 18, Thursday 42.</p></figure>

```

HTML using shared graphics components:

```html
<h1>How a request moves</h1>
<p>The API validates a request before storing it. <strong>The same document</strong> contains prose and visual data.</p>
<aside class="x-callout x-callout-note"><strong class="x-callout-title">Trust boundary</strong>
<p>Each visual uses a known schema. Labels remain text.</p>
</aside>
<script type="application/json" data-graphic="x-diagram">{"title":"Request pipeline","description":"A request passes through validation, storage, and a response.","nodes":[{"id":"request","label":"Request"},{"id":"validate","label":"Validate"},{"id":"store","label":"Store"},{"id":"response","label":"Response"}],"edges":[["request","validate"],["validate","store"],["store","response"]]}</script>
<script type="application/json" data-graphic="x-chart">{"type":"bar","title":"Requests per day","x":"day","y":"requests","description":"Sample data: Monday 24, Tuesday 31, Wednesday 18, Thursday 42.","data":[{"day":"Mon","requests":24},{"day":"Tue","requests":31},{"day":"Wed","requests":18},{"day":"Thu","requests":42}]}</script>

```


### Complex: Rendered mathematical notation

Dollar-delimited math now compiles to native MathML through lazy-loaded KaTeX. The literal HTML example uses a hand-written equivalent equation; the XMarkdown renderer also retains the TeX source for accessibility and inspection.

XMarkdown source:

````markdown
# Mass–energy equivalence

$E = mc^2$
````

HTML source (compact literal HTML/SVG):

```html
<h1>Mass–energy equivalence</h1><math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="E equals m c squared"><mi>E</mi><mo>=</mo><mi>m</mi><msup><mi>c</mi><mn>2</mn></msup></math>
```

HTML using shared graphics components:

```html
<h1>Mass–energy equivalence</h1>
<p><span class="katex"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>E</mi><mo>=</mo><mi>m</mi><msup><mi>c</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">E = mc^2</annotation></semantics></math></span></p>

```


### Complex: A live queue what-if control

Both versions calculate the same queue status. XMarkdown uses a shared control runtime and a bounded expression interpreter. The HTML example supplies its own JavaScript. The XMarkdown author fragment can be larger for a tiny custom control; shared behavior is not counted as per-document code.

XMarkdown source:

````markdown
```x-widget
{"type":"controls","title":"Queue what-if","description":"Adjust arrival rate and service capacity to see whether the queue grows.","inputs":[{"id":"rate","label":"Requests per minute","type":"range","min":0,"max":180,"value":80}],"outputs":[{"id":"status","label":"Queue","expr":"rate + '/min: ' + (rate <= 100 ? 'capacity is sufficient' : 'queue grows by ' + (rate-100) + ' requests/min')"}]}
```
````

HTML source (compact literal HTML/SVG):

```html
<h1>Queue what-if</h1>
<label for="rate">Requests per minute</label>
<input id="rate" type="range" min="0" max="180" value="80">
<output id="result" aria-live="polite"></output>
<script>
const rate = document.getElementById('rate');
const result = document.getElementById('result');
function update() {
  const n = Number(rate.value);
  result.textContent = n + '/min: ' + (n <= 100 ? 'capacity is sufficient' : 'queue grows by ' + (n - 100) + ' requests/min');
}
rate.addEventListener('input', update);
update();
</script>
```

HTML using shared graphics components:

```html
<section class="x-graphic x-controls" data-x-widget="{&quot;spec&quot;:{&quot;type&quot;:&quot;controls&quot;,&quot;title&quot;:&quot;Queue what-if&quot;,&quot;description&quot;:&quot;Adjust arrival rate and service capacity to see whether the queue grows.&quot;,&quot;inputs&quot;:[{&quot;id&quot;:&quot;rate&quot;,&quot;label&quot;:&quot;Requests per minute&quot;,&quot;type&quot;:&quot;range&quot;,&quot;min&quot;:0,&quot;max&quot;:180,&quot;value&quot;:80,&quot;step&quot;:1}],&quot;outputs&quot;:[{&quot;id&quot;:&quot;status&quot;,&quot;label&quot;:&quot;Queue&quot;}]},&quot;compiled&quot;:[[&quot;binary&quot;,&quot;+&quot;,[&quot;binary&quot;,&quot;+&quot;,[&quot;variable&quot;,&quot;rate&quot;],[&quot;literal&quot;,&quot;/min: &quot;]],[&quot;conditional&quot;,[&quot;binary&quot;,&quot;&lt;=&quot;,[&quot;variable&quot;,&quot;rate&quot;],[&quot;literal&quot;,100]],[&quot;literal&quot;,&quot;capacity is sufficient&quot;],[&quot;binary&quot;,&quot;+&quot;,[&quot;binary&quot;,&quot;+&quot;,[&quot;literal&quot;,&quot;queue grows by &quot;],[&quot;binary&quot;,&quot;-&quot;,[&quot;variable&quot;,&quot;rate&quot;],[&quot;literal&quot;,100]]],[&quot;literal&quot;,&quot; requests/min&quot;]]]]]}"><h3>Queue what-if</h3><p class="x-description">Adjust arrival rate and service capacity to see whether the queue grows.</p><div class="x-inputs"><label for="xg-doc-1-rate">Requests per minute<input id="xg-doc-1-rate" data-input="rate" type="range" min="0" max="180" step="1" value="80"></label></div><div class="x-outputs"><div><span>Queue: </span><output data-output="status" aria-live="polite">80/min: capacity is sufficient</output></div></div><noscript>Controls require the trusted XMarkdown widget runtime.</noscript></section>

```


### Complex: A drawing application

XMarkdown now supports a drawing widget with undo and clear through a shared SVG runtime. The HTML example uses canvas and clear. These offer the same basic drawing task, with an extra undo action in XMarkdown; they do not have identical pixels or event implementations.

XMarkdown source:

````markdown
```x-widget
{"type":"draw","title":"Sketch a diagram","description":"Drag to draw; use Undo stroke or Clear drawing to edit.","width":640,"height":320,"color":"#2563eb","lineWidth":3}
```
````

HTML source (compact literal HTML/SVG):

```html
<h1>Sketch a diagram</h1>
<p>Drag inside the canvas to draw. This example stays in the browser.</p>
<canvas id="drawing" width="640" height="320" aria-label="Freehand drawing area"></canvas>
<button id="clear">Clear drawing</button>
<style>canvas{display:block;max-width:100%;border:1px solid #94a3b8;touch-action:none}button{margin-top:12px}</style>
<script>
const canvas = document.getElementById('drawing');
const ctx = canvas.getContext('2d');
ctx.lineWidth = 3; ctx.strokeStyle = '#2563eb';
let drawing = false;
function point(event) {
  const r = canvas.getBoundingClientRect();
  return [(event.clientX-r.left)*canvas.width/r.width, (event.clientY-r.top)*canvas.height/r.height];
}
canvas.addEventListener('pointerdown', event => {
  drawing = true; canvas.setPointerCapture(event.pointerId);
  ctx.beginPath(); ctx.moveTo(...point(event));
});
canvas.addEventListener('pointermove', event => {
  if (drawing) { ctx.lineTo(...point(event)); ctx.stroke(); }
});
canvas.addEventListener('pointerup', () => { drawing = false; });
canvas.addEventListener('pointercancel', () => { drawing = false; });
document.getElementById('clear').addEventListener('click', () => ctx.clearRect(0,0,canvas.width,canvas.height));
</script>
```

HTML using shared graphics components:

```html
<figure class="x-graphic x-drawing" data-x-widget="{&quot;spec&quot;:{&quot;type&quot;:&quot;draw&quot;,&quot;title&quot;:&quot;Sketch a diagram&quot;,&quot;description&quot;:&quot;Drag to draw; use Undo stroke or Clear drawing to edit.&quot;,&quot;width&quot;:640,&quot;height&quot;:320,&quot;color&quot;:&quot;#2563eb&quot;,&quot;lineWidth&quot;:3}}"><figcaption>Sketch a diagram</figcaption><svg viewBox="0 0 640 320" role="img" aria-label="Drag to draw; use Undo stroke or Clear drawing to edit."></svg><div class="x-draw-actions"><button type="button" data-action="undo">Undo stroke</button> <button type="button" data-action="clear">Clear drawing</button><span role="status" aria-live="polite">0 strokes</span></div><p class="x-description">Drag to draw; use Undo stroke or Clear drawing to edit.</p><noscript>Drawing controls require the trusted XMarkdown widget runtime.</noscript></figure>

```


### Difficult: A complex vector scene

Paths, groups, gradients, clipping, masks, markers, and reusable symbols are supported through validated scene tuples. Shared-component HTML currently uses the rendered SVG for this case; the JSON template adapter is limited to charts and diagrams.

XMarkdown source:

````markdown
```x-svg
{"title":"From idea to delivery","description":"Three reusable cards on a gradient background, connected by a curved path, with clipping and a masked highlight.","viewBox":[0,0,720,380],"children":[["defs",{},["linearGradient",{"id":"ocean","x1":"0%","y1":"0%","x2":"100%","y2":"100%"},["stop",{"offset":"0%","stop-color":"#0f172a"}],["stop",{"offset":"100%","stop-color":"#2563eb"}]],["linearGradient",{"id":"fade"},["stop",{"offset":"0%","stop-color":"white","stop-opacity":0}],["stop",{"offset":"100%","stop-color":"white"}]],["clipPath",{"id":"frame"},["rect",{"width":720,"height":380,"rx":24}]],["mask",{"id":"highlight"},["rect",{"width":720,"height":380,"fill":"url(#fade)"}]],["symbol",{"id":"card","viewBox":"0 0 180 76"},["rect",{"width":180,"height":76,"rx":14,"fill":"white","fill-opacity":0.95}],["path",{"d":"M18 56H162","stroke":"#cbd5e1","stroke-width":2}]],["marker",{"id":"arrow","viewBox":"0 0 10 10","refX":9,"refY":5,"markerWidth":7,"markerHeight":7,"orient":"auto"},["path",{"d":"M0 0L10 5L0 10Z","fill":"#93c5fd"}]]],["g",{"clip-path":"url(#frame)"},["rect",{"width":720,"height":380,"fill":"url(#ocean)"}],["circle",{"cx":650,"cy":75,"r":170,"fill":"#38bdf8","opacity":0.35,"mask":"url(#highlight)"}],["path",{"d":"M-20 330C130 140 240 430 390 280S590 170 750 290","fill":"none","stroke":"#38bdf8","stroke-width":32,"opacity":0.2}],["text",{"x":36,"y":62,"fill":"white","font-size":32,"font-weight":"bold"},"From idea to delivery"],["text",{"x":36,"y":96,"fill":"#bfdbfe","font-size":16},"Paths, gradients, clipping, masks, and reusable symbols"],["g",{"fill":"none","stroke":"#93c5fd","stroke-width":3,"marker-end":"url(#arrow)"},["path",{"d":"M216 222C232 158 254 158 270 222"}],["path",{"d":"M450 222C466 286 488 286 504 222"}]],["use",{"href":"#card","x":36,"y":184,"width":180,"height":76}],["use",{"href":"#card","x":270,"y":184,"width":180,"height":76}],["use",{"href":"#card","x":504,"y":184,"width":180,"height":76}],["text",{"x":126,"y":218,"text-anchor":"middle","fill":"#172b45","font-size":18},"Describe"],["text",{"x":360,"y":218,"text-anchor":"middle","fill":"#172b45","font-size":18},"Validate"],["text",{"x":594,"y":218,"text-anchor":"middle","fill":"#172b45","font-size":18},"Render"],["text",{"x":36,"y":346,"fill":"#bfdbfe","font-size":14},"One scene, shared geometry, predictable rendering."]]]}
```
````

HTML source (compact literal HTML/SVG):

```html
<figure class="x-graphic x-scene"><figcaption>From idea to delivery</figcaption><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 380" role="img" aria-labelledby="xg-doc-1-title xg-doc-1-desc"><title id="xg-doc-1-title">From idea to delivery</title><desc id="xg-doc-1-desc">Three reusable cards on a gradient background, connected by a curved path, with clipping and a masked highlight.</desc><defs><linearGradient id="xg-doc-1-scene-ocean" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"></stop><stop offset="100%" stop-color="#2563eb"></stop></linearGradient><linearGradient id="xg-doc-1-scene-fade"><stop offset="0%" stop-color="white" stop-opacity="0"></stop><stop offset="100%" stop-color="white"></stop></linearGradient><clipPath id="xg-doc-1-scene-frame"><rect width="720" height="380" rx="24"></rect></clipPath><mask id="xg-doc-1-scene-highlight"><rect width="720" height="380" fill="url(#xg-doc-1-scene-fade)"></rect></mask><symbol id="xg-doc-1-scene-card" viewBox="0 0 180 76"><rect width="180" height="76" rx="14" fill="white" fill-opacity="0.95"></rect><path d="M18 56H162" stroke="#cbd5e1" stroke-width="2"></path></symbol><marker id="xg-doc-1-scene-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#93c5fd"></path></marker></defs><g clip-path="url(#xg-doc-1-scene-frame)"><rect width="720" height="380" fill="url(#xg-doc-1-scene-ocean)"></rect><circle cx="650" cy="75" r="170" fill="#38bdf8" opacity="0.35" mask="url(#xg-doc-1-scene-highlight)"></circle><path d="M-20 330C130 140 240 430 390 280S590 170 750 290" fill="none" stroke="#38bdf8" stroke-width="32" opacity="0.2"></path><text x="36" y="62" fill="white" font-size="32" font-weight="bold">From idea to delivery</text><text x="36" y="96" fill="#bfdbfe" font-size="16">Paths, gradients, clipping, masks, and reusable symbols</text><g fill="none" stroke="#93c5fd" stroke-width="3" marker-end="url(#xg-doc-1-scene-arrow)"><path d="M216 222C232 158 254 158 270 222"></path><path d="M450 222C466 286 488 286 504 222"></path></g><use href="#xg-doc-1-scene-card" x="36" y="184" width="180" height="76"></use><use href="#xg-doc-1-scene-card" x="270" y="184" width="180" height="76"></use><use href="#xg-doc-1-scene-card" x="504" y="184" width="180" height="76"></use><text x="126" y="218" text-anchor="middle" fill="#172b45" font-size="18">Describe</text><text x="360" y="218" text-anchor="middle" fill="#172b45" font-size="18">Validate</text><text x="594" y="218" text-anchor="middle" fill="#172b45" font-size="18">Render</text><text x="36" y="346" fill="#bfdbfe" font-size="14">One scene, shared geometry, predictable rendering.</text></g></svg><p class="x-description">Three reusable cards on a gradient background, connected by a curved path, with clipping and a masked highlight.</p></figure>

```

HTML using shared graphics components:

```html
<figure class="x-graphic x-scene"><figcaption>From idea to delivery</figcaption><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 380" role="img" aria-labelledby="xg-doc-1-title xg-doc-1-desc"><title id="xg-doc-1-title">From idea to delivery</title><desc id="xg-doc-1-desc">Three reusable cards on a gradient background, connected by a curved path, with clipping and a masked highlight.</desc><defs><linearGradient id="xg-doc-1-scene-ocean" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0f172a"></stop><stop offset="100%" stop-color="#2563eb"></stop></linearGradient><linearGradient id="xg-doc-1-scene-fade"><stop offset="0%" stop-color="white" stop-opacity="0"></stop><stop offset="100%" stop-color="white"></stop></linearGradient><clipPath id="xg-doc-1-scene-frame"><rect width="720" height="380" rx="24"></rect></clipPath><mask id="xg-doc-1-scene-highlight"><rect width="720" height="380" fill="url(#xg-doc-1-scene-fade)"></rect></mask><symbol id="xg-doc-1-scene-card" viewBox="0 0 180 76"><rect width="180" height="76" rx="14" fill="white" fill-opacity="0.95"></rect><path d="M18 56H162" stroke="#cbd5e1" stroke-width="2"></path></symbol><marker id="xg-doc-1-scene-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#93c5fd"></path></marker></defs><g clip-path="url(#xg-doc-1-scene-frame)"><rect width="720" height="380" fill="url(#xg-doc-1-scene-ocean)"></rect><circle cx="650" cy="75" r="170" fill="#38bdf8" opacity="0.35" mask="url(#xg-doc-1-scene-highlight)"></circle><path d="M-20 330C130 140 240 430 390 280S590 170 750 290" fill="none" stroke="#38bdf8" stroke-width="32" opacity="0.2"></path><text x="36" y="62" fill="white" font-size="32" font-weight="bold">From idea to delivery</text><text x="36" y="96" fill="#bfdbfe" font-size="16">Paths, gradients, clipping, masks, and reusable symbols</text><g fill="none" stroke="#93c5fd" stroke-width="3" marker-end="url(#xg-doc-1-scene-arrow)"><path d="M216 222C232 158 254 158 270 222"></path><path d="M450 222C466 286 488 286 504 222"></path></g><use href="#xg-doc-1-scene-card" x="36" y="184" width="180" height="76"></use><use href="#xg-doc-1-scene-card" x="270" y="184" width="180" height="76"></use><use href="#xg-doc-1-scene-card" x="504" y="184" width="180" height="76"></use><text x="126" y="218" text-anchor="middle" fill="#172b45" font-size="18">Describe</text><text x="360" y="218" text-anchor="middle" fill="#172b45" font-size="18">Validate</text><text x="594" y="218" text-anchor="middle" fill="#172b45" font-size="18">Render</text><text x="36" y="346" fill="#bfdbfe" font-size="14">One scene, shared geometry, predictable rendering.</text></g></svg><p class="x-description">Three reusable cards on a gradient background, connected by a curved path, with clipping and a masked highlight.</p></figure>

```


### Difficult: An existing SVG import

Existing SVG markup is checked and converted into the same scene representation. Raw SVG adds fence overhead rather than saving syntax tokens. Scripts, external resources, animation, CSS stylesheets, and foreignObject are outside the import profile.

XMarkdown source:

````markdown
```x-svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 220">
<title>Imported vector wave</title><desc>An existing SVG with a gradient, a clipping path, and a cubic curve.</desc>
<defs><linearGradient id="sea"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#0ea5e9"/></linearGradient><clipPath id="edge"><rect width="640" height="220" rx="20"/></clipPath></defs>
<g clip-path="url(#edge)"><rect width="640" height="220" fill="url(#sea)"/><path d="M0 170C140 10 270 300 400 130S570 90 640 150V220H0Z" fill="#38bdf8" opacity="0.4"/><text x="30" y="60" fill="white" font-size="28">SVG import works</text></g></svg>
```
````

HTML source (compact literal HTML/SVG):

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 220">
<title>Imported vector wave</title><desc>An existing SVG with a gradient, a clipping path, and a cubic curve.</desc>
<defs><linearGradient id="sea"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#0ea5e9"/></linearGradient><clipPath id="edge"><rect width="640" height="220" rx="20"/></clipPath></defs>
<g clip-path="url(#edge)"><rect width="640" height="220" fill="url(#sea)"/><path d="M0 170C140 10 270 300 400 130S570 90 640 150V220H0Z" fill="#38bdf8" opacity="0.4"/><text x="30" y="60" fill="white" font-size="28">SVG import works</text></g></svg>
```

HTML using shared graphics components:

```html
<figure class="x-graphic x-scene"><figcaption>Imported vector wave</figcaption><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 220" role="img" aria-labelledby="xg-doc-1-title xg-doc-1-desc"><title id="xg-doc-1-title">Imported vector wave</title><desc id="xg-doc-1-desc">An existing SVG with a gradient, a clipping path, and a cubic curve.</desc><g><title>Imported vector wave</title><desc>An existing SVG with a gradient, a clipping path, and a cubic curve.</desc><defs><linearGradient id="xg-doc-1-scene-sea"><stop offset="0%" stop-color="#0f172a"></stop><stop offset="100%" stop-color="#0ea5e9"></stop></linearGradient><clipPath id="xg-doc-1-scene-edge"><rect width="640" height="220" rx="20"></rect></clipPath></defs><g clip-path="url(#xg-doc-1-scene-edge)"><rect width="640" height="220" fill="url(#xg-doc-1-scene-sea)"></rect><path d="M0 170C140 10 270 300 400 130S570 90 640 150V220H0Z" fill="#38bdf8" opacity="0.4"></path><text x="30" y="60" fill="white" font-size="28">SVG import works</text></g></g></svg><p class="x-description">An existing SVG with a gradient, a clipping path, and a cubic curve.</p></figure>

```
