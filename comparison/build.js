import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { getEncoding } from 'js-tiktoken';
import { createParser } from '../src/index.js';
import { escape } from '../src/graphics.js';
import { documentStyle, demoSource } from '../demo/content.js';
import { cases, authorGuide } from './cases.js';
import { extendedSource, importedSvg } from '../demo/extended-content.js';
import { widgetStyles } from '../src/widgets.js';

const parser = createParser();
const encoders = {o200k_base:getEncoding('o200k_base'),cl100k_base:getEncoding('cl100k_base')};
const root = new URL('./',import.meta.url);
mkdirSync(new URL('./artifacts/',root),{recursive:true});
function save(name, source) { writeFileSync(new URL(name,root),source.replace(/\r\n/g,'\n').replace(/\n+$/,'\n')); }
function measure(source) {
  return {codeUnits:source.length,utf8Bytes:Buffer.byteLength(source),lines:source.split('\n').length,
    tokens:Object.fromEntries(Object.entries(encoders).map(([name,encoder])=>[name,encoder.encode(source).length]))};
}
function standalone(title,body,{shared=false,widgets=false}={}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><style>${documentStyle}${widgets?widgetStyles:''}</style></head><body>${body}${shared ? '<script src="../template-runtime.js" defer></script>' : ''}${widgets?'<script type="module" src="../../src/browser/widgets.js"></script>':''}</body></html>\n`;
}
function compactSvg(body) {
  // Keep semantics and text. Only shorten numeric attribute precision to 0.001 SVG units.
  return body.replace(/\b(x|y|width|height|viewBox|points|d|transform)="([^"]*)"/g,(_,name,value)=>
    `${name}="${value.replace(/[-+]?(?:\d*\.\d+|\d+)(?:e[-+]?\d+)?/gi,n=>String(Number(Number(n).toFixed(3))))}"`);
}
function sharedBody(source) {
  const document = parser.parse(source,{render:false});
  const tokens = document.tokens.map(token=>{
    const graphic=token.meta?.xmarkdown;
    if (!graphic || !['x-chart','x-diagram'].includes(graphic.kind)) return token;
    const json=JSON.stringify(graphic.spec).replace(/</g,'\\u003c');
    return {...token,type:'html_block',meta:null,content:`<script type="application/json" data-graphic="${graphic.kind}">${json}</script>\n`};
  });
  return parser.renderTokens(tokens);
}

const records = cases.map(item=>{
  const source=item.x?.replace(/\r\n/g,'\n');
  const parsed=source ? parser.parse(source) : undefined;
  if(item.supported && parsed.diagnostics.length) throw new Error(`${item.id}: invalid XMarkdown example`);
  const body=item.supported ? (item.html||parsed.html) : item.html;
  const variants={
    literal:{label:'Literal HTML + SVG',source:body},
    compact:{label:'Compact HTML + SVG',source:compactSvg(body)},
    standalone:{label:'Standalone styled HTML',source:standalone(item.title,compactSvg(body))},
  };
  if(item.supported) variants.shared={label:'HTML with shared graphics components',source:sharedBody(source)};
  for(const [name,variant] of Object.entries(variants)) {
    variant.metrics=measure(variant.source);
    save(`artifacts/${item.id}-${name}.html`,name==='standalone' ? variant.source : standalone(item.title,variant.source,{shared:name==='shared',widgets:name==='shared'&&parsed.assets.modules.includes('widgets')}));
  }
  if(source) save(`artifacts/${item.id}.md`,source);
  return {...item,x:source || null,html:body,assets:parsed?.assets||{modules:[]},xMetrics:item.supported ? measure(source) : null,
    xPreview:parsed?.html || '<p>This XMarkdown version has no equivalent syntax.</p>',variants};
});

// An actual reusable HTML graphics adapter. Its code is shared, just like XMarkdown's runtime.
const graphicsSource=readFileSync(new URL('../src/graphics.js',import.meta.url),'utf8').replace(/^export /gm,'');
const adapter=`\nconst limits={maxGraphicCodeUnits:65536,maxChartRows:256,maxDiagramNodes:32,maxDiagramEdges:128};
const style=document.createElement('style');style.textContent=graphicStyles;style.nonce=document.currentScript?.nonce || '';document.head.append(style);
let index=0;
for(const input of document.querySelectorAll('script[type="application/json"][data-graphic]')){
  const holder=document.createElement('div');
  try{holder.innerHTML=renderGraphic(validateGraphic(input.dataset.graphic,input.textContent,limits),'shared-'+(++index));}
  catch(error){const pre=document.createElement('pre');pre.textContent=error.message;holder.append(pre);}
  input.replaceWith(...holder.childNodes);
}\n`;
save('template-runtime.js',`(()=>{\n${graphicsSource}${adapter}})();\n`);
save('format-guide.txt',authorGuide);
save('artifacts/demo-xmarkdown.md',demoSource);
save('../examples/extended.md',extendedSource);
save('../examples/artwork.svg',importedSvg);
const demo=records.find(item=>item.id==='07-exact-demo');
save('artifacts/demo-literal.html',standalone('How a request moves',demo.variants.literal.source));
save('artifacts/demo-compact.html',demo.variants.standalone.source);
save('artifacts/demo-template.html',standalone('How a request moves',demo.variants.shared.source,{shared:true}));

const report={date:new Date().toISOString(),tokenizers:'js-tiktoken 1.0.21; o200k_base and cl100k_base',
  scope:'Representation counts, not an LLM generation experiment. Named local encodings are not current Claude token counts. LF line endings. No editor, server, parser, or shared runtime code in author-fragment counts.',
  guide:measure(authorGuide),sharedHtmlRuntime:measure(readFileSync(new URL('template-runtime.js',root),'utf8')),
  records:records.map(({id,title,level,supported,xMetrics,variants,assessment})=>({id,title,level,supported,xMetrics,variants:Object.fromEntries(Object.entries(variants).map(([name,variant])=>[name,variant.metrics])),assessment}))};
save('results.json',JSON.stringify(report,null,2)+'\n');

const percent=(x,h)=>((1-x/h)*100).toFixed(1)+'%';
const demoRows=[['XMarkdown source',demo.xMetrics],...Object.values(demo.variants).map(v=>[v.label,v.metrics])].map(([label,m])=>`| ${label} | ${m.codeUnits} | ${m.utf8Bytes} | ${m.tokens.o200k_base} | ${m.tokens.cl100k_base} |`).join('\n');
const rows=records.map(r=>r.supported ? `| ${r.level}: ${r.title} | ${r.xMetrics.tokens.o200k_base} | ${r.variants.compact.metrics.tokens.o200k_base} | ${r.variants.shared.metrics.tokens.o200k_base} | ${percent(r.xMetrics.tokens.o200k_base,r.variants.compact.metrics.tokens.o200k_base)} |` : `| ${r.level}: ${r.title} | No equivalent | ${r.variants.compact.metrics.tokens.o200k_base} | — | Not comparable |`).join('\n');
const samples=records.map(r=>`### ${r.level}: ${r.title}\n\n${r.assessment}\n\n${r.supported ? 'XMarkdown source:' : 'XMarkdown has no equivalent. '+(r.x ? 'The following attempted notation remains literal text:' : 'No invented syntax is presented as supported.')}\n\n${r.x ? '````markdown\n'+r.x+'````\n\n' : ''}HTML source (compact literal HTML/SVG):\n\n\`\`\`html\n${r.variants.compact.source}\n\`\`\`\n\n${r.supported ? 'HTML using shared graphics components:\n\n\`\`\`html\n'+r.variants.shared.source+'\n\`\`\`\n\n' : ''}`).join('\n');
save('samples.md','# All side-by-side source examples\n\nGenerated from the checked-in examples. Full HTML fragments are included, without omitted SVG. Standalone pages are in artifacts/. “Impossible today” means unsupported by the current XMarkdown profile.\n\n'+samples);
save('report.md',`# Exact-demo representation comparison\n\n${report.scope}\n\n## Exact live demo\n\nThe source is imported from the same fixture as the playground. The literal HTML is its actual rendered body. Compact SVG rounds numeric attributes to 0.001 units and retains labels, descriptions, axes, and elements. The standalone variant adds document boilerplate and CSS. These are concrete equivalent implementations, not a proof of the shortest possible HTML.\n\n| Representation | UTF-16 code units | UTF-8 bytes | o200k_base tokens | cl100k_base tokens |\n| --- | ---: | ---: | ---: | ---: |\n${demoRows}\n\nXMarkdown uses **${percent(demo.xMetrics.tokens.o200k_base,demo.variants.compact.metrics.tokens.o200k_base)} fewer o200k_base tokens** than compact literal HTML/SVG, **${percent(demo.xMetrics.tokens.o200k_base,demo.variants.standalone.metrics.tokens.o200k_base)} fewer** than the styled standalone page, and **${percent(demo.xMetrics.tokens.o200k_base,demo.variants.shared.metrics.tokens.o200k_base)} fewer** than shared-component HTML author markup.\n\nA negative saving means XMarkdown uses more tokens. Shared-component HTML uses the same validation and graphics renderer through template-runtime.js, without a Markdown parser. Its runtime is excluded from per-document author markup, just as XMarkdown's runtime is excluded.\n\nThe complete playground editor and Node server are not equivalent to the displayed document and are not counted as document HTML. A standalone HTML page includes CSS that a hosted renderer can share; a hosted XMarkdown document also relies on a renderer and theme.\n\n## Easy through unsupported\n\n| Example | X tokens | Compact literal HTML tokens | Shared-component HTML tokens | X reduction vs literal HTML |\n| --- | ---: | ---: | ---: | ---: |\n${rows}\n\nAll table values use o200k_base. Both encoding counts for every representation are retained in [results.json](results.json). See [samples.md](samples.md) for every source example and [gallery.html](gallery.html) for a side-by-side viewer.\n\n## Instructions and total-workflow limits\n\nThe supplied [format guide](format-guide.txt) contains ${report.guide.tokens.o200k_base} o200k_base tokens and ${report.guide.tokens.cl100k_base} cl100k_base tokens. It is not included in output-fragment savings. Whether it must be sent, cached, or repeated depends on the integration. No model was called, so no actual generation-time, billed-cost, correction-turn, or provider-usage reduction has been measured.\n\nTotal-workflow savings require counting each format's instructions, examples, output, repeated context, and repairs. A registered HTML component API also needs documentation. Shared renderer code is shifted into reusable software; it is not eliminated.\n\n## Interpretation\n\nLiteral SVG grows because it describes positions, geometry, axes, labels, and element attributes. Both XMarkdown and shared-component HTML can replace that with data. The strongest advantage here is reuse and abstraction, rather than a magical property of Markdown syntax.\n\nXMarkdown suits prose plus known document graphics. HTML suits unrestricted layouts, custom SVG, math, native controls, and applications when paired with JavaScript. If a feature is unsupported, counting a shorter fallback as a saving would be an invalid comparison.\n\nRebuild with \`npm run compare\`. Sample pages can be opened as files. The shared HTML sample requires template-runtime.js beside the artifacts directory; it also works through the local demo server.\n`);

const payload=JSON.stringify({records,style:documentStyle,widgetStyle:widgetStyles}).replace(/</g,'\\u003c');
const gallery=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HTML and XMarkdown comparison</title>
<style nonce="__COMPARISON_NONCE__">*{box-sizing:border-box}body{margin:0;font:15px/1.55 system-ui,sans-serif;background:#f1f5f9;color:#172b45}header{background:white;padding:24px 28px;border-bottom:1px solid #cbd5e1}h1{font-size:26px;margin:0}header p{margin:8px 0;color:#475569}.controls{display:flex;gap:16px;flex-wrap:wrap;margin-top:16px}label{display:flex;gap:8px;align-items:center}select{padding:8px;max-width:430px;border:1px solid #94a3b8;border-radius:6px}main{padding:24px 28px}.columns{display:grid;grid-template-columns:1fr 1fr;gap:20px}.panel{background:white;border:1px solid #cbd5e1;border-radius:10px;overflow:hidden}.bar{padding:12px 16px;border-bottom:1px solid #e2e8f0}h2{font-size:18px;margin:0}.metrics{font-size:13px;color:#475569}pre{margin:0;padding:16px;background:#0f172a;color:#dbeafe;font:12px/1.6 Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;height:350px;overflow:auto}iframe{width:100%;height:450px;border:0;border-top:1px solid #e2e8f0}#assessment{background:#fff;border-left:4px solid #2563eb;padding:14px 16px;margin-bottom:20px}#saving{font-weight:650}#notice{color:#9a3412;margin-top:8px}.legend{color:#475569;font-size:13px;margin-top:16px}@media(max-width:850px){.columns{grid-template-columns:1fr}header,main{padding:16px}}</style>
<header><h1>HTML and XMarkdown comparison</h1><p>The same content as literal markup, shared components, or XMarkdown. Unsupported features stay visible as limitations.</p><div class="controls"><label>Example<select id="case"></select></label><label>HTML version<select id="variant"><option value="literal">Literal HTML + SVG</option><option value="compact">Compact HTML + SVG</option><option value="shared">Shared graphics components</option><option value="standalone">Standalone styled HTML</option></select></label><label>Tokenizer<select id="encoding"><option>o200k_base</option><option>cl100k_base</option></select></label></div></header>
<main><div id="assessment"><div id="explanation"></div><div id="saving"></div><div id="notice"></div></div><div class="columns"><section class="panel"><div class="bar"><h2>HTML way</h2><div id="html-metrics" class="metrics"></div></div><pre id="html-source"></pre><iframe id="html-preview" title="HTML example" sandbox="allow-scripts"></iframe></section><section class="panel"><div class="bar"><h2>XMarkdown way</h2><div id="x-metrics" class="metrics"></div></div><pre id="x-source"></pre><iframe id="x-preview" title="XMarkdown example" sandbox=""></iframe></section></div><p class="legend">Counts measure source representations with named local tokenizers. They are not current Claude usage or an AI generation benchmark. Shared components and XMarkdown both rely on prebuilt rendering code. Fixed interactive HTML examples run in isolated frames; source panes are read-only.</p></main>
<script nonce="__COMPARISON_NONCE__">
const payload=${payload};
const nonce='__COMPARISON_NONCE__';
const choice=document.getElementById('case'),variant=document.getElementById('variant'),encoding=document.getElementById('encoding');
payload.records.forEach((record,i)=>{const option=document.createElement('option');option.value=i;option.textContent=record.level+' — '+record.title;choice.append(option);});
choice.value=6;
const runtimeUrl=location.pathname==='/compare' ? '/comparison/template-runtime.js' : new URL('template-runtime.js',location.href).href;
const widgetUrl=location.pathname==='/compare' ? '/assets/browser/widgets.js' : new URL('../src/browser/widgets.js',location.href).href;
function frame(body){return '<!doctype html><html lang="en"><meta charset="utf-8"><style nonce="'+nonce+'">'+payload.style+payload.widgetStyle+'</style><body>'+body.replace(/<script(?=[ >])/g,'<script nonce="'+nonce+'"').replace(/<style>/g,'<style nonce="'+nonce+'">')+'</body></html>';}
function metrics(m){return m.codeUnits.toLocaleString()+' characters · '+m.utf8Bytes.toLocaleString()+' bytes · '+m.tokens[encoding.value].toLocaleString()+' tokens';}
function show(){const record=payload.records[Number(choice.value)];if(!record.variants[variant.value])variant.value='literal';const v=record.variants[variant.value];document.getElementById('html-source').textContent=v.source;document.getElementById('x-source').textContent=record.x || 'No equivalent syntax in the current XMarkdown profile.';document.getElementById('html-metrics').textContent=metrics(v.metrics);document.getElementById('x-metrics').textContent=record.supported ? metrics(record.xMetrics) : 'Unsupported — token savings are not comparable';document.getElementById('explanation').textContent=record.assessment;document.getElementById('notice').textContent=record.supported ? (variant.value==='shared' ? 'Shared HTML adapters supply charts and diagrams. Widgets require the shared widget runtime on either side.' : 'The viewer supplies a theme. The standalone HTML count also includes CSS and boilerplate.') : 'Impossible today means unsupported by this profile, not impossible for every future Markdown extension.';const reduction=record.supported?(1-record.xMetrics.tokens[encoding.value]/v.metrics.tokens[encoding.value])*100:0;document.getElementById('saving').textContent=record.supported ? Math.abs(reduction).toFixed(1)+'% '+(reduction<0?'more':'fewer')+' XMarkdown source tokens in this comparison.' : 'No feature-equivalent XMarkdown implementation.';const script=record.assets.modules.includes('widgets')?'<script type="module" src="'+widgetUrl+'"></scr'+'ipt>':'';const htmlBody=variant.value==='shared' ? v.source+'<script src="'+runtimeUrl+'" defer></scr'+'ipt>'+script : (variant.value==='standalone' ? record.variants.compact.source : v.source);document.getElementById('html-preview').srcdoc=frame(htmlBody);const xFrame=document.getElementById('x-preview');xFrame.setAttribute('sandbox',script?'allow-scripts':'');xFrame.srcdoc=frame(record.xPreview+script);}
choice.addEventListener('change',show);variant.addEventListener('change',show);encoding.addEventListener('change',show);show();
</script></html>`;
save('gallery.html',gallery);
console.log(JSON.stringify({demo:report.records.find(r=>r.id==='07-exact-demo'),guide:report.guide},null,2));
console.log('Saved comparison/report.md, samples.md, gallery.html, results.json, and all source artifacts.');
