# Extended XMarkdown

Math, controls, drawing, and vector scenes in one document.

## Mathematics

Mass–energy equivalence: $E = mc^2$.

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$

## A live control

```x-widget
{"type":"controls","title":"Queue what-if","description":"Adjust arrival rate and service capacity to see whether the queue grows.","inputs":[{"id":"rate","label":"Requests per minute","type":"range","min":0,"max":180,"value":80},{"id":"capacity","label":"Capacity per minute","type":"number","min":1,"max":240,"value":100}],"outputs":[{"id":"status","label":"Queue status","expr":"rate <= capacity ? 'capacity is sufficient' : 'queue grows by ' + (rate-capacity) + ' requests/min'"}]}
```

## Drawing

```x-widget
{"type":"draw","title":"Sketch a diagram","description":"Drag to draw; use Undo stroke or Clear drawing to edit.","width":640,"height":320,"color":"#2563eb","lineWidth":3}
```

## A complex vector scene

```x-svg
{"title":"From idea to delivery","description":"Three reusable cards on a gradient background, connected by a curved path, with clipping and a masked highlight.","viewBox":[0,0,720,380],"children":[["defs",{},["linearGradient",{"id":"ocean","x1":"0%","y1":"0%","x2":"100%","y2":"100%"},["stop",{"offset":"0%","stop-color":"#0f172a"}],["stop",{"offset":"100%","stop-color":"#2563eb"}]],["linearGradient",{"id":"fade"},["stop",{"offset":"0%","stop-color":"white","stop-opacity":0}],["stop",{"offset":"100%","stop-color":"white"}]],["clipPath",{"id":"frame"},["rect",{"width":720,"height":380,"rx":24}]],["mask",{"id":"highlight"},["rect",{"width":720,"height":380,"fill":"url(#fade)"}]],["symbol",{"id":"card","viewBox":"0 0 180 76"},["rect",{"width":180,"height":76,"rx":14,"fill":"white","fill-opacity":0.95}],["path",{"d":"M18 56H162","stroke":"#cbd5e1","stroke-width":2}]],["marker",{"id":"arrow","viewBox":"0 0 10 10","refX":9,"refY":5,"markerWidth":7,"markerHeight":7,"orient":"auto"},["path",{"d":"M0 0L10 5L0 10Z","fill":"#93c5fd"}]]],["g",{"clip-path":"url(#frame)"},["rect",{"width":720,"height":380,"fill":"url(#ocean)"}],["circle",{"cx":650,"cy":75,"r":170,"fill":"#38bdf8","opacity":0.35,"mask":"url(#highlight)"}],["path",{"d":"M-20 330C130 140 240 430 390 280S590 170 750 290","fill":"none","stroke":"#38bdf8","stroke-width":32,"opacity":0.2}],["text",{"x":36,"y":62,"fill":"white","font-size":32,"font-weight":"bold"},"From idea to delivery"],["text",{"x":36,"y":96,"fill":"#bfdbfe","font-size":16},"Paths, gradients, clipping, masks, and reusable symbols"],["g",{"fill":"none","stroke":"#93c5fd","stroke-width":3,"marker-end":"url(#arrow)"},["path",{"d":"M216 222C232 158 254 158 270 222"}],["path",{"d":"M450 222C466 286 488 286 504 222"}]],["use",{"href":"#card","x":36,"y":184,"width":180,"height":76}],["use",{"href":"#card","x":270,"y":184,"width":180,"height":76}],["use",{"href":"#card","x":504,"y":184,"width":180,"height":76}],["text",{"x":126,"y":218,"text-anchor":"middle","fill":"#172b45","font-size":18},"Describe"],["text",{"x":360,"y":218,"text-anchor":"middle","fill":"#172b45","font-size":18},"Validate"],["text",{"x":594,"y":218,"text-anchor":"middle","fill":"#172b45","font-size":18},"Render"],["text",{"x":36,"y":346,"fill":"#bfdbfe","font-size":14},"One scene, shared geometry, predictable rendering."]]]}
```

## Import an existing SVG

```x-svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 220">
<title>Imported vector wave</title><desc>An existing SVG with a gradient, a clipping path, and a cubic curve.</desc>
<defs><linearGradient id="sea"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#0ea5e9"/></linearGradient><clipPath id="edge"><rect width="640" height="220" rx="20"/></clipPath></defs>
<g clip-path="url(#edge)"><rect width="640" height="220" fill="url(#sea)"/><path d="M0 170C140 10 270 300 400 130S570 90 640 150V220H0Z" fill="#38bdf8" opacity="0.4"/><text x="30" y="60" fill="white" font-size="28">SVG import works</text></g></svg>
```
