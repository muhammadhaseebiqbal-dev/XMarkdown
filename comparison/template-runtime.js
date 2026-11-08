(()=>{
const forbidden = new Set(['__proto__', 'constructor', 'prototype']);

function fail(message) { throw new Error(message); }
function object(value, allowed, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${name} must be an object`);
  for (const key of Object.keys(value)) {
    if (forbidden.has(key) || !allowed.includes(key)) fail(`Unsupported ${name} property: ${key}`);
  }
}
function string(value, name, maximum = 160) {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum) {
    fail(`${name} must be a nonempty string of at most ${maximum} characters`);
  }
}

function validateGraphic(kind, source, limits) {
  if (source.length > limits.maxGraphicCodeUnits) fail('Graphic block exceeds the source limit');
  if (kind === 'mermaid') {
    // Retain source as data. A future Mermaid adapter must apply its own host policy.
    if (/%%\{|^\s*---/m.test(source)) fail('Document-supplied Mermaid configuration is disabled');
    return { kind, source };
  }
  let spec;
  try { spec = JSON.parse(source); } catch { fail('Graphic block must contain valid JSON'); }
  if (kind === 'x-chart') {
    object(spec, ['type', 'title', 'x', 'y', 'data', 'description'], 'chart');
    if (!['bar', 'line'].includes(spec.type)) fail('Chart type must be bar or line');
    string(spec.title, 'title');
    string(spec.description, 'description', 1024);
    for (const field of ['x', 'y']) {
      string(spec[field], field, 64);
      if (forbidden.has(spec[field])) fail(`Unsupported field: ${spec[field]}`);
    }
    if (spec.x === spec.y) fail('Chart x and y fields must differ');
    if (!Array.isArray(spec.data) || !spec.data.length || spec.data.length > limits.maxChartRows) {
      fail(`Chart must contain 1–${limits.maxChartRows} rows`);
    }
    for (const row of spec.data) {
      object(row, [spec.x, spec.y], 'row');
      string(row[spec.x], 'x label', 80);
      if (typeof row[spec.y] !== 'number' || !Number.isFinite(row[spec.y]) || Math.abs(row[spec.y]) > 1e12) {
        fail('Chart values must be finite numbers between -1e12 and 1e12');
      }
    }
    return { kind, spec };
  }
  object(spec, ['title', 'description', 'direction', 'nodes', 'edges'], 'diagram');
  string(spec.title, 'title');
  string(spec.description, 'description', 1024);
  if (spec.direction !== undefined && !['LR', 'TD'].includes(spec.direction)) fail('Direction must be LR or TD');
  if (!Array.isArray(spec.nodes) || !spec.nodes.length || spec.nodes.length > limits.maxDiagramNodes) {
    fail(`Diagram must contain 1–${limits.maxDiagramNodes} nodes`);
  }
  const ids = new Set();
  for (const node of spec.nodes) {
    object(node, ['id', 'label'], 'node');
    if (typeof node.id !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(node.id)) fail('Invalid node id');
    if (ids.has(node.id)) fail(`Duplicate node id: ${node.id}`);
    ids.add(node.id);
    string(node.label, 'node label', 80);
  }
  if (!Array.isArray(spec.edges) || spec.edges.length > limits.maxDiagramEdges) fail('Diagram edge limit exceeded');
  for (const edge of spec.edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(id => ids.has(id))) fail('Edges must reference two existing nodes');
  }
  return { kind, spec };
}

function escape(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}

function svgStart(title, description, width, height, id) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(description)}</desc>`;
}

function chartSvg(spec, id) {
  const width = 720, height = 350, left = 72, right = 24, top = 24, bottom = 76;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const values = spec.data.map(row => row[spec.y]);
  let min = Math.min(0, ...values), max = Math.max(0, ...values);
  if (max === min) max = min + 1;
  const y = value => top + (max - value) / (max - min) * plotHeight;
  const step = plotWidth / spec.data.length;
  let svg = svgStart(spec.title, spec.description, width, height, id);
  for (let i = 0; i <= 4; i++) {
    const value = min + (max - min) * i / 4, yy = y(value);
    svg += `<path d="M${left} ${yy}H${width-right}" class="x-grid"/><text x="${left-10}" y="${yy+4}" text-anchor="end">${escape(Number(value.toPrecision(4)))}</text>`;
  }
  svg += `<path d="M${left} ${y(0)}H${width-right}" class="x-axis"/>`;
  if (spec.type === 'bar') {
    for (let i = 0; i < values.length; i++) {
      const yy = y(values[i]), zero = y(0);
      svg += `<rect x="${left+i*step+step*.15}" y="${Math.min(yy,zero)}" width="${step*.7}" height="${Math.abs(zero-yy)}" class="x-bar"><title>${escape(spec.data[i][spec.x])}: ${escape(values[i])}</title></rect>`;
    }
  } else {
    svg += `<polyline points="${values.map((v,i) => `${left+step*(i+.5)},${y(v)}`).join(' ')}" class="x-line"/>`;
  }
  const every = Math.max(1, Math.ceil(spec.data.length / 10));
  for (let i = 0; i < spec.data.length; i += every) {
    const label = spec.data[i][spec.x];
    svg += `<text x="${left+step*(i+.5)}" y="${height-bottom+24}" text-anchor="middle"><title>${escape(label)}</title>${escape(label.length>12 ? label.slice(0,11)+'…' : label)}</text>`;
  }
  svg += `<text x="${left+plotWidth/2}" y="${height-12}" text-anchor="middle">${escape(spec.x)}</text>`;
  svg += `<text x="16" y="${top+plotHeight/2}" transform="rotate(-90 16 ${top+plotHeight/2})" text-anchor="middle">${escape(spec.y)}</text>`;
  return svg + '</svg>';
}

function diagramSvg(spec, id) {
  const nodes = spec.nodes, ids = new Map(nodes.map((node,i) => [node.id,i]));
  const ranks = nodes.map(() => 0), incoming = nodes.map(() => 0), outgoing = nodes.map(() => []);
  for (const [from,to] of spec.edges) { outgoing[ids.get(from)].push(ids.get(to)); incoming[ids.get(to)]++; }
  const queue = [];
  incoming.forEach((n,i) => { if (!n) queue.push(i); });
  let visited = 0;
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head]; visited++;
    for (const next of outgoing[i]) { ranks[next] = Math.max(ranks[next], ranks[i]+1); if (!--incoming[next]) queue.push(next); }
  }
  // Cyclic graphs use a deterministic grid rather than unbounded rank iteration.
  if (visited !== nodes.length) nodes.forEach((_,i) => { ranks[i] = Math.floor(i/4); });
  const counts = new Map(), slots = ranks.map(rank => { const n = counts.get(rank) || 0; counts.set(rank,n+1); return n; });
  const horizontal = spec.direction !== 'TD';
  const rankCount = Math.max(...ranks)+1, slotCount = Math.max(...counts.values());
  const width = horizontal ? rankCount*230+30 : slotCount*230+30;
  const height = horizontal ? slotCount*110+30 : rankCount*110+30;
  const positions = nodes.map((_,i) => horizontal ? [30+ranks[i]*230,30+slots[i]*110] : [30+slots[i]*230,30+ranks[i]*110]);
  let svg = svgStart(spec.title,spec.description,width,height,id);
  svg += `<defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="x-arrow"/></marker></defs>`;
  for (const [from,to] of spec.edges) {
    const [x1,y1] = positions[ids.get(from)], [x2,y2] = positions[ids.get(to)];
    const dx=x2-x1,dy=y2-y1;
    let path;
    if (!dx && !dy) path=`M${x1+130} ${y1}C${x1+220} ${y1-28} ${x1-40} ${y1-28} ${x1+40} ${y1}`;
    else {
      const factor=Math.min(dx ? 85/Math.abs(dx) : Infinity,dy ? 30/Math.abs(dy) : Infinity);
      path=`M${x1+85+dx*factor} ${y1+30+dy*factor}L${x2+85-dx*factor} ${y2+30-dy*factor}`;
    }
    svg += `<path d="${path}" class="x-edge" marker-end="url(#${id}-arrow)"/>`;
  }
  for (let i=0; i<nodes.length; i++) {
    const [x,y] = positions[i], label=nodes[i].label;
    svg += `<rect x="${x}" y="${y}" width="170" height="60" rx="10" class="x-node"/><text x="${x+85}" y="${y+35}" text-anchor="middle"><title>${escape(label)}</title>${escape(label.length>20 ? label.slice(0,19)+'…' : label)}</text>`;
  }
  return svg+'</svg>';
}

