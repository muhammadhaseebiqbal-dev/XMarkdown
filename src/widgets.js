import { compileExpression, evaluateExpression } from './expressions.js';
import { escape } from './graphics.js';
export const widgetStyles='.x-controls h3{margin:0}.x-inputs{display:flex;flex-wrap:wrap;gap:1rem;margin:1rem 0}.x-inputs label{display:flex;flex-direction:column;gap:.35rem;min-width:160px}.x-inputs input,.x-inputs select,.x-draw-actions button{font:inherit}.x-outputs output{font-weight:650}.x-drawing svg{border:1px solid #cbd5e1;touch-action:none;background:white;cursor:crosshair}.x-draw-actions{display:flex;gap:.5rem;align-items:center;margin-top:.75rem}.x-draw-actions button{padding:.4rem .7rem;border:1px solid #94a3b8;border-radius:4px;background:#f8fafc;cursor:pointer}.x-draw-actions [role=status]{margin-left:auto;color:#475569}';
function object(x,keys,name){if(!x||typeof x!=='object'||Array.isArray(x))throw new Error(name+' must be an object');for(const k of Object.keys(x))if(!keys.includes(k))throw new Error('Unsupported '+name+' property: '+k);}
function text(x,name,max=160){if(typeof x!=='string'||!x.trim()||x.length>max)throw new Error('Invalid '+name);}
function numeric(x,name,min=-1e12,max=1e12){if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max)throw new Error('Invalid '+name);}
export function validateWidget(source,limits){
  const spec=JSON.parse(source);object(spec,['type','title','description','inputs','outputs','width','height','color','lineWidth','strokes'],'widget');
  text(spec.title,'widget title');text(spec.description,'widget description',1024);
  if(spec.type==='draw'){
    for(const key of ['inputs','outputs'])if(spec[key]!==undefined)throw new Error('Drawing does not accept '+key);
    spec.width??=640;spec.height??=320;spec.color??='#2563eb';spec.lineWidth??=3;
    numeric(spec.width,'width',64,2048);numeric(spec.height,'height',64,2048);numeric(spec.lineWidth,'lineWidth',1,24);
    if(!/^#[0-9a-f]{6}$/i.test(spec.color))throw new Error('Drawing color must be #rrggbb');
    if(spec.strokes!==undefined){
      if(!Array.isArray(spec.strokes)||spec.strokes.length>128)throw new Error('Too many initial strokes');
      let points=0;for(const stroke of spec.strokes){if(!Array.isArray(stroke)||stroke.length<2)throw new Error('Invalid stroke');for(const p of stroke){if(!Array.isArray(p)||p.length!==2)throw new Error('Invalid point');numeric(p[0],'point x',0,spec.width);numeric(p[1],'point y',0,spec.height);if(++points>limits.maxDrawingPoints)throw new Error('Drawing exceeds point limit');}}
    }
    return {kind:'x-widget',spec};
  }
  if(spec.type!=='controls')throw new Error('Widget type must be controls or draw');
  for(const key of ['width','height','color','lineWidth','strokes'])if(spec[key]!==undefined)throw new Error('Controls do not accept '+key);
  if(!Array.isArray(spec.inputs)||!spec.inputs.length||spec.inputs.length>limits.maxWidgetInputs)throw new Error('Invalid widget input count');
  if(!Array.isArray(spec.outputs)||!spec.outputs.length||spec.outputs.length>limits.maxWidgetOutputs)throw new Error('Invalid widget output count');
  const names=new Set(),values=Object.create(null);
  function name(id){if(typeof id!=='string'||!/^[A-Za-z][A-Za-z0-9_]{0,31}$/.test(id)||['constructor','prototype','__proto__'].includes(id)||names.has(id))throw new Error('Invalid or duplicate widget id');names.add(id);}
  for(const input of spec.inputs){
    object(input,['id','label','type','min','max','step','value','options'],'input');name(input.id);text(input.label,'input label');
    if(['range','number'].includes(input.type)){
      if(input.options!==undefined)throw new Error('Numeric inputs do not accept options');
      numeric(input.min,'minimum');numeric(input.max,'maximum');if(input.max<=input.min)throw new Error('Input maximum must exceed minimum');
      input.step??=1;numeric(input.step,'step',1e-6,1e12);numeric(input.value,'value',input.min,input.max);
    }else if(input.type==='toggle'){
      if(typeof input.value!=='boolean')throw new Error('Toggle value must be boolean');
      if(['min','max','step','options'].some(k=>input[k]!==undefined))throw new Error('Unsupported toggle setting');
    }else if(input.type==='select'){
      if(['min','max','step'].some(k=>input[k]!==undefined))throw new Error('Unsupported select setting');
      if(!Array.isArray(input.options)||!input.options.length||input.options.length>32)throw new Error('Invalid select options');
      for(const option of input.options){object(option,['label','value'],'option');text(option.label,'option label');if(typeof option.value==='number')numeric(option.value,'option value');else text(option.value,'option value');}
      if(!input.options.some(o=>o.value===input.value))throw new Error('Select value must name an option');
    }else throw new Error('Unsupported input type');
    values[input.id]=input.value;
  }
  const compiled=[];
  for(const output of spec.outputs){object(output,['id','label','expr','unit'],'output');text(output.label,'output label');if(output.unit!==undefined)text(output.unit,'unit',40);
    // Outputs can reference inputs and earlier outputs. This prevents dependency cycles.
    const ast=compileExpression(output.expr,names);name(output.id);values[output.id]=evaluateExpression(ast,values);compiled.push(ast);
  }
  return {kind:'x-widget',spec,compiled};
}
export function renderWidget(graphic,id){
  const {spec,compiled}=graphic;
  const runtimeSpec=spec.type==='controls'?{...spec,outputs:spec.outputs.map(({expr,...output})=>output)}:spec;
  const data=escape(JSON.stringify({spec:runtimeSpec,compiled}));
  if(spec.type==='draw'){
    const strokes=(spec.strokes||[]).map(s=>`<polyline points="${s.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${spec.color}" stroke-width="${spec.lineWidth}"/>`).join('');
    const count=spec.strokes?.length||0;
    return `<figure class="x-graphic x-drawing" data-x-widget="${data}"><figcaption>${escape(spec.title)}</figcaption><svg viewBox="0 0 ${spec.width} ${spec.height}" role="img" aria-label="${escape(spec.description)}">${strokes}</svg><div class="x-draw-actions"><button type="button" data-action="undo">Undo stroke</button> <button type="button" data-action="clear">Clear drawing</button><span role="status" aria-live="polite">${count}${count===1?' stroke':' strokes'}</span></div><p class="x-description">${escape(spec.description)}</p><noscript>Drawing controls require the trusted XMarkdown widget runtime.</noscript></figure>\n`;
  }
  const values=Object.create(null);
  const inputs=spec.inputs.map(input=>{
    values[input.id]=input.value;const inputId=id+'-'+input.id;let control;
    if(input.type==='select')control=`<select id="${inputId}" data-input="${input.id}">${input.options.map((o,i)=>`<option value="${i}"${o.value===input.value?' selected':''}>${escape(o.label)}</option>`).join('')}</select>`;
    else if(input.type==='toggle')control=`<input id="${inputId}" data-input="${input.id}" type="checkbox"${input.value?' checked':''}>`;
    else control=`<input id="${inputId}" data-input="${input.id}" type="${input.type}" min="${input.min}" max="${input.max}" step="${input.step}" value="${input.value}">`;
    return `<label for="${inputId}">${escape(input.label)}${control}</label>`;
  }).join('');
  const outputs=spec.outputs.map((o,i)=>{values[o.id]=evaluateExpression(compiled[i],values);return `<div><span>${escape(o.label)}: </span><output data-output="${o.id}" aria-live="polite">${escape(values[o.id])}${o.unit?' '+escape(o.unit):''}</output></div>`;}).join('');
  return `<section class="x-graphic x-controls" data-x-widget="${data}"><h3>${escape(spec.title)}</h3><p class="x-description">${escape(spec.description)}</p><div class="x-inputs">${inputs}</div><div class="x-outputs">${outputs}</div><noscript>Controls require the trusted XMarkdown widget runtime.</noscript></section>\n`;
}
