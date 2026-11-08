import test from 'node:test';
import assert from 'node:assert/strict';
import MarkdownIt from 'markdown-it';
import { readFileSync } from 'node:fs';
import { createParser } from '../src/index.js';

const parser=createParser();
const chart={type:'bar',title:'Requests',x:'day',y:'count',description:'Monday 2, Tuesday -1.',data:[{day:'Mon',count:2},{day:'Tue',count:-1}]};
const diagram={title:'Pipeline',description:'Input passes through validation into storage.',nodes:[{id:'input',label:'Input'},{id:'validate',label:'Validate'},{id:'store',label:'Store'}],edges:[['input','validate'],['validate','store']]};
const fence=(kind,spec)=>'```'+kind+'\n'+JSON.stringify(spec)+'\n```\n';

test('ordinary Markdown preserves the underlying parser behavior',()=> {
  const baseline=new MarkdownIt({html:false,linkify:false,typographer:false,maxNesting:32});
  const fixtures=[
    '# Heading\n\nSome **bold**, _emphasis_, and `code`.\n',
    'Title\n=====\n\n> A quote\n>\n> - nested\n> - list\n',
    '- one\n\n- two\n\n    continuation\n\nAfter.\n',
    '| A | B |\n|---|---:|\n| 1 | 2 |\n\n~~deleted~~\n',
    '```js\nconst x = "<script>";\n```\n',
    '<script>alert(1)</script>\n\nEscaped & text.\n',
    '```\n```x-chart\n{}\n```\n',
  ];
  for (const source of fixtures) assert.equal(parser.parse(source).html,baseline.render(source));
});

test('callouts support nested Markdown and ignore closing syntax inside code',()=> {
  const source=':::note[Boundary]\n**Content**\n\n````\n:::\n````\n\n:::tip[Inner]\nUseful.\n:::\n:::\n';
  const result=parser.parse(source);
  assert.equal(result.tokens.filter(t=>t.type==='x_callout_open').length,2);
  assert.match(result.html,/<strong>Content<\/strong>/);
  assert.match(result.html,/x-callout-tip/);
  assert.match(result.html,/<code>:::/);
});

test('valid charts and graphs produce typed nodes and accessible SVG',()=> {
  const result=parser.parse(fence('x-chart',chart)+'\n'+fence('x-diagram',diagram));
  assert.deepEqual(result.diagnostics,[]);
  assert.equal(result.tokens.filter(t=>t.meta?.xmarkdown).length,2);
  assert.equal((result.html.match(/<svg /g)||[]).length,2);
  assert.match(result.html,/aria-labelledby=/);
  assert.match(result.html,/<desc[^>]*>Monday 2, Tuesday -1\./);
  assert.doesNotMatch(result.html,/NaN|Infinity/);
  assert.match(result.html,/id="xg-doc-1-arrow"|id="xg-doc-2-arrow"/);
});

test('zero-only, single-point, and cyclic graphics remain finite',()=> {
  const zero={...chart,type:'line',data:[{day:'Mon',count:0}]};
  const cycle={...diagram,edges:[...diagram.edges,['store','input']]};
  const result=parser.parse(fence('x-chart',zero)+'\n'+fence('x-diagram',cycle));
  assert.equal(result.diagnostics.length,0);
  assert.doesNotMatch(result.html,/NaN|Infinity/);
});

test('graphic fences work within lists and block quotes',()=> {
  const source=fence('x-chart',chart);
  const quoted=source.split('\n').map(line=>'> '+line).join('\n');
  const listed='- Chart\n\n'+source.split('\n').map(line=>'  '+line).join('\n');
  for (const value of [quoted,listed]) {
    const result=parser.parse(value);
    assert.equal(result.diagnostics.length,0);
    assert.match(result.html,/<svg /);
  }
});

