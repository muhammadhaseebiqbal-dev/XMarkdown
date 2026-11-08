export interface ParserOptions {
  maxInputCodeUnits?:number; maxGraphicCodeUnits?:number; maxChartRows?:number;
  maxDiagramNodes?:number; maxDiagramEdges?:number; maxTokens?:number; maxOutputCodeUnits?:number;
  previewParseFactor?:number; maxMathCodeUnits?:number; maxSvgNodes?:number; maxSvgDepth?:number;
  maxSvgExpandedNodes?:number; maxSvgPathCodeUnits?:number; maxWidgetInputs?:number;
  maxWidgetOutputs?:number; maxDrawingPoints?:number; cacheEntries?:number; maxCacheCodeUnits?:number;
}
export interface Diagnostic {code:string;line:number;message:string}
export interface ParsedDocument {
  version:number; source:string; tokens:unknown[]; diagnostics:Diagnostic[];
  html?:string; env:Record<string,unknown>; assets:{modules:string[]};
}
export interface ParseSettings {render?:boolean;env?:Record<string,unknown>;lineOffset?:number;idPrefix?:string}
export interface StreamStats {previewParses:number;previewCodeUnits:number;finalCodeUnits:number;deferredPreviews:number}
export interface StreamUpdate {revision:number;html?:string;[key:string]:unknown}
export interface DocumentStream {
  write(chunk:string):{updates:StreamUpdate[];pendingCodeUnits:number};
  finish():{document:ParsedDocument;stats:StreamStats};
}
export interface CacheStats {hits:number;misses:number;renderHits:number;renderMisses:number;entries:number;retainedCodeUnits:number}
export interface Parser {
  limits:Readonly<Required<ParserOptions>>;
  parse(source:string,settings?:ParseSettings):ParsedDocument;
  renderTokens(tokens:unknown[],env?:Record<string,unknown>):string;
  stream(settings?:{renderPreviews?:boolean}):DocumentStream;
  cacheStats():CacheStats; clearCache():void;
}
export function createParser(options?:ParserOptions):Parser;
export const graphicStyles:string;
export const widgetStyles:string;
