import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import handler from '../api/render.js';
import { fileURLToPath } from 'node:url';
const root=resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
if(!existsSync(resolve(root,'index.html'))) throw new Error('Run npm run build first.');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/api/render'){
    let body='',bytes=0;
    for await(const chunk of req){bytes+=chunk.length;if(bytes>131072){res.writeHead(413,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Request is too large.'}));return;}body+=chunk.toString();}
    req.body=body;res.status=code=>{res.statusCode=code;return res;};res.json=value=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));return res;};
    return handler(req,res);
  }
  let file;
  try{file=resolve(root,'.'+decodeURIComponent(path==='/'?'/index.html':path));}catch{res.writeHead(400);return res.end('Bad path');}
  if(!file.startsWith(root+sep)){res.writeHead(403);return res.end('Forbidden');}
  if(!existsSync(file)){file=resolve(root,'404.html');res.statusCode=404;}
  const extension=file.slice(file.lastIndexOf('.'));res.setHeader('Content-Type',mime[extension]||'application/octet-stream');
  if(path.startsWith('/assets/'))res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('X-Content-Type-Options','nosniff');
  // Match the production headers when exercising sandboxed previews locally.
  const config=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
  for(const header of config.headers[0].headers)res.setHeader(header.key,header.value);
  if(path.startsWith('/examples/'))res.setHeader('Content-Security-Policy',"frame-ancestors 'self'");
  try{res.end(readFileSync(file));}catch{res.writeHead(404);res.end('Not found');}
}).listen(4320,'127.0.0.1',()=>console.log('XMarkdown showcase: http://127.0.0.1:4320'));