function renderGraphic(graphic, id) {
  const {kind,spec} = graphic;
  if (kind === 'mermaid') return `<pre class="x-diagram-source"><code>${escape(graphic.source)}</code></pre>\n`;
  const svg = kind === 'x-chart' ? chartSvg(spec,id) : diagramSvg(spec,id);
  return `<figure class="x-graphic"><figcaption>${escape(spec.title)}</figcaption>${svg}<p class="x-description">${escape(spec.description)}</p></figure>\n`;
}

const graphicStyles = `
.x-graphic{margin:1.5rem 0;padding:1rem;border:1px solid #d5dfeb;border-radius:12px;background:#fff}
.x-graphic figcaption{font-weight:650;margin-bottom:.75rem}.x-graphic svg{width:100%;height:auto;display:block}
.x-graphic:not(.x-scene):not(.x-drawing) svg text{font-family:system-ui,sans-serif;font-size:12px;fill:#334155}
.x-grid{stroke:#e2e8f0;stroke-width:1;fill:none}.x-axis{stroke:#64748b;fill:none}
.x-bar,.x-arrow{fill:#2563eb}.x-line{fill:none;stroke:#2563eb;stroke-width:3}
.x-edge{stroke:#64748b;stroke-width:2;fill:none}.x-node{fill:#eff6ff;stroke:#93c5fd}
.x-description{font-size:.9rem;color:#475569}.x-callout{padding:1rem;border-left:4px solid #2563eb;background:#eff6ff;margin:1rem 0}
.x-callout-warning{border-color:#b45309;background:#fffbeb}.x-callout-title{display:block;margin-bottom:.5rem}
.x-error{border-left:4px solid #b91c1c;padding:1rem}.x-image-alt{font-style:italic}
`;

const limits={maxGraphicCodeUnits:65536,maxChartRows:256,maxDiagramNodes:32,maxDiagramEdges:128};
const style=document.createElement('style');style.textContent=graphicStyles;style.nonce=document.currentScript?.nonce || '';document.head.append(style);
let index=0;
for(const input of document.querySelectorAll('script[type="application/json"][data-graphic]')){
  const holder=document.createElement('div');
  try{holder.innerHTML=renderGraphic(validateGraphic(input.dataset.graphic,input.textContent,limits),'shared-'+(++index));}
  catch(error){const pre=document.createElement('pre');pre.textContent=error.message;holder.append(pre);}
  input.replaceWith(...holder.childNodes);
}
})();
