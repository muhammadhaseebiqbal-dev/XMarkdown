import { createRequire } from 'node:module';
import { createParser as createCoreParser } from './core.js';
export { graphicStyles, widgetStyles } from './core.js';
const require=createRequire(import.meta.url);
let math,xml;
const adapters={math:()=>math??=require('katex'),xml:()=>xml??=require('saxes').SaxesParser};
/** Synchronous Node entry. Optional processors load only when used. */
export function createParser(options={}) { return createCoreParser(options,adapters); }
