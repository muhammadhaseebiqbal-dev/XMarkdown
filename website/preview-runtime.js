import { mountWidgets } from '../src/browser/widgets.js';

// This host-owned runtime is bundled into isolated previews. No module request
// leaves the opaque sandbox, and document source never supplies this code.
const content = document.getElementById('x-preview-document');
if (content && window.parent !== window) {
  window.addEventListener('message', event => {
    const message = event.data;
    if (event.source !== window.parent || event.origin !== location.origin ||
        message?.type !== 'xmarkdown:render') return;
    if (typeof message.id !== 'string' || typeof message.html !== 'string' ||
        message.html.length > 524288 || !Array.isArray(message.modules)) return;
    try {
      content.innerHTML = message.html;
      if (message.modules.includes('widgets')) mountWidgets(content);
      window.parent.postMessage({type:'xmarkdown:rendered',id:message.id},event.origin);
    } catch {
      window.parent.postMessage({type:'xmarkdown:error',id:message.id},event.origin);
    }
  });
}
