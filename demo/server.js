import { createServer } from 'node:http';
import { randomBytes, createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { performance } from 'node:perf_hooks';
import { createParser } from '../src/index.js';
import { demoSource as sample, documentStyle } from './content.js';
import { readFileSync } from 'node:fs';
import { extendedSource } from './extended-content.js';
import { documentFrame, documentPrefix } from './frame.js';
import { widgetStyles } from '../src/widgets.js';

const parser=createParser();
const nonce=randomBytes(18).toString('base64');
const assetPaths={'/assets/browser/widgets.js':'../src/browser/widgets.js','/assets/expressions.js':'../src/expressions.js'};
const assets=Object.fromEntries(Object.entries(assetPaths).map(([url,path])=>{const body=readFileSync(new URL(path,import.meta.url));return [url,{body,gzip:gzipSync(body),etag:'W/"'+createHash('sha256').update(body).digest('hex')+'"'}];}));
const page=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>XMarkdown playground</title>
<style nonce="${nonce}">*{box-sizing:border-box}body{margin:0;font:15px/1.5 system-ui,sans-serif;color:#162c49;background:#f2f6fb}header{padding:24px 32px;background:#fff;border-bottom:1px solid #d5dfeb}h1{margin:0;font-size:26px}header p{margin:4px 0 16px;color:#475569}button{border:0;border-radius:7px;padding:10px 16px;background:#2563eb;color:white;font:inherit;cursor:pointer}button.secondary{background:#e2e8f0;color:#162c49;margin-left:8px}button:focus-visible,textarea:focus-visible{outline:3px solid #60a5fa;outline-offset:3px}main{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:24px 32px}.panel{background:white;border:1px solid #d5dfeb;border-radius:12px;overflow:hidden}.label{display:block;padding:12px 16px;font-weight:600;border-bottom:1px solid #e2e8f0}textarea{display:block;border:0;resize:vertical;width:100%;height:680px;padding:18px;font:13px/1.6 Consolas,monospace;background:#fbfdff;color:#162c49}iframe{border:0;width:100%;height:680px;background:white}#status{display:block;margin-top:12px;color:#475569}#diagnostics{white-space:pre-wrap;margin:0;padding:0 32px 24px;color:#9a3412}@media(max-width:850px){main{grid-template-columns:1fr;padding:16px}header{padding:20px}textarea{height:420px}}</style>
<header><h1>XMarkdown playground</h1><p>Prose, charts, diagrams, math, and interactive documents.</p><button id="render">Render document</button><button id="inspect" class="secondary">Inspect streaming work</button> <label>Example <select id="example"><option value="original">Original demo</option><option value="extended">Extended capabilities</option></select></label> <label>Import SVG <input id="import-svg" type="file" accept="image/svg+xml,.svg"></label><output id="status" aria-live="polite">Loading example…</output></header>
<main><section class="panel"><label class="label" for="source">Source</label><textarea id="source" spellcheck="false"></textarea></section><section class="panel"><div class="label">Document</div><iframe id="preview" title="Rendered XMarkdown document" sandbox=""></iframe></section></main><pre id="diagnostics" aria-live="polite"></pre>
<script nonce="${nonce}">
const source=document.getElementById('source'),preview=document.getElementById('preview'),status=document.getElementById('status'),diagnostics=document.getElementById('diagnostics');
source.value=${JSON.stringify(sample).replace(/</g,'\\u003c')};
let revision=0;
async function render(stream=false){
const request=++revision;status.textContent='Rendering…';
try{const response=await fetch('/api/render',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source:source.value,stream})});const result=await response.json();if(request!==revision)return;if(!response.ok)throw new Error(result.error);
const interactive=result.assets.modules.includes('widgets');preview.setAttribute('sandbox',interactive?'allow-scripts':'');preview.srcdoc=${JSON.stringify(documentPrefix(nonce))}+(interactive?${JSON.stringify('<style nonce="'+nonce+'">'+widgetStyles+'</style>')}: '')+result.html+(interactive?'<script nonce="${nonce}" type="module" src="/assets/browser/widgets.js"></scr'+'ipt>':'')+'</body></html>';
status.textContent=stream ? result.stats.previewParses+' preview parses; '+result.stats.submittedCodeUnits.toLocaleString()+' characters submitted for '+result.stats.totalCodeUnits.toLocaleString()+' characters of source. Final output matches batch parsing.' : 'Rendered in '+result.elapsedMs.toFixed(2)+' ms on this server.';
diagnostics.textContent=result.diagnostics.map(d=>'Line '+d.line+': '+d.message).join('\\n');
}catch(error){if(request===revision)status.textContent=error.message;}}
document.getElementById('example').addEventListener('change',event=>{source.value=event.target.value==='extended'?${JSON.stringify(extendedSource).replace(/</g,'\\u003c')}:${JSON.stringify(sample).replace(/</g,'\\u003c')};render();});
document.getElementById('import-svg').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;if(file.size>65536){status.textContent='SVG exceeds the 64 KB import limit';return;}const svg=await file.text();const marker='~'.repeat(Math.max(3,...[...svg.matchAll(/~+/g)].map(m=>m[0].length+1)));source.value+='\\n'+marker+'x-svg\\n'+svg+'\\n'+marker+'\\n';render();});
document.getElementById('render').addEventListener('click',()=>render());document.getElementById('inspect').addEventListener('click',()=>render(true));render();
</script></html>`;

createServer(async(req,res)=>{
  res.setHeader('Content-Security-Policy',`default-src 'none'; script-src 'nonce-${nonce}' 'strict-dynamic'; style-src 'nonce-${nonce}'; connect-src 'self'; frame-src 'self'; base-uri 'none'; form-action 'none'`);
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method==='GET' && req.url==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(page);return;}
  if(req.method==='GET' && (req.url==='/example'||req.url==='/extended')){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(documentFrame(parser.parse(req.url==='/extended'?extendedSource:sample),nonce));return;}
  if(req.method==='GET'&&Object.hasOwn(assets,req.url)){const asset=assets[req.url];res.setHeader('Content-Type','text/javascript; charset=utf-8');res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Cache-Control','no-cache');res.setHeader('ETag',asset.etag);res.setHeader('Vary','Accept-Encoding');if(req.headers['if-none-match']===asset.etag){res.statusCode=304;res.end();return;}if(/\bgzip\b/.test(req.headers['accept-encoding']||'')){res.setHeader('Content-Encoding','gzip');res.end(asset.gzip);}else res.end(asset.body);return;}
  if(req.method==='GET' && req.url==='/compare'){
    res.setHeader('Content-Type','text/html; charset=utf-8');
    try{res.end(readFileSync(new URL('../comparison/gallery.html',import.meta.url),'utf8').replaceAll('__COMPARISON_NONCE__',nonce));}
    catch{res.statusCode=404;res.end('Run npm run compare to build the comparison.');}
    return;
  }
  const comparisonFiles={
    '/comparison/demo-literal.html':'./artifacts/demo-literal.html',
    '/comparison/demo-compact.html':'./artifacts/demo-compact.html',
    '/comparison/demo-template.html':'./artifacts/demo-template.html',
    '/comparison/math.html':'./artifacts/08-math-standalone.html',
    '/comparison/queue.html':'./artifacts/09-interaction-standalone.html',
    '/comparison/drawing.html':'./artifacts/10-canvas-standalone.html',
    '/comparison/template-runtime.js':'./template-runtime.js',
    '/template-runtime.js':'./template-runtime.js',
  };
  if(req.method==='GET' && Object.hasOwn(comparisonFiles,req.url)){
    res.setHeader('Content-Type',req.url.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8');
    try{
      let content=readFileSync(new URL('../comparison/'+comparisonFiles[req.url],import.meta.url),'utf8');
      if(!req.url.endsWith('.js')) content=content.replace(/<style>/g,`<style nonce="${nonce}">`).replace(/<script(?=[ >])/g,`<script nonce="${nonce}"`);
      res.end(content);
    }catch{res.statusCode=404;res.end('Run npm run compare to build the comparison.');}
    return;
  }
  if(req.method!=='POST' || req.url!=='/api/render'){res.statusCode=404;res.end('Not found');return;}
  res.setHeader('Content-Type','application/json; charset=utf-8');
  try{
    const pieces=[];let bytes=0;
    for await(const piece of req){bytes+=piece.length;if(bytes>8*1024*1024)throw new Error('Request exceeds the size limit');pieces.push(piece);}
    const input=JSON.parse(Buffer.concat(pieces).toString('utf8'));
    if(typeof input.source!=='string')throw new Error('Source must be a string');
    const start=performance.now();let document,stats;
    if(input.stream===true){const stream=parser.stream({renderPreviews:false});for(let i=0;i<input.source.length;i+=64)stream.write(input.source.slice(i,i+64));const result=stream.finish();document=result.document;stats=result.stats;}
    else document=parser.parse(input.source);
    res.end(JSON.stringify({html:document.html,assets:document.assets,diagnostics:document.diagnostics,elapsedMs:performance.now()-start,stats,cache:parser.cacheStats()}));
  }catch(error){res.statusCode=400;res.end(JSON.stringify({error:error.message}));}
}).listen(4317,'127.0.0.1',()=>console.log('XMarkdown playground: http://127.0.0.1:4317'));
