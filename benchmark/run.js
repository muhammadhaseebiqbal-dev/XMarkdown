import MarkdownIt from 'markdown-it';
import { performance } from 'node:perf_hooks';
import { writeFileSync } from 'node:fs';
import { createParser } from '../src/index.js';
import { writeReport } from './report.js';
import { readFileSync } from 'node:fs';

const parser=createParser();
const baseline=new MarkdownIt({html:false,linkify:false,typographer:false,maxNesting:32});
const chunkSize=Number(process.env.XMARKDOWN_CHUNK_SIZE || 64);
if (!Number.isSafeInteger(chunkSize) || chunkSize<1) throw new Error('Invalid chunk size');
let checksum=0;
const paragraph='The parser handles **structured prose**, `code`, and [references](https://example.com). It keeps presentation in the renderer and validates graphic data before use.\n\n';
const chart='```x-chart\n'+JSON.stringify({type:'bar',title:'Requests',description:'Monday 24, Tuesday 31.',x:'day',y:'requests',data:[{day:'Mon',requests:24},{day:'Tue',requests:31}]})+'\n```\n\n';
const corpora=[
  {name:'short prose',source:'# Overview\n\n'+paragraph.repeat(3)},
  {name:'long prose',source:Array.from({length:80},(_,i)=>`## Section ${i+1}\n\n${paragraph.repeat(2)}`).join('')},
  {name:'code and tables',source:('## Example\n\n| Input | Output |\n|---|---|\n| Markdown | HTML |\n\n```js\nconst answer = 42;\n```\n\n'+paragraph).repeat(50)},
  {name:'long list',source:('- A **list item** with detail.\n\n').repeat(500)},
  {name:'graphics report',source:('# Report\n\n'+paragraph+chart).repeat(50)},
];

function measureGroup(entries,warmups) {
  for (let round=0;round<warmups;round++) for (const [,fn] of entries) fn();
  const measurements=new Map();
  for (const [key,fn] of entries) {
    const start=performance.now(); fn();
    const estimate=Math.max(performance.now()-start,.01);
    measurements.set(key,{iterations:Math.max(1,Math.min(1000,Math.ceil(35/estimate))),samples:[]});
  }
  // Rotate condition order so JIT warmup, load, and collection do not consistently
  // favor the second parser. Batch functions get 60 interleaved warmups.
  for (let trial=0;trial<7;trial++) {
    for (let slot=0;slot<entries.length;slot++) {
      const [key,fn]=entries[(slot+trial)%entries.length], record=measurements.get(key);
      const start=performance.now();
      for (let i=0;i<record.iterations;i++) fn();
      record.samples.push((performance.now()-start)/record.iterations);
    }
  }
  return Object.fromEntries([...measurements].map(([key,record])=>{
    record.samples.sort((a,b)=>a-b);
    return [key,{medianMs:record.samples[3],minMs:record.samples[0],maxMs:record.samples[6],iterations:record.iterations,trials:7}];
  }));
}

const results=[];
for (const {name,source} of corpora) {
  const chunks=[];
  for (let i=0;i<source.length;i+=chunkSize) chunks.push(source.slice(i,i+chunkSize));
  const ordinary=()=>{checksum+=baseline.parse(source,{}).length;};
  const batch=()=>{checksum+=parser.parse(source,{render:false}).tokens.length;};
  const repeated=()=>{for (let end=chunkSize;end<source.length;end+=chunkSize) checksum+=parser.parse(source.slice(0,end),{render:false}).tokens.length; batch();};
  const repeatedBaseline=()=>{for (let end=chunkSize;end<source.length;end+=chunkSize) checksum+=baseline.parse(source.slice(0,end),{}).length; ordinary();};
  let lastStats;
  const streamed=()=>{
    const stream=parser.stream({renderPreviews:false});
    for (const chunk of chunks) for (const update of stream.write(chunk).updates) checksum+=update.tokens.length;
    const result=stream.finish({render:false}); checksum+=result.document.tokens.length; lastStats=result.stats;
  };
  const {markdownIt,xmarkdown}=measureGroup([['markdownIt',ordinary],['xmarkdown',batch]],60);
  const streamEntries=[['naiveStream',repeated],['incrementalStream',streamed]];
  if (name!=='graphics report') streamEntries.push(['baselineStream',repeatedBaseline]);
  const {naiveStream,incrementalStream,baselineStream}=measureGroup(streamEntries,2);
  const result={name,codeUnits:source.length,utf8Bytes:Buffer.byteLength(source),chunks:chunks.length,markdownIt,xmarkdown,naiveStream,incrementalStream,baselineStream,
    batchSpeedup:markdownIt.medianMs/xmarkdown.medianMs,
    streamingSpeedup:naiveStream.medianMs/incrementalStream.medianMs,
    baselineStreamingSpeedup:baselineStream ? baselineStream.medianMs/incrementalStream.medianMs : undefined,
    stats:lastStats};
  results.push(result);
  console.log(`${name}: batch ${result.batchSpeedup.toFixed(2)}x; stream vs repeated XMarkdown ${result.streamingSpeedup.toFixed(1)}x${baselineStream ? `; vs repeated markdown-it ${result.baselineStreamingSpeedup.toFixed(1)}x` : ''}`);
}

const markdownVersion=JSON.parse(readFileSync(new URL('../node_modules/markdown-it/package.json',import.meta.url),'utf8')).version;
const report={date:new Date().toISOString(),node:process.version,platform:process.platform,arch:process.arch,chunkSize,baseline:'markdown-it '+markdownVersion,
  methodology:'Reused parser instances and bounded extension cache; hydrated tokens, no HTML rendering; 60 interleaved batch warmups, two streaming warmups, seven timed trials with rotating condition order; median per operation. Streaming compares full-prefix parsing on every chunk with provisional section patches plus one full final parse. Repeated graphic specifications can hit the cache in all XMarkdown conditions. Graphics baseline has unequal features; only the same-XMarkdown stream comparison is used there. See features-report.md for cold and cached rendering costs.',results,checksum};
writeFileSync(new URL('./results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
writeReport(report);
console.log('Saved benchmark/results.json');
