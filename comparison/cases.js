import { demoSource } from '../demo/content.js';
import { controlsSpec, drawingSpec, sceneSpec, importedSvg } from '../demo/extended-content.js';

const graphic = (kind, spec) => '```' + kind + '\n' + (typeof spec==='string'?spec:JSON.stringify(spec)) + '\n```\n';
const chart = {type:'bar',title:'Requests per day',x:'day',y:'requests',description:'Monday 24, Tuesday 31, Wednesday 18, Thursday 42.',data:[{day:'Mon',requests:24},{day:'Tue',requests:31},{day:'Wed',requests:18},{day:'Thu',requests:42}]};
const pipeline = {title:'Pipeline',description:'Requests move through validation, storage, and a response.',nodes:[{id:'request',label:'Request'},{id:'validate',label:'Validate'},{id:'store',label:'Store'},{id:'response',label:'Response'}],edges:[['request','validate'],['validate','store'],['store','response']]};
const dependencies = {title:'Release dependencies',description:'Build feeds unit tests and packaging. Unit tests and packaging feed integration tests. Integration tests feed release and notification.',direction:'LR',nodes:[{id:'build',label:'Build'},{id:'unit',label:'Unit tests'},{id:'package',label:'Package'},{id:'integration',label:'Integration tests'},{id:'release',label:'Release'},{id:'notify',label:'Notify'}],edges:[['build','unit'],['build','package'],['unit','integration'],['package','integration'],['integration','release'],['release','notify']]};

export const cases = [
  {id:'01-prose',level:'Easy',title:'Headings, emphasis, and lists',supported:true,
    x:'# Release\n\nThe parser is **ready for review**.\n\n- Check correctness\n- Check performance\n',
    assessment:'Markdown is concise and familiar. On long plain prose the relative savings shrink because most tokens are the same words.'},
  {id:'02-table',level:'Easy',title:'A comparison table',supported:true,
    x:'| Format | Strength |\n|---|---|\n| XMarkdown | Structured documents |\n| HTML | Custom interfaces |\n',
    assessment:'Markdown usually saves table markup. HTML supports features this table syntax does not: row/column spans, custom cell layouts, and interactive controls.'},
  {id:'03-callout',level:'Easy',title:'A callout',supported:true,
    x:':::warning[Input boundary]\nTreat labels as **text** and validate graphic data.\n:::\n',
    assessment:'The directive is compact when a host supplies the appearance. A shared HTML callout component can be similarly compact.'},
  {id:'04-chart',level:'Complex',title:'A chart with axes and labels',supported:true,x:graphic('x-chart',chart),
    assessment:'The data specification avoids coordinates, axis construction, and repeated SVG tags. The advantage becomes much smaller if HTML uses a shared chart component.'},
  {id:'05-diagram',level:'Complex',title:'An automatically placed pipeline',supported:true,x:graphic('x-diagram',pipeline),
    assessment:'XMarkdown states relationships. HTML/SVG permits manual placement, custom shapes, and edge styling. Those controls are absent from this profile.'},
  {id:'06-dependencies',level:'Difficult',title:'A branching dependency graph',supported:true,x:graphic('x-diagram',dependencies),
    assessment:'The graph fits the current schema. Layout is basic and may contain crossings; exact routing, edge labels, and decision shapes favor custom HTML/SVG.'},
  {id:'07-exact-demo',level:'Difficult',title:'The exact playground document',supported:true,x:demoSource,
    assessment:'This is the same 839-code-unit source used by the live playground. It combines prose, a callout, a four-node diagram, and a four-value chart.'},
  {id:'08-math',level:'Complex',title:'Rendered mathematical notation',supported:true,
    x:'# Mass–energy equivalence\n\n$E = mc^2$\n',
    html:'<h1>Mass–energy equivalence</h1><math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="E equals m c squared"><mi>E</mi><mo>=</mo><mi>m</mi><msup><mi>c</mi><mn>2</mn></msup></math>',
    assessment:'Dollar-delimited math now compiles to native MathML through lazy-loaded KaTeX. The literal HTML example uses a hand-written equivalent equation; the XMarkdown renderer also retains the TeX source for accessibility and inspection.'},
  {id:'09-interaction',level:'Complex',title:'A live queue what-if control',supported:true,
    x:graphic('x-widget',{...controlsSpec,inputs:[controlsSpec.inputs[0]],outputs:[{id:'status',label:'Queue',expr:"rate + '/min: ' + (rate <= 100 ? 'capacity is sufficient' : 'queue grows by ' + (rate-100) + ' requests/min')"}]}),
    html:`<h1>Queue what-if</h1>
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
</script>`,
    assessment:'Both versions calculate the same queue status. XMarkdown uses a shared control runtime and a bounded expression interpreter. The HTML example supplies its own JavaScript. The XMarkdown author fragment can be larger for a tiny custom control; shared behavior is not counted as per-document code.'},
  {id:'10-canvas',level:'Complex',title:'A drawing application',supported:true,x:graphic('x-widget',drawingSpec),
    html:`<h1>Sketch a diagram</h1>
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
</script>`,
    assessment:'XMarkdown now supports a drawing widget with undo and clear through a shared SVG runtime. The HTML example uses canvas and clear. These offer the same basic drawing task, with an extra undo action in XMarkdown; they do not have identical pixels or event implementations.'},
  {id:'11-scene',level:'Difficult',title:'A complex vector scene',supported:true,x:graphic('x-svg',sceneSpec),assessment:'Paths, groups, gradients, clipping, masks, markers, and reusable symbols are supported through validated scene tuples. Shared-component HTML currently uses the rendered SVG for this case; the JSON template adapter is limited to charts and diagrams.'},
  {id:'12-import',level:'Difficult',title:'An existing SVG import',supported:true,x:graphic('x-svg',importedSvg),html:importedSvg,assessment:'Existing SVG markup is checked and converted into the same scene representation. Raw SVG adds fence overhead rather than saving syntax tokens. Scripts, external resources, animation, CSS stylesheets, and foreignObject are outside the import profile.'},
];

export const authorGuide = `Produce XMarkdown source, not HTML. Use ordinary Markdown for prose, lists, tables, and code.
Callouts: :::note[Title], :::tip[Title], or :::warning[Title], Markdown content, then ::: on a new line.
Charts: a closed x-chart code fence containing JSON with type (bar or line), title, description, x and y field names, and data (objects containing a string x field and a numeric y field). Maximum 256 rows. Numbers must be finite within +/-1e12.
Diagrams: a closed x-diagram code fence containing JSON with title, description, optional direction (LR or TD), nodes (unique id and label), and edges (pairs of existing node IDs). Maximum 32 nodes and 128 edges. IDs start with a letter and contain letters, digits, underscores, or hyphens.
Math: $inline TeX$, $$ on separate lines for display TeX, or a closed x-math fence. Equations are bounded and compiled with trust disabled.
Widgets: x-widget JSON, type controls with title, description, inputs and outputs; or type draw with title, description and optional width, height, color and lineWidth. Controls use range/number/select/toggle inputs and outputs with expr strings; expressions may use earlier outputs, arithmetic, comparisons, conditionals, min/max/abs/round/floor/ceil/clamp. No programs or property access.
SVG: x-svg JSON with title, description, viewBox and children tuples [tag, attributes, ...children], or supported raw SVG markup. Local references only. Paths, groups, gradients, clips, masks, markers, patterns, symbols and reuse are supported. Scripts, external assets, foreignObject, animation and filters are rejected.
Labels are plain text. Do not emit author programs, imports, or unsupported fields. Mermaid is retained as source rather than rendered.
`;
