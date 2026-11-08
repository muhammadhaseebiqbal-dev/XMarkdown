const $ = id => document.getElementById(id);
let nativeParser;
let records = [], current, mode = 'x', controller;
let dynamicPreviewReady = false;
const status = (message,error=false) => { $('render-status').textContent=message; $('render-status').classList.toggle('error',error); };
function showPreview(result, signal) {
  const preview = $('preview'), id = crypto.randomUUID();
  return new Promise((resolve,reject) => {
    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener('message',receive);
      preview.removeEventListener('load',send);
      signal.removeEventListener('abort',abort);
    };
    const receive = event => {
      if (event.source !== preview.contentWindow || event.origin !== 'null' || event.data?.id !== id) return;
      if (event.data.type === 'xmarkdown:rendered') {
        dynamicPreviewReady = true; cleanup(); resolve();
      } else if (event.data.type === 'xmarkdown:error') {
        cleanup(); reject(new Error('The preview could not initialize its widgets.'));
      }
    };
    // An opaque sandbox requires '*'; the destination is this specific iframe.
    const send = () => preview.contentWindow.postMessage({type:'xmarkdown:render',id,html:result.html,modules:result.assets.modules},'*');
    const abort = () => {cleanup(); reject(new DOMException('Preview cancelled.','AbortError'));};
    const timeout = setTimeout(() => {cleanup(); reject(new Error('The preview did not finish loading. Please try rendering again.'));},10000);
    window.addEventListener('message',receive);
    signal.addEventListener('abort',abort,{once:true});
    if (signal.aborted) return abort();
    if (dynamicPreviewReady) send();
    else {
      preview.addEventListener('load',send,{once:true});
      preview.removeAttribute('srcdoc');
      preview.src = '/examples/preview.html';
    }
  });
}
function metrics() {
  const m = mode === 'x' ? current.metrics?.xMetrics : current.metrics?.variants.compact;
  $('source-metrics').textContent = m ? `${m.tokens.o200k_base.toLocaleString()} tokens · ${m.utf8Bytes.toLocaleString()} bytes · o200k_base · original fixture` : 'Additional control example · token counts not measured';
}
function setMode(value) {
  mode=value;
  $('tab-x').classList.toggle('active',value==='x'); $('tab-x').setAttribute('aria-pressed',String(value==='x'));
  $('tab-html').classList.toggle('active',value==='html'); $('tab-html').setAttribute('aria-pressed',String(value==='html'));
  $('source-editor').hidden=value!=='x'; $('html-source').hidden=value!=='html';
  $('render-source').hidden=value!=='x'; $('reset-source').hidden=value!=='x';
  metrics();
}
function select(id) {
  controller?.abort();
  dynamicPreviewReady = false;
  $('render-source').disabled=false;
  current=records.find(r=>r.id===id);
  if(!current) return;
  $('example-select').value=id; $('example-title').textContent=current.title; $('example-level').textContent=current.level;
  $('source-editor').value=current.x; $('html-source').textContent=current.html||'Inspect the complete control markup after rendering XMarkdown.';
  $('example-assessment').textContent=current.assessment;
  $('download-source').href=`/downloads/${id}.md`;
  $('full-example').href=`/examples/${id}.html`;
  $('preview').removeAttribute('srcdoc'); $('preview').src=`/examples/${id}.html`;
  document.querySelectorAll('[data-example]').forEach(b=>{b.classList.toggle('selected',b.dataset.example===id);b.setAttribute('aria-pressed',String(b.dataset.example===id));});
  setMode('x'); status('Examples are pre-rendered. Edited documents use native XMarkdown locally in the browser.');
}
try {
  const response=await fetch('/assets/examples.json');
  if(!response.ok) throw new Error('The example library could not be loaded.');
  records=await response.json(); select('14-architecture');
  $('example-select').addEventListener('change',e=>select(e.target.value));
  document.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.example)));
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
    document.querySelectorAll('[data-example]').forEach(b=>{b.hidden=filter!=='All'&&records.find(r=>r.id===b.dataset.example).level!==filter;});
    [...$('example-select').options].forEach(o=>{o.hidden=filter!=='All'&&records.find(r=>r.id===o.value).level!==filter;});
    if(filter!=='All'&&current.level!==filter) select(records.find(r=>r.level===filter).id);
  }));
  $('tab-x').addEventListener('click',()=>setMode('x')); $('tab-html').addEventListener('click',()=>setMode('html'));
  $('reset-source').addEventListener('click',()=>select(current.id));
  $('source-editor').addEventListener('input',()=>{ $('source-metrics').textContent=`${$('source-editor').value.length.toLocaleString()} characters · edited source · token counts not measured`; });
  $('copy-source').addEventListener('click',async()=>{
    try { await navigator.clipboard.writeText(mode==='x'?$('source-editor').value:$('html-source').textContent); status('Source copied.'); }
    catch { status('Clipboard access is unavailable. Select the source and copy it with your keyboard.',true); }
  });
  $('render-source').addEventListener('click',async()=>{
    if($('source-editor').value.length>32768) return status('Playground sources are limited to 32,768 characters.',true);
    controller?.abort(); const request=new AbortController(); controller=request;
    $('render-source').disabled=true; status('Rendering your document…');
    try {
      const source=$('source-editor').value;
      const {createParser}=await import('/assets/renderer/parser.js');
      nativeParser??=createParser({maxInputCodeUnits:32768,maxOutputCodeUnits:524288,maxTokens:8192});
      const result=await nativeParser.parse(source);
      if(request.signal.aborted)return;
      await showPreview(result,request.signal);
      if(request.signal.aborted)return;
      status(result.diagnostics.length?result.diagnostics.map(d=>`Line ${d.line}: ${d.message}`).join(' · '):'Rendered locally by native XMarkdown. No diagnostics.',result.diagnostics.length>0);
    } catch(error) {if(error.name!=='AbortError')status(error.message,true);}
    finally {if(controller===request)$('render-source').disabled=false;}
  });
} catch(error) {status(error.message,true);}
