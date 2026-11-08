'use client';
import { createElement, useEffect, useRef, useState } from 'react';
import { mountWidgets } from './browser/widgets.js';

/** Render a parsed document or parse source using the native browser entry. */
export function XMarkdown({source,document:initialDocument,options,className='xmarkdown',onDiagnostics,onError}) {
  const root=useRef(null),parser=useRef(null),previousOptions=useRef(options);
  const [document,setDocument]=useState(initialDocument);
  const callbacks=useRef({onDiagnostics,onError});callbacks.current={onDiagnostics,onError};
  useEffect(()=>{
    if(initialDocument!==undefined){setDocument(initialDocument);return;}
    if(typeof source!=='string')return;
    let cancelled=false;
    (async()=>{
      const {createParser}=await import('./browser/parser.js');
      if(!parser.current||previousOptions.current!==options){parser.current=createParser(options);previousOptions.current=options;}
      const result=await parser.current.parse(source);
      if(!cancelled){setDocument(result);callbacks.current.onDiagnostics?.(result.diagnostics);}
    })().catch(error=>{if(!cancelled){setDocument(undefined);callbacks.current.onError?.(error);}});
    return ()=>{cancelled=true;};
  },[source,initialDocument,options]);
  useEffect(()=>{if(document?.assets.modules.includes('widgets')&&root.current)mountWidgets(root.current);},[document]);
  return createElement('div',{ref:root,className,'data-xmarkdown-renderer':'native',dangerouslySetInnerHTML:{__html:document?.html||''}});
}
