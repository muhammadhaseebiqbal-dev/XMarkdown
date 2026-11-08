import type {ReactElement} from 'react';
import type {ParsedDocument,ParserOptions,Diagnostic} from './index.js';
export interface XMarkdownProps {
  source?:string; document?:ParsedDocument; options?:ParserOptions; className?:string;
  onDiagnostics?:(diagnostics:Diagnostic[])=>void; onError?:(error:Error)=>void;
}
export function XMarkdown(props:XMarkdownProps):ReactElement;
