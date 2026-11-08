import type {Parser,ParserOptions,ParsedDocument,ParseSettings,DocumentStream} from '../index.js';
export interface BrowserParser extends Omit<Parser,'parse'|'renderTokens'|'stream'> {
  prepare(features?:{math?:boolean;svgImports?:boolean}):Promise<void>;
  parse(source:string,settings?:ParseSettings):Promise<ParsedDocument>;
  stream(settings?:{renderPreviews?:boolean}):Promise<DocumentStream>;
}
export function createParser(options?:ParserOptions):BrowserParser;
export const graphicStyles:string;
export const widgetStyles:string;
