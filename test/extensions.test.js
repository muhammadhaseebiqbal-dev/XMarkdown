import test from 'node:test';
import assert from 'node:assert/strict';
import { createParser } from '../src/index.js';
import { compileExpression, evaluateExpression } from '../src/expressions.js';
import { controlsSpec, drawingSpec, sceneSpec, importedSvg, extendedSource, block } from '../demo/extended-content.js';

test('extended document renders math, live controls, drawing, scenes, and SVG imports',()=>{
  const result=createParser().parse(extendedSource);
  assert.deepEqual(result.diagnostics,[]);assert.deepEqual(result.assets,{modules:['widgets']});
  assert.match(result.html,/<math/);assert.match(result.html,/<mfrac>/);
  assert.match(result.html,/capacity is sufficient/);assert.match(result.html,/data-x-widget=/);
  assert.match(result.html,/<mask/);assert.match(result.html,/<linearGradient/);assert.match(result.html,/<use /);
  assert.match(result.html,/SVG import works/);assert.doesNotMatch(result.html,/<script|<foreignObject|<iframe|NaN|Infinity/);
});
test('math handles ordinary notation, code, currency, errors, and trust restrictions',()=>{
  const parser=createParser();
  assert.match(parser.parse('$E=mc^2$').html,/<msup>/);
  assert.match(parser.parse(block('x-math','\\sqrt{x}+\\frac{1}{2}')).html,/<msqrt>/);
  assert.doesNotMatch(parser.parse('It costs $5 and $10. ` $x^2$ `').html,/<math/);
  const bad=parser.parse('$$\n\\unknowncommand{x}\n$$\n');assert.equal(bad.diagnostics.length,1);assert.doesNotMatch(bad.html,/undefined/);
  const hostile=parser.parse('$\\href{javascript:alert(1)}{x}$');assert.doesNotMatch(hostile.html,/<a\b|href="javascript/i);
  assert.equal(createParser({maxMathCodeUnits:4}).parse('$longexpression$').diagnostics.length,1);
  assert.equal(parser.parse('# Heading\n\nLater $\\unknowncommand{x}$').diagnostics[0].line,3);
});
test('expression interpreter supports dependencies and rejects program syntax',()=>{
  const names=new Set(['rate','capacity']);
  const ast=compileExpression("rate <= capacity ? 'ready' : 'backlog ' + max(0, rate-capacity)",names);
  assert.equal(evaluateExpression(ast,{rate:80,capacity:100}),'ready');assert.equal(evaluateExpression(ast,{rate:180,capacity:100}),'backlog 80');
  assert.equal(evaluateExpression(compileExpression('false && 1/0',names),{}),false);
  for(const source of ['globalThis.alert(1)','constructor(1)','rate[0]','(()=>1)()','fetch("https://example.com")','rate=1','unknown+1'])assert.throws(()=>compileExpression(source,names),undefined,source);
  assert.throws(()=>evaluateExpression(compileExpression('1/0',names),{}));
});
test('widgets reject invalid settings, cycles, unknown keys, and oversized drawings',()=>{
  const parser=createParser();const invalid=[
    {...controlsSpec,onClick:'alert(1)'},
    {...controlsSpec,inputs:[{...controlsSpec.inputs[0],value:1000}]},
    {...controlsSpec,outputs:[{id:'x',label:'x',expr:'y'},{id:'y',label:'y',expr:'x'}]},
    {...controlsSpec,inputs:[{...controlsSpec.inputs[0],id:'constructor'}]},
    {...drawingSpec,color:'url(https://example.com)'},
    {...drawingSpec,width:1e9},
    {...drawingSpec,strokes:[[[0,0],[9999,9999]]]},
  ];
  for(const spec of invalid){const result=parser.parse(block('x-widget',spec));assert.equal(result.diagnostics.length,1);assert.deepEqual(result.assets.modules,[]);}
  const selected={type:'controls',title:'Options',description:'A select and toggle.',inputs:[{id:'n',type:'select',label:'Count',value:2,options:[{label:'Two',value:2},{label:'Three',value:3}]},{id:'enabled',type:'toggle',label:'Enabled',value:true}],outputs:[{id:'answer',label:'Answer',expr:'enabled ? n*2 : 0'}]};
  const result=parser.parse(block('x-widget',selected));assert.deepEqual(result.diagnostics,[]);assert.match(result.html,/>4<\/output>/);
});
test('SVG import accepts local geometry and rejects executable, external, and cyclic content',()=>{
  const parser=createParser();assert.deepEqual(parser.parse(block('x-svg',importedSvg)).diagnostics,[]);
  for(const svg of [
    '<svg><script>alert(1)</script></svg>',
    '<svg viewBox="0 0 10 10"><foreignObject><div>HTML</div></foreignObject></svg>',
    '<svg viewBox="0 0 10 10"><rect width="10" height="10" onload="alert(1)"/></svg>',
    '<svg viewBox="0 0 10 10"><use href="https://example.com/a.svg#x"/></svg>',
    '<!DOCTYPE svg [<!ENTITY x "test">]><svg viewBox="0 0 10 10"><text>&x;</text></svg>',
    '<svg viewBox="0 0 10 10"><rect style="fill:url(https://example.com/x)"/></svg>',
    '<svg viewBox="0 0 10 10"><use id="a" href="#a"/></svg>',
    '<svg viewBox="0 0 10 10"><image href="data:image/png;base64,xxx"/></svg>',
  ]){const result=parser.parse(block('x-svg',svg));assert.equal(result.diagnostics.length,1,svg);assert.doesNotMatch(result.html,/<svg\b/);}
  const styled='<svg viewBox="0 0 10 10"><title>Safe</title><rect style="fill:#2563eb;stroke-width:2" width="10" height="10"/></svg>';
  assert.deepEqual(parser.parse(block('x-svg',styled)).diagnostics,[]);
  const priority=parser.parse(block('x-svg','<svg viewBox="0 0 10 10" role="img" aria-label="Priority" preserveAspectRatio="none"><rect style="fill:red" fill="blue" width="10px" height="10px"/></svg>'));
  assert.deepEqual(priority.diagnostics,[]);assert.match(priority.html,/fill="red"/);assert.doesNotMatch(priority.html,/fill="blue"/);assert.match(priority.html,/preserveAspectRatio="none"/);
  const cycle={...sceneSpec,children:[['defs',{},['symbol',{id:'a'},['use',{href:'#b'}]],['symbol',{id:'b'},['use',{href:'#a'}]]],['use',{href:'#a'}]]};
  assert.equal(parser.parse(block('x-svg',cycle)).diagnostics.length,1);
  assert.equal(createParser({maxSvgNodes:3}).parse(block('x-svg',sceneSpec)).diagnostics.length,1);
});
test('extension cache reuses work, keeps IDs unique, and respects configured capacity',()=>{
  const parser=createParser({cacheEntries:2,maxCacheCodeUnits:20000});
  const source=block('x-svg',sceneSpec)+'\n'+block('x-svg',sceneSpec);
  const result=parser.parse(source);const ids=[...result.html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  assert.match(result.html,/url\(#xg-doc-1-scene-ocean\)/);assert.match(result.html,/url\(#xg-doc-2-scene-ocean\)/);
  assert.equal(parser.cacheStats().misses,1);assert.equal(parser.cacheStats().hits,1);assert.equal(parser.cacheStats().renderMisses,1);assert.equal(parser.cacheStats().renderHits,1);
  assert.throws(()=>{result.tokens.find(t=>t.meta?.xmarkdown).meta.xmarkdown.spec.title='changed';},TypeError);
  parser.parse('$x$');parser.parse('$y$');assert.ok(parser.cacheStats().entries<=2);assert.ok(parser.cacheStats().retainedCodeUnits<=20000);
  parser.clearCache();const renderHits=parser.cacheStats().renderHits;parser.renderTokens(result.tokens);assert.equal(parser.cacheStats().renderHits,renderHits);assert.equal(parser.cacheStats().retainedCodeUnits,0);
  const disabled=createParser({cacheEntries:0});assert.equal(disabled.parse(source).html,result.html);assert.equal(disabled.cacheStats().entries,0);
  const constrained=createParser({maxCacheCodeUnits:6200});assert.equal(constrained.parse(source).html,result.html);assert.equal(constrained.cacheStats().entries,0);
});
test('new features stay provisional until complete and final streamed output matches batch',()=>{
  const parser=createParser();const batch=parser.parse(extendedSource);
  for(const size of [1,7,64,257]){const stream=parser.stream();for(let i=0;i<extendedSource.length;i+=size)stream.write(extendedSource.slice(i,i+size));const final=stream.finish();assert.equal(final.document.html,batch.html);assert.deepEqual(final.document.diagnostics,batch.diagnostics);assert.deepEqual(final.document.assets,batch.assets);assert.ok(final.stats.submittedCodeUnits<=extendedSource.length*4);}
  for(const kind of ['x-widget','x-svg','x-math']){const content=kind==='x-widget'?JSON.stringify(controlsSpec):kind==='x-svg'?importedSvg:'x^2';const stream=parser.stream();assert.deepEqual(stream.write('```'+kind+'\n'+content).updates,[]);const result=stream.finish();assert.equal(result.document.diagnostics.length,1);assert.doesNotMatch(result.document.html,/<svg|<math|data-x-widget=/);}
  const math=parser.stream();assert.deepEqual(math.write('$$\nx^2\n\n').updates,[]);assert.ok(math.write('$$\n').updates.some(update=>/<math/.test(update.html)));
});