test('invalid or unfinished graphics stay escaped source',()=> {
  for (const source of [
    '```x-chart\n'+JSON.stringify(chart),
    fence('x-chart',{...chart,onClick:'alert(1)'}),
    fence('x-chart',{...chart,data:[{day:'Mon',count:'2'}]}),
    fence('x-chart',{...chart,data:[{day:'Mon',count:1e100}]}),
    fence('x-diagram',{...diagram,edges:[['input','missing']]}),
    fence('x-diagram',{...diagram,nodes:[diagram.nodes[0],diagram.nodes[0]]}),
    '```x-chart\n{"__proto__":{},"type":"bar"}\n```\n',
    '```mermaid\n%%{init: {"securityLevel":"loose"}}%%\nflowchart LR\nA-->B\n```\n',
  ]) {
    const result=parser.parse(source);
    assert.equal(result.diagnostics.length,1,source);
    assert.doesNotMatch(result.html,/<svg /);
  }
});

test('document content cannot emit programs or load images',()=> {
  const malicious={...chart,title:'<img src=x onerror=alert(1)>',description:'</desc><script>alert(1)</script>'};
  const source='<script>alert(1)</script>\n\n[Click](javascript:alert%281%29)\n\n![Tracking](https://example.com/pixel.png)\n\n'+fence('x-chart',malicious);
  const result=parser.parse(source);
  assert.doesNotMatch(result.html,/<script|<img|href="javascript:|<[^>]*\sonerror\s*=/i);
  assert.match(result.html,/&lt;script&gt;/);
  assert.match(result.html,/x-image-alt/);
  assert.doesNotMatch(result.html,/src="https:\/\/example.com/);
});

test('limits and API lifecycle reject invalid use',()=> {
  assert.throws(()=>createParser({maxChartRows:0}),RangeError);
  assert.throws(()=>createParser({maxInputCodeUnits:10}).parse('longer than ten'),RangeError);
  assert.equal(createParser({maxChartRows:1}).parse(fence('x-chart',chart)).diagnostics.length,1);
  assert.throws(()=>parser.parse(null),TypeError);
  const stream=parser.stream();
  assert.throws(()=>stream.write(null),TypeError);
  stream.finish();
  assert.throws(()=>stream.write('new'));
  assert.throws(()=>stream.finish());
});

test('stream final output equals batch output across chunk boundaries and references',()=> {
  const source='# Start\n\nA [later][r] reference.\n\n- first\n\n- second\n\n'+fence('x-chart',chart)+'\n:::warning[Check]\nNested **content**.\n:::\n\n[r]: https://example.com "Reference"\n\nLast paragraph.\n';
  const batch=parser.parse(source);
  for (const size of [1,2,7,31,64,257,source.length]) {
    const stream=parser.stream();
    let patches=0, cursor=0;
    for (let i=0;i<source.length;i+=size) {
      for (const update of stream.write(source.slice(i,i+size)).updates) {
        assert.equal(update.start,cursor);
        assert.ok(update.end>update.start);
        assert.equal(update.provisional,true);
        cursor=update.end; patches++;
      }
    }
    const final=stream.finish();
    assert.equal(final.document.html,batch.html);
    assert.deepEqual(final.document.tokens,batch.tokens);
    assert.deepEqual(final.document.diagnostics,batch.diagnostics);
    assert.equal(final.replacePreview,true);
    assert.ok(final.stats.submittedCodeUnits<=source.length*4);
    assert.ok(patches>0);
  }
});

test('stream budget bounds submitted preview input for a long ambiguous list',()=> {
  const source=('- item\n\n').repeat(2000);
  const stream=parser.stream({renderPreviews:false});
  for (let i=0;i<source.length;i+=32) stream.write(source.slice(i,i+32));
  const result=stream.finish({render:false});
  assert.ok(result.stats.submittedCodeUnits<=source.length*4);
  assert.ok(result.stats.deferredPreviews>0);
  assert.deepEqual(result.document.tokens,parser.parse(source,{render:false}).tokens);
});

test('checked-in source example parses its chart and callout',()=> {
  const source=readFileSync(new URL('../examples/explainer.md',import.meta.url),'utf8');
  const result=parser.parse(source);
  assert.equal(result.diagnostics.length,0);
  assert.match(result.html,/<svg /);
  assert.match(result.html,/x-callout-note/);
});
