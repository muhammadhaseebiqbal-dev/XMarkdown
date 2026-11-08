import { validateGraphic, renderGraphic } from './graphics.js';
import { validateSvg, renderSvg } from './svg.js';
import { validateWidget, renderWidget } from './widgets.js';
import { compileMath } from './math.js';
export const blockKinds=new Set(['x-chart','x-diagram','mermaid','x-svg','x-widget','x-math']);
export function validateBlock(kind,source,limits,adapters){
  if(source.length>limits.maxGraphicCodeUnits)throw new Error('Extension block exceeds source limit');
  if(kind==='x-svg')return validateSvg(source,limits,adapters);
  if(kind==='x-widget')return validateWidget(source,limits);
  if(kind==='x-math')return {kind,source,html:compileMath(source,true,limits,adapters)};
  return validateGraphic(kind,source,limits);
}
export function renderBlock(graphic,id){
  if(graphic.kind==='x-svg')return renderSvg(graphic,id);
  if(graphic.kind==='x-widget')return renderWidget(graphic,id);
  if(graphic.kind==='x-math')return '<div class="x-equation">'+graphic.html+'</div>\n';
  return renderGraphic(graphic,id);
}
function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);for(const child of Object.values(value))freeze(child);}return value;}
export function createExtensionCache(limits,adapters){
  const entries=new Map(),records=new WeakMap();let units=0;
  const stats={hits:0,misses:0,renderHits:0,renderMisses:0};
  function evict(){const oldest=entries.keys().next().value,entry=entries.get(oldest);units-=entry.weight;entries.delete(oldest);records.delete(entry.graphic);delete entry.template;}
  function set(key,entry){if(!limits.cacheEntries||entry.weight>limits.maxCacheCodeUnits)return;entries.set(key,entry);units+=entry.weight;while(entries.size>limits.cacheEntries||units>limits.maxCacheCodeUnits)evict();if(entries.get(key)===entry)records.set(entry.graphic,entry);}
  return {
    validate(kind,source){if(!limits.cacheEntries){stats.misses++;return kind==='math-inline'||kind==='math-display'?{kind,source,html:compileMath(source,kind==='math-display',limits,adapters)}:validateBlock(kind,source,limits,adapters);}const key=kind+'\0'+source;let entry=entries.get(key);if(entry){stats.hits++;entries.delete(key);entries.set(key,entry);return entry.graphic;}
      stats.misses++;const graphic=freeze(kind==='math-inline'||kind==='math-display'?{kind,source,html:compileMath(source,kind==='math-display',limits,adapters)}:validateBlock(kind,source,limits,adapters));entry={graphic,key,weight:key.length+JSON.stringify(graphic).length};set(key,entry);return graphic;},
    math(source,display){return this.validate(display?'math-display':'math-inline',source).html;},
    render(graphic,id){const entry=records.get(graphic);if(!entry||!limits.cacheEntries)return renderBlock(graphic,id);
      let template=entry.template;
      if(!template){stats.renderMisses++;template=renderBlock(graphic,'xmd-cache');entry.template=template;units+=template.length;entry.weight+=template.length;while(entries.size>limits.cacheEntries||units>limits.maxCacheCodeUnits)evict();}else stats.renderHits++;
      // Rewrite only generated ID/reference attributes, never label text or JSON data.
      return template.replace(/\b(id|for|aria-labelledby|href|fill|stroke|clip-path|mask|marker-start|marker-mid|marker-end)="([^"]*)"/g,(all,key,value)=>{
        if(!value.includes('xmd-cache-'))return all;return key+'="'+value.replace(/xmd-cache-/g,id+'-')+'"';
      });},
    stats(){return {...stats,entries:entries.size,retainedCodeUnits:units};},clear(){while(entries.size)evict();units=0;},
  };
}
