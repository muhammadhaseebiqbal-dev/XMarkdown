import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root=new URL('../dist/',import.meta.url);
const html=readFileSync(new URL('index.html',root),'utf8');
const examples=JSON.parse(readFileSync(new URL('assets/examples.json',root),'utf8'));
assert.equal(examples.length,18);
for(const item of examples){assert.ok(existsSync(new URL(`examples/${item.id}.html`,root)));assert.ok(existsSync(new URL(`downloads/${item.id}.md`,root)));}
for(const match of html.matchAll(/(?:href|src)="(\/(?!#)[^"?#]+)[^"]*"/g)){
  const path=match[1]==='/'?'index.html':match[1].slice(1);
  assert.ok(existsSync(new URL(path,root)),`Missing local link: ${path}`);
}
assert.ok(html.includes('sandbox="allow-scripts"'));
assert.ok(!html.includes('allow-same-origin'));
for (const path of ['examples/10-canvas.html','examples/13-capacity.html','examples/preview.html']) {
  const preview = readFileSync(new URL(path,root),'utf8');
  assert.match(preview,/<script nonce="[^"]+" type="module">/);
  assert.doesNotMatch(preview,/<script[^>]+src=/);
}
const previewShell=readFileSync(new URL('examples/preview.html',root),'utf8');
assert.ok(previewShell.includes('x-preview-document'));
assert.ok(previewShell.includes('xmarkdown:rendered'));
const client=readFileSync(new URL('assets/app.js',root),'utf8');
assert.ok(client.includes("preview.src = '/examples/preview.html'"));
assert.ok(!client.includes('.srcdoc='));
assert.ok(existsSync(new URL('assets/renderer/parser.js',root)));
assert.ok(existsSync(new URL('integrations/react.html',root)));
assert.ok(existsSync(new URL('assets/renderer/react-demo.css',root)));
assert.ok(existsSync(new URL('assets/browser/widgets.js',root)));
assert.ok(existsSync(new URL('../expressions.js',new URL('assets/browser/widgets.js',root))));
for(const match of readFileSync(new URL('assets/renderer/parser.js',root),'utf8').matchAll(/(?:from|import)\s*\(?"([^"]+)"/g)){
  assert.ok(match[1].startsWith('./'),`Unbundled browser dependency: ${match[1]}`);
}
console.log('Showcase checks passed: 18 examples, native browser bundle, React integration, links, downloads, and isolated preview.');
