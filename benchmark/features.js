import { performance } from 'node:perf_hooks';
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import MarkdownIt from 'markdown-it';
import { createParser } from '../src/index.js';
import { controlsSpec, drawingSpec, sceneSpec, importedSvg, extendedSource, block } from '../demo/extended-content.js';
const parser=createParser(),disabled=createParser({cacheEntries:0});
const prose=('# Report\n\nThe renderer explains **relationships** using structured documents.\n\n').repeat(80);
const fixtures=[['Plain prose',prose],['Math','$E=mc^2$\n\n$$\n\\int_0^1 x^2\\,dx=\\frac{1}{3}\n$$\n'],['Controls',block('x-widget',controlsSpec)],['Drawing',block('x-widget',drawingSpec)],['Vector scene',block('x-svg',sceneSpec)],['SVG import',block('x-svg',importedSvg)],['Extended document',extendedSource]];
let checksum=0;
function measureGroup(entries,iterations=30,warmups=12){
  for(let round=0;round<warmups;round++)for(const [,fn] of entries)fn();
  const samples=new Map(entries.map(([name])=>[name,[]]));
  for(let trial=0;trial<7;trial++)for(let slot=0;slot<entries.length;slot++){
    const [name,fn]=entries[(trial+slot)%entries.length];const start=performance.now();for(let i=0;i<iterations;i++)fn();samples.get(name).push((performance.now()-start)/iterations);
  }
  return Object.fromEntries([...samples].map(([name,times])=>{times.sort((a,b)=>a-b);return [name,{medianMs:times[3],minMs:times[0],maxMs:times[6]}];}));
}
const results=[];
for(const [name,source] of fixtures){parser.clearCache();const firstStart=performance.now();const output=parser.parse(source);const firstUseMs=performance.now()-firstStart;if(output.diagnostics.length)throw new Error(name+': invalid benchmark fixture');
  const cold=()=>{parser.clearCache();checksum+=parser.parse(source).html.length;};
  const cached=()=>{checksum+=parser.parse(source).html.length;};
  const noCache=()=>{checksum+=disabled.parse(source).html.length;};
  const repeated=()=>{parser.clearCache();for(let end=64;end<source.length;end+=64)checksum+=parser.parse(source.slice(0,end)).html.length;checksum+=parser.parse(source).html.length;};
  const streamed=()=>{parser.clearCache();const stream=parser.stream();for(let i=0;i<source.length;i+=64)for(const update of stream.write(source.slice(i,i+64)).updates)checksum+=update.html.length;checksum+=stream.finish().document.html.length;};
  const {uncached,cacheOff,warm}=measureGroup([['uncached',cold],['cacheOff',noCache],['warm',cached]]);
  const {repeat,stream}=measureGroup([['repeat',repeated],['stream',streamed]],3,2);
  const result={name,sourceCodeUnits:source.length,outputCodeUnits:output.html.length,firstUseMs,uncached,cacheOff,cached:warm,repeated:repeat,streamed:stream,cacheSpeedup:uncached.medianMs/warm.medianMs,streamSpeedup:repeat.medianMs/stream.medianMs};results.push(result);console.log(name+': cold '+uncached.medianMs.toFixed(3)+' ms; cached '+warm.medianMs.toFixed(3)+' ms; stream '+result.streamSpeedup.toFixed(2)+'x');
}
const baseline=new MarkdownIt({html:false,linkify:false,typographer:false,maxNesting:32});
const {markdown,xmarkdown}=measureGroup([['markdown',()=>{checksum+=baseline.render(prose).length;}],['xmarkdown',()=>{checksum+=parser.parse(prose).html.length;}]],100,60);
const files=['../src/browser/widgets.js','../src/expressions.js'].map(path=>readFileSync(new URL(path,import.meta.url)));
const report={date:new Date().toISOString(),runtime:process.version,platform:process.platform,method:'Seven timed trials with rotating condition order; 12 interleaved batch warmups, two streaming warmups, and 60 plain-baseline warmups. Median per document. Cold means a cleared extension cache, with dependencies already loaded after first use. Cached means the same completed source is repeated. Streaming includes provisional HTML/SVG rendering and the final full render; each workflow starts with an empty cache. Browser layout, painting, networking, and model generation are excluded. First-use rows are single observations in fixture order, not isolated process startup trials. Run this benchmark separately from other benchmark processes.',plain:{markdown,xmarkdown,ratio:markdown.medianMs/xmarkdown.medianMs},widgetRuntime:{bytes:files.reduce((n,f)=>n+f.length,0),gzipBytes:files.reduce((n,f)=>n+gzipSync(f).length,0)},results,checksum};
writeFileSync(new URL('features-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
const f=n=>n.toFixed(3);
const rows=results.map(r=>`| ${r.name} | ${r.sourceCodeUnits} | ${f(r.firstUseMs)} | ${f(r.uncached.medianMs)} | ${f(r.cacheOff.medianMs)} | ${f(r.cached.medianMs)} | ${r.streamSpeedup.toFixed(2)}× |`).join('\n');
writeFileSync(new URL('features-report.md',import.meta.url),`# Extended capability processing costs\n\nMeasured ${report.date}, ${report.runtime}, ${report.platform}.\n\n${report.method}\n\n| Workload | Source code units | First use ms | Empty-cache parse + render ms | Cache disabled ms | Cached parse + render ms | Streaming vs repeated prefix |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: |\n${rows}\n\nPlain prose including HTML generation: markdown-it ${f(markdown.medianMs)} ms, XMarkdown ${f(xmarkdown.medianMs)} ms (${report.plain.ratio.toFixed(2)}× baseline/XMarkdown). Below 1 means XMarkdown is slower. New capabilities have a measured cost; no zero-overhead or universal speed guarantee follows.\n\nThe optional shared widget modules total ${report.widgetRuntime.bytes} source bytes, ${report.widgetRuntime.gzipBytes} gzip bytes when compressed independently. They are loaded only for widget documents and once per document, not once per widget. Math uses server-generated native MathML; SVG scenes and imports use native browser SVG and require no document JavaScript.\n\nKaTeX and the XML parser are required only on first mathematical or XML-import use. First-use observations include JIT and module loading where applicable. Cache entries default to 128 and retained string accounting to 512 Ki code units; this is bounded cache accounting, not a measurement or hard bound of total heap memory. Compiled geometry is reused with generated IDs rewritten for each placement.\n\nStream previews can lag, and may be replaced at completion. These timing improvements are workflow comparisons. No model-generation latency or reader benefit was measured. Full trial ranges are in [features-results.json](features-results.json). Reproduce with \`npm run bench:features\`.\n`);
console.log('Saved benchmark/features-report.md and features-results.json');
