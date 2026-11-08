import { evaluateExpression } from '../expressions.js';
const mounted=new WeakSet();
export function mountWidgets(root=document){
  for(const host of root.querySelectorAll('[data-x-widget]')){
    if(mounted.has(host))continue;mounted.add(host);
    const {spec,compiled}=JSON.parse(host.getAttribute('data-x-widget'));
    if(spec.type==='controls'){
      const inputs=new Map([...host.querySelectorAll('[data-input]')].map(el=>[el.dataset.input,el]));
      const outputs=new Map([...host.querySelectorAll('[data-output]')].map(el=>[el.dataset.output,el]));
      const update=()=>{
        const values=Object.create(null);
        for(const input of spec.inputs){const el=inputs.get(input.id);
          values[input.id]=input.type==='toggle'?el.checked:input.type==='select'?input.options[Number(el.value)].value:Math.max(input.min,Math.min(input.max,Number(el.value)));
        }
        for(let i=0;i<spec.outputs.length;i++){const output=spec.outputs[i];try{const value=evaluateExpression(compiled[i],values);values[output.id]=value;outputs.get(output.id).textContent=String(value)+(output.unit?' '+output.unit:'');}catch{outputs.get(output.id).textContent='Invalid result';values[output.id]=NaN;}}
      };
      host.addEventListener('input',update);update();continue;
    }
    const svg=host.querySelector('svg'),status=host.querySelector('[role="status"]');
    let active=null,points=[...svg.children].reduce((n,line)=>n+line.points.numberOfItems,0),count=svg.children.length;
    const update=()=>{status.textContent=count+(count===1?' stroke':' strokes');};
    function point(event){const matrix=svg.getScreenCTM();if(!matrix)return null;const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());return [Math.max(0,Math.min(spec.width,p.x)),Math.max(0,Math.min(spec.height,p.y))];}
    const end=()=>{active=null;update();};
    svg.addEventListener('pointerdown',event=>{
      if(event.button!==0||active||count>=128||points>=8192)return;const p=point(event);if(!p)return;
      svg.setPointerCapture(event.pointerId);const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');
      line.setAttribute('fill','none');line.setAttribute('stroke',spec.color);line.setAttribute('stroke-width',String(spec.lineWidth));line.setAttribute('stroke-linecap','round');line.setAttribute('stroke-linejoin','round');
      const item=svg.createSVGPoint();item.x=p[0];item.y=p[1];line.points.appendItem(item);svg.append(line);active={line,last:p,pointer:event.pointerId};count++;points++;
    });
    svg.addEventListener('pointermove',event=>{
      if(!active||active.pointer!==event.pointerId)return;if(points>=8192){end();return;}const p=point(event);if(!p||Math.hypot(p[0]-active.last[0],p[1]-active.last[1])<1)return;
      const item=svg.createSVGPoint();item.x=p[0];item.y=p[1];active.line.points.appendItem(item);active.last=p;points++;
    });
    svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);svg.addEventListener('lostpointercapture',end);
    host.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(!button)return;end();if(button.dataset.action==='clear'){svg.replaceChildren();points=0;count=0;}else if(button.dataset.action==='undo'&&svg.lastElementChild){points=Math.max(0,points-svg.lastElementChild.points.numberOfItems);svg.lastElementChild.remove();count--;}update();});
    update();
  }
}
if(typeof document!=='undefined')mountWidgets();
