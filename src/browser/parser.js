import { createParser as createCoreParser } from '../core.js';
export { graphicStyles, widgetStyles } from '../core.js';

/** Async preparation around the same core, validators and renderers. */
export function createParser(options={}) {
  let math, xml, mathLoading, xmlLoading;
  const parser=createCoreParser(options,{math:()=>math,xml:()=>xml});
  async function prepare({math:needMath=false,svgImports=false}={}) {
    await Promise.all([
      needMath ? (mathLoading??=import('katex').then(module=>{math=module.default;})) : undefined,
      svgImports ? (xmlLoading??=import('saxes').then(module=>{xml=module.SaxesParser||module.default.SaxesParser;})) : undefined,
    ]);
  }
  return {
    limits:parser.limits,prepare,
    async parse(source,settings) {
      if(typeof source!=='string'||source.length>parser.limits.maxInputCodeUnits) return parser.parse(source,settings);
      await prepare({math:source.includes('$')||source.includes('x-math'),svgImports:source.includes('x-svg')&&source.includes('<')});
      return parser.parse(source,settings);
    },
    async stream(settings) {
      // Unknown future content: prepare optional adapters once before streaming.
      await prepare({math:true,svgImports:true});return parser.stream(settings);
    },
    cacheStats:parser.cacheStats,clearCache:parser.clearCache,
  };
}
