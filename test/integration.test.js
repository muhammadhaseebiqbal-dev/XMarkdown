import test from 'node:test';
import assert from 'node:assert/strict';
import {createParser} from 'xmarkdown';
import {createParser as createBrowserParser} from 'xmarkdown/browser';
import {XMarkdown} from 'xmarkdown/react';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {showcaseCases} from '../examples/showcase.js';
import {extendedSource} from '../demo/extended-content.js';

test('browser export uses the same renderer for complex features and SVG imports',async()=>{
  const node=createParser(),browser=createBrowserParser();
  for(const source of [...showcaseCases.map(c=>c.x),extendedSource]){
    const expected=node.parse(source),actual=await browser.parse(source);
    assert.deepEqual(actual.diagnostics,[]);assert.equal(actual.html,expected.html);assert.deepEqual(actual.assets,expected.assets);
  }
  await assert.rejects(()=>createBrowserParser({maxInputCodeUnits:4}).parse('oversized'),RangeError);
});
test('browser stream preserves final output after async processor preparation',async()=>{
  const parser=createBrowserParser();const stream=await parser.stream();
  for(let at=0;at<extendedSource.length;at+=97)stream.write(extendedSource.slice(at,at+97));
  assert.equal(stream.finish().document.html,(await parser.parse(extendedSource)).html);
});
test('React server rendering consumes the actual parsed document',()=>{
  const document=createParser().parse(showcaseCases[0].x);
  const html=renderToStaticMarkup(createElement(XMarkdown,{document}));
  assert.match(html,/data-xmarkdown-renderer="native"/);assert.match(html,/<pattern/);assert.match(html,/<mask/);assert.ok(html.includes(document.html));
});
