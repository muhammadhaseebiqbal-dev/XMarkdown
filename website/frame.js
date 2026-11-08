import { graphicStyles, widgetStyles } from '../src/index.js';
import { createDocumentFrame } from '../src/browser/frame.js';
export const previewStyle = `:root{color-scheme:dark}*{box-sizing:border-box}body{font:15px/1.65 system-ui,sans-serif;color:#d7dcdf;background:#13171b;margin:0;padding:28px}h1,h2,h3{line-height:1.25;color:#f0f0e9}h1{font-size:27px}h2{font-size:22px}a{color:#d8ee91}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#1b2025;border-radius:8px;padding:16px}code{font-size:.9em}table{border-collapse:collapse;width:100%}td,th{border:1px solid #384148;padding:10px;text-align:left}${graphicStyles}${widgetStyles}.x-graphic{background:#191f24;border-color:#394249}.x-graphic:not(.x-scene):not(.x-drawing) svg text{fill:#d1dadf}.x-grid{stroke:#333e45}.x-axis,.x-edge{stroke:#819198}.x-bar,.x-arrow{fill:#b8d86f}.x-line{stroke:#b8d86f}.x-node{fill:#26312c;stroke:#849e65}.x-description{color:#a8b5bc}.x-callout{background:#1e2924;border-color:#b8d86f}.x-callout-warning{background:#302919;border-color:#e7bb65}.x-inputs input,.x-inputs select{color:#e7eae5;background:#222a30;padding:8px;border:1px solid #4b5b62;border-radius:5px;accent-color:#c8e58c}.x-draw-actions button{background:#26322c;color:#e8efd9;border-color:#5b7051}.x-draw-actions [role=status]{color:#adbbb0}.x-drawing svg{background:#eef2e7;border-color:#60705d}.x-error{color:#f2aaaa}math{font-size:1.15em}@media(max-width:480px){body{padding:18px}.x-inputs label{min-width:120px}}`;
export function frame(result, nonce, runtimeCode) {
  const html = createDocumentFrame(result,{nonce});
  if (!runtimeCode || !result.assets.modules.includes('widgets')) return html;
  const script = runtimeCode.replace(/<\/script/gi,'<\\/script');
  return html.replace(/<script[^>]+src="\/assets\/browser\/widgets\.js"><\/script>/,
    () => `<script nonce="${nonce}" type="module">${script}</script>`);
}
