/** Trusted host wrapper around renderer output; source is parsed before this step. */
export function createDocumentFrame(document,{nonce,styleUrl='/assets/preview.css',widgetUrl='/assets/browser/widgets.js'}={}) {
  if(typeof nonce!=='string'||!/^[A-Za-z0-9+/=_-]{16,128}$/.test(nonce))throw new TypeError('Supply a generated CSP nonce.');
  for(const url of [styleUrl,widgetUrl])if(typeof url!=='string'||/["<>\s]/.test(url)||!/^(?:\/[^/]|https?:\/\/)/.test(url))throw new TypeError('Asset URLs must be trusted absolute paths or HTTP URLs.');
  const policy=`default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}' 'strict-dynamic'; connect-src 'none'; base-uri 'none'; form-action 'none'`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${policy}"><title>XMarkdown example</title><link nonce="${nonce}" rel="stylesheet" href="${styleUrl}"></head><body>${document.html||''}${document.assets.modules.includes('widgets')?`<script nonce="${nonce}" type="module" src="${widgetUrl}"></script>`:''}</body></html>`;
}
