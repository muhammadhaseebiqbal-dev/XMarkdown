import { escape } from './graphics.js';
const namespace='http://www.w3.org/2000/svg';
const common=['id','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-dasharray','stroke-dashoffset','fill-rule','clip-rule','opacity','fill-opacity','stroke-opacity','transform','clip-path','mask','vector-effect','marker-start','marker-mid','marker-end'];
const tags={
  g:[],defs:[],path:['d'],rect:['x','y','width','height','rx','ry'],circle:['cx','cy','r'],ellipse:['cx','cy','rx','ry'],line:['x1','y1','x2','y2'],
  polyline:['points'],polygon:['points'],text:['x','y','dx','dy','font-size','font-family','font-weight','text-anchor','dominant-baseline','textLength','lengthAdjust'],tspan:['x','y','dx','dy','font-size','font-weight','text-anchor'],
  linearGradient:['x1','y1','x2','y2','gradientUnits','gradientTransform','spreadMethod','href'],radialGradient:['cx','cy','r','fx','fy','fr','gradientUnits','gradientTransform','spreadMethod','href'],stop:['offset','stop-color','stop-opacity'],
  clipPath:['clipPathUnits'],mask:['x','y','width','height','maskUnits','maskContentUnits'],symbol:['viewBox','preserveAspectRatio'],use:['href','x','y','width','height'],
  marker:['viewBox','refX','refY','markerWidth','markerHeight','orient','markerUnits','preserveAspectRatio'],pattern:['x','y','width','height','patternUnits','patternContentUnits','patternTransform','viewBox','preserveAspectRatio'],title:[],desc:[],
};
const numeric=new Set(['x','y','width','height','cx','cy','r','rx','ry','x1','y1','x2','y2','fx','fy','fr','dx','dy','offset','font-size','textLength','refX','refY','markerWidth','markerHeight','stroke-width','stroke-miterlimit','stroke-dashoffset']);
const opacities=new Set(['opacity','fill-opacity','stroke-opacity','stop-opacity']);
const enums={
  'stroke-linecap':['butt','round','square'],'stroke-linejoin':['miter','round','bevel'],'fill-rule':['nonzero','evenodd'],'clip-rule':['nonzero','evenodd'],
  'vector-effect':['none','non-scaling-stroke'],'text-anchor':['start','middle','end'],'dominant-baseline':['auto','middle','central','hanging','alphabetic','text-before-edge','text-after-edge'],
  gradientUnits:['userSpaceOnUse','objectBoundingBox'],spreadMethod:['pad','reflect','repeat'],clipPathUnits:['userSpaceOnUse','objectBoundingBox'],
  maskUnits:['userSpaceOnUse','objectBoundingBox'],maskContentUnits:['userSpaceOnUse','objectBoundingBox'],patternUnits:['userSpaceOnUse','objectBoundingBox'],patternContentUnits:['userSpaceOnUse','objectBoundingBox'],markerUnits:['strokeWidth','userSpaceOnUse'],lengthAdjust:['spacing','spacingAndGlyphs'],
};
const numberPattern=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
const idPattern=/^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
function list(value){const s=String(value).trim();if(!s||!/^[\s,\d.eE+-]+$/.test(s))throw new Error('Invalid SVG numeric list');const numbers=s.split(/[\s,]+/).map(Number);if(numbers.some(n=>!Number.isFinite(n)||Math.abs(n)>1e6))throw new Error('SVG number is out of range');return numbers;}
function viewBox(value){const n=Array.isArray(value)?value:list(value);if(n.length!==4||n.some(x=>typeof x!=='number'||!Number.isFinite(x)||Math.abs(x)>1e6)||n[2]<=0||n[3]<=0||n[2]>16384||n[3]>16384)throw new Error('Invalid SVG viewBox');return n;}
function scalar(value,key){const s=String(value).replace(/px$/,'');const raw=s.endsWith('%')?s.slice(0,-1):s;if(!numberPattern.test(raw)||Math.abs(Number(raw))>1e6)throw new Error('Invalid SVG '+key);if(['width','height','r','rx','ry','font-size','stroke-width','markerWidth','markerHeight','stroke-miterlimit'].includes(key)&&Number(raw)<0)throw new Error('Negative SVG '+key);return s;}
function paint(value){const s=String(value);if(/^url\(#[A-Za-z][A-Za-z0-9_-]{0,63}\)$/.test(s)||/^(?:none|currentColor|transparent|[a-z]{1,24}|#[0-9a-f]{3,8}|rgba?\([\d.,%\s]+\))$/i.test(s))return s;throw new Error('Unsupported SVG paint');}
function transform(value){const s=String(value);let at=0;const re=/\s*(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)\s*/gy;let match,count=0;
  while(at<s.length){re.lastIndex=at;match=re.exec(s);if(!match||++count>16)throw new Error('Invalid SVG transform');const n=list(match[2]);const allowed={matrix:[6],translate:[1,2],scale:[1,2],rotate:[1,3],skewX:[1],skewY:[1]};if(!allowed[match[1]].includes(n.length))throw new Error('Invalid SVG transform arguments');at=re.lastIndex;}return s;
}
function attributes(tag,input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('SVG attributes must be an object');const output={};
  for(const [key,value] of Object.entries(input)){
    if(!common.includes(key)&&!tags[tag].includes(key))throw new Error('Unsupported SVG '+tag+' attribute: '+key);
    if(typeof value!=='string'&&typeof value!=='number')throw new Error('Invalid SVG attribute value');const s=String(value);if(s.length>16384)throw new Error('SVG attribute is too long');
    if(key==='id'){if(!idPattern.test(s))throw new Error('Invalid SVG id');output[key]=s;}
    else if(key==='href'){if(!/^#[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(s))throw new Error('SVG references must be local #ids');output[key]=s;}
    else if(['fill','stroke','stop-color'].includes(key))output[key]=paint(value);
    else if(['clip-path','mask','marker-start','marker-mid','marker-end'].includes(key)){if(s!=='none'&&!/^url\(#[A-Za-z][A-Za-z0-9_-]{0,63}\)$/.test(s))throw new Error('SVG references must be local');output[key]=s;}
    else if(key==='d'){if(!s.trim()||!/^[MmZzLlHhVvCcSsQqTtAa\d\s,.eE+-]+$/.test(s))throw new Error('Unsupported SVG path data');const numbers=s.match(/[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/gi)||[];if(numbers.some(n=>!Number.isFinite(Number(n))||Math.abs(Number(n))>1e6))throw new Error('SVG path coordinate is out of range');output[key]=s;}
    else if(key==='points'){const n=list(s);if(n.length<4||n.length%2)throw new Error('Invalid SVG points');output[key]=n.join(' ');}
    else if(key==='viewBox')output[key]=viewBox(s).join(' ');
    else if(['transform','gradientTransform','patternTransform'].includes(key))output[key]=transform(s);
    else if(opacities.has(key)){if(!numberPattern.test(s)||Number(s)<0||Number(s)>1)throw new Error('Invalid SVG opacity');output[key]=s;}
    else if(key==='stroke-dasharray'){if(s!=='none'&&list(s).some(n=>n<0))throw new Error('Invalid dash array');output[key]=s;}
    else if(numeric.has(key))output[key]=scalar(value,key);
    else if(Object.hasOwn(enums,key)){if(!enums[key].includes(s))throw new Error('Invalid SVG '+key);output[key]=s;}
    else if(key==='orient'){if(!['auto','auto-start-reverse'].includes(s)&&!numberPattern.test(s))throw new Error('Invalid marker orientation');output[key]=s;}
    else if(key==='preserveAspectRatio'){if(!/^(?:none|x(?:Min|Mid|Max)Y(?:Min|Mid|Max)(?: (?:meet|slice))?)$/.test(s))throw new Error('Invalid aspect ratio');output[key]=s;}
    else if(key==='font-family'){if(!/^[A-Za-z ,_-]{1,80}$/.test(s))throw new Error('Invalid font family');output[key]=s;}
    else if(key==='font-weight'){if(!/^(normal|bold|[1-9]00)$/.test(s))throw new Error('Invalid font weight');output[key]=s;}
    else throw new Error('Unvalidated SVG attribute: '+key);
  }
  return output;
}
function importXml(source,limits,adapters){
  const SaxesParser=adapters.xml();const parser=new SaxesParser({xmlns:true});const stack=[];let root,nodes=0;
  parser.on('doctype',()=>{throw new Error('SVG DTDs and entities are disabled');});
  parser.on('processinginstruction',node=>{if(node.target!=='xml')throw new Error('SVG processing instructions are disabled');});
  parser.on('error',error=>{throw error;});
  parser.on('opentag',node=>{
    if(node.uri&&node.uri!==namespace)throw new Error('Unsupported SVG namespace');if(++nodes>limits.maxSvgNodes||stack.length>limits.maxSvgDepth)throw new Error('SVG import exceeds limits');
    const attrs={},presentation={};for(const attr of Object.values(node.attributes)){
      if(attr.name==='xmlns'||attr.prefix==='xmlns')continue;
      const key=attr.name==='xlink:href'?'href':attr.name;
      if(key==='style'){
        for(const declaration of attr.value.split(';')){if(!declaration.trim())continue;const split=declaration.indexOf(':');if(split<0)throw new Error('Invalid SVG style');const name=declaration.slice(0,split).trim(),value=declaration.slice(split+1).trim();presentation[name]=value;}
      }else attrs[key]=attr.value;
    }
    Object.assign(attrs,presentation);
    if(node.local==='svg'){
      if(stack.length||root)throw new Error('Only one root SVG is supported');
      const vb=attrs.viewBox?viewBox(attrs.viewBox):[0,0,Number(String(attrs.width).replace(/px$/,'')),Number(String(attrs.height).replace(/px$/,''))];
      const aspect=attrs.preserveAspectRatio,label=attrs['aria-label'];
      for(const key of ['viewBox','width','height','version','preserveAspectRatio','role','aria-label','aria-labelledby','aria-describedby','focusable'])delete attrs[key];
      root={title:'Imported SVG',description:'Imported vector illustration.',viewBox:viewBox(vb),children:[]};
      if(label)root.title=label;if(aspect)root.preserveAspectRatio=aspect;
      const group=['g',attrs];root.children.push(group);stack.push(group);return;
    }
    if(!root||!Object.hasOwn(tags,node.local))throw new Error('Unsupported SVG element: '+node.local);
    const tuple=[node.local,attrs];stack.at(-1).push(tuple);stack.push(tuple);
  });
  parser.on('text',value=>{if(!stack.length){if(value.trim())throw new Error('Text outside SVG');return;}if(value.trim()||['text','tspan','title','desc'].includes(stack.at(-1)[0]))stack.at(-1).push(value);});
  parser.on('cdata',value=>{if(stack.length)stack.at(-1).push(value);});
  parser.on('closetag',()=>{const tuple=stack.pop();if(tuple?.[0]==='title'&&tuple.slice(2).every(x=>typeof x==='string'))root.title=tuple.slice(2).join('');if(tuple?.[0]==='desc'&&tuple.slice(2).every(x=>typeof x==='string'))root.description=tuple.slice(2).join('');});
  parser.write(source).close();if(!root||stack.length)throw new Error('Incomplete SVG');return root;
}
export function validateSvg(source,limits,adapters){
  const raw=source.trim().startsWith('<')?importXml(source,limits,adapters):JSON.parse(source);
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(k=>!['title','description','viewBox','children','preserveAspectRatio'].includes(k)))throw new Error('Invalid SVG scene');
  for(const key of ['title','description'])if(typeof raw[key]!=='string'||!raw[key].trim()||raw[key].length>(key==='title'?160:1024))throw new Error('Invalid SVG '+key);
  if(!Array.isArray(raw.children)||!raw.children.length)throw new Error('SVG scene requires children');
  const sceneViewBox=viewBox(raw.viewBox);
  const aspect=raw.preserveAspectRatio===undefined?undefined:attributes('symbol',{preserveAspectRatio:raw.preserveAspectRatio}).preserveAspectRatio;
  let count=0,pathLength=0;const ids=new Map(),references=[];
  function visit(tuple,depth=0,ancestors=[]){
    if(!Array.isArray(tuple)||tuple.length<2||!Object.hasOwn(tags,tuple[0]))throw new Error('Unknown SVG scene element');if(++count>limits.maxSvgNodes||depth>limits.maxSvgDepth)throw new Error('SVG scene exceeds node/depth limits');
    const [tag,attrs,...children]=tuple;const normalized=attributes(tag,attrs);
    if(tag==='use'&&!normalized.href)throw new Error('SVG use requires a local href');
    if(tag==='pattern'){
      const minimum=normalized.patternUnits==='userSpaceOnUse'?16:.02;
      const size=(value,index)=>value?.endsWith('%')?Number(value.slice(0,-1))/100*(normalized.patternUnits==='userSpaceOnUse'?sceneViewBox[index]:1):Number(value);
      if(!normalized.width||!normalized.height||size(normalized.width,2)<minimum||size(normalized.height,3)<minimum)throw new Error('SVG pattern tiles are too small');
    }
    if(normalized.id){if(ids.has(normalized.id))throw new Error('Duplicate SVG id');ids.set(normalized.id,{tuple:null,tag,ancestors});}
    pathLength+=(normalized.d?.length||0)+(normalized.points?.length||0);if(pathLength>limits.maxSvgPathCodeUnits)throw new Error('SVG paths exceed the length limit');
    for(const [key,value] of Object.entries(normalized)){const match=key==='href'?/^#(.+)$/.exec(value):/^url\(#(.+)\)$/.exec(value);if(match)references.push({id:match[1],key,tag,ancestors:[...ancestors,...(normalized.id?[normalized.id]:[])]});}
    const next=[tag,normalized];
    for(const child of children){if(typeof child==='string'){if(!['text','tspan','title','desc'].includes(tag)||child.length>4096)throw new Error('Text is only permitted in SVG text elements');next.push(child);}else{if(!['g','defs','text','tspan','linearGradient','radialGradient','clipPath','mask','symbol','marker','pattern'].includes(tag))throw new Error('SVG element does not accept children');next.push(visit(child,depth+1,[...ancestors,...(normalized.id?[normalized.id]:[])]));}}
    if(normalized.id)ids.get(normalized.id).tuple=next;return next;
  }
  const children=raw.children.map(t=>visit(t));
  const dependencies=new Map([...ids.keys()].map(id=>[id,[]]));
  for(const ref of references){if(!ids.has(ref.id))throw new Error('SVG reference names a missing id');for(const owner of ref.ancestors)dependencies.get(owner).push(ref.id);
    if(ref.key==='href'&&!['use','linearGradient','radialGradient'].includes(ref.tag))throw new Error('Unsupported SVG reference');
    if(ref.key==='href'&&ref.tag!=='use'&&!['linearGradient','radialGradient'].includes(ids.get(ref.id).tag))throw new Error('Invalid gradient inheritance');
    if(ref.key==='href'&&ref.tag==='use'&&['defs','linearGradient','radialGradient','stop','clipPath','mask','pattern','marker'].includes(ids.get(ref.id).tag))throw new Error('Invalid SVG reuse target');
    if(ref.key==='clip-path'&&ids.get(ref.id).tag!=='clipPath')throw new Error('Invalid clipping reference');
    if(ref.key==='mask'&&ids.get(ref.id).tag!=='mask')throw new Error('Invalid mask reference');
    if(ref.key.startsWith('marker-')&&ids.get(ref.id).tag!=='marker')throw new Error('Invalid marker reference');
  }
  const complete=new Set(),active=new Set();
  function check(id,depth=0){if(active.has(id)||depth>limits.maxSvgDepth)throw new Error('SVG reference cycle or nesting limit');if(complete.has(id))return;active.add(id);for(const dependency of dependencies.get(id))check(dependency,depth+1);active.delete(id);complete.add(id);}
  for(const id of ids.keys())check(id);
  let expanded=0;
  function expansion(tuple,depth=0){if(depth>limits.maxSvgDepth||++expanded>limits.maxSvgExpandedNodes)throw new Error('SVG reuse exceeds expansion budget');for(const child of tuple.slice(2))if(Array.isArray(child))expansion(child,depth+1);if(tuple[0]==='use')expansion(ids.get(tuple[1].href?.slice(1))?.tuple||[],depth+1);}
  for(const tuple of children)expansion(tuple);
  return {kind:'x-svg',spec:{title:raw.title,description:raw.description,viewBox:sceneViewBox,children,...(aspect?{preserveAspectRatio:aspect}:{})}};
}
export function renderSvg(graphic,id){
  function render(tuple){const [tag,attrs,...children]=tuple;let attributes='';for(const [key,raw] of Object.entries(attrs)){let value=raw;if(key==='id')value=id+'-scene-'+raw;else if(key==='href')value='#'+id+'-scene-'+raw.slice(1);else if(/^url\(#/.test(raw))value='url(#'+id+'-scene-'+raw.slice(5,-1)+')';attributes+=' '+key+'="'+escape(value)+'"';}return '<'+tag+attributes+'>'+children.map(x=>typeof x==='string'?escape(x):render(x)).join('')+'</'+tag+'>';}
  const spec=graphic.spec;return `<figure class="x-graphic x-scene"><figcaption>${escape(spec.title)}</figcaption><svg xmlns="${namespace}" viewBox="${spec.viewBox.join(' ')}"${spec.preserveAspectRatio?' preserveAspectRatio="'+spec.preserveAspectRatio+'"':''} role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${escape(spec.title)}</title><desc id="${id}-desc">${escape(spec.description)}</desc>${spec.children.map(render).join('')}</svg><p class="x-description">${escape(spec.description)}</p></figure>\n`;
}
