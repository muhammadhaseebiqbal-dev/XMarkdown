import { documentStyle } from './content.js';
import { widgetStyles } from '../src/widgets.js';
export function documentPrefix(nonce,interactive=false){
  const policy=`default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}' 'strict-dynamic'; connect-src 'none'; base-uri 'none'; form-action 'none'`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${policy}"><title>XMarkdown document</title><style nonce="${nonce}">${documentStyle}${interactive?widgetStyles:''}</style></head><body>`;
}
export function documentFrame(document,nonce){
  const interactive=document.assets?.modules.includes('widgets');
  return documentPrefix(nonce,interactive)+document.html+(interactive?`<script nonce="${nonce}" type="module" src="/assets/browser/widgets.js"></script>`:'')+'</body></html>';
}
