import MarkdownIt from 'markdown-it';
import { escape } from './graphics.js';
import { blockKinds, createExtensionCache } from './extensions.js';
import { configureMath } from './math.js';
export { graphicStyles } from './graphics.js';
export { widgetStyles } from './widgets.js';

const defaults = Object.freeze({
  maxInputCodeUnits: 2 * 1024 * 1024,
  maxGraphicCodeUnits: 64 * 1024,
  maxChartRows: 256,
  maxDiagramNodes: 32,
  maxDiagramEdges: 128,
  maxTokens: 200000,
  maxOutputCodeUnits: 8 * 1024 * 1024,
  previewParseFactor: 3,
  maxMathCodeUnits:4096,
  maxSvgNodes:512,
  maxSvgDepth:16,
  maxSvgExpandedNodes:4096,
  maxSvgPathCodeUnits:65536,
  maxWidgetInputs:16,
  maxWidgetOutputs:16,
  maxDrawingPoints:8192,
  cacheEntries:128,
  maxCacheCodeUnits:512*1024,
});
const calloutStart = /^:{3}[ \t]*(note|tip|warning)(?:\[([^\]\n]{1,160})\])?[ \t]*$/;
const fenceStart = /^ {0,3}(`{3,}|~{3,})(.*)$/;

function safeLink(url) {
  const compact = url.replace(/[\u0000-\u0020\u007f]/g,'');
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(compact);
  return !scheme || /^(https?|mailto)$/i.test(scheme[1]);
}

function configure(md, limits, cache) {
  configureMath(md,(source,display)=>cache.math(source,display));
  md.validateLink = safeLink;
  md.renderer.rules.image = (tokens,i) => `<span class="x-image-alt">[Image: ${escape(md.renderer.renderInlineAsText(tokens[i].children || [],md.options,{}))}]</span>`;
  const linkOpen = md.renderer.rules.link_open;
  md.renderer.rules.link_open = (tokens,i,options,env,self) => {
    tokens[i].attrSet('rel','noopener noreferrer');
    return linkOpen ? linkOpen(tokens,i,options,env,self) : self.renderToken(tokens,i,options);
  };
  md.block.ruler.before('fence','x_callout',(state,start,end,silent) => {
    if (state.sCount[start]-state.blkIndent >= 4 || state.level >= md.options.maxNesting) return false;
    if (state.src.charCodeAt(state.bMarks[start]+state.tShift[start])!==58) return false;
    const line = state.src.slice(state.bMarks[start]+state.tShift[start],state.eMarks[start]);
    const match = calloutStart.exec(line);
    if (!match) return false;
    let depth=1, close=start+1, fence=null;
    for (; close<end; close++) {
      if (state.sCount[close] < state.blkIndent && state.eMarks[close] > state.bMarks[close]) break;
      const text = state.src.slice(state.bMarks[close]+state.tShift[close],state.eMarks[close]);
      const marker = fenceStart.exec(text);
      if (fence) {
        if (marker && marker[1][0]===fence[0] && marker[1].length>=fence.length && !marker[2].trim()) fence=null;
        continue;
      }
      if (marker) { fence=marker[1]; continue; }
      if (calloutStart.test(text)) depth++;
      if (/^:::[ \t]*$/.test(text) && !--depth) break;
    }
    if (close>=end || depth!==0) return false;
    if (silent) return true;
    const open=state.push('x_callout_open','aside',1);
    open.map=[start,close+1]; open.meta={kind:match[1],title:match[2] || match[1]};
    const parent=state.parentType, lineMax=state.lineMax;
    state.parentType='x_callout'; state.lineMax=close;
    state.md.block.tokenize(state,start+1,close);
    state.parentType=parent; state.lineMax=lineMax;
    state.push('x_callout_close','aside',-1);
    state.line=close+1;
    return true;
  },{alt:['paragraph','reference','blockquote','list']});
  md.renderer.rules.x_callout_open=(tokens,i) => `<aside class="x-callout x-callout-${tokens[i].meta.kind}"><strong class="x-callout-title">${escape(tokens[i].meta.title)}</strong>\n`;
  md.renderer.rules.x_callout_close=() => '</aside>\n';
  md.core.ruler.after('block','x_graphics',state => {
    if (!state.src.includes('```') && !state.src.includes('~~~')) return;
    let lines;
    for (const token of state.tokens) {
      if (token.type!=='fence') continue;
      const kind=token.info.trim();
      if (!blockKinds.has(kind)) continue;
      lines ||= state.src.split('\n');
      const last=lines[token.map[1]-1] || '';
      // Container prefixes are permitted; actual block boundaries come from markdown-it.
      const closing=last.replace(/^(?:[ \t]*>[ \t]?)*[ \t]*/, '').trimEnd();
      const closed=closing.length>=token.markup.length && [...closing].every(c=>c===token.markup[0]);
      try {
        if (!closed) throw new Error('Graphic fence must be closed before rendering');
        token.meta={xmarkdown:cache.validate(kind,token.content)};
      } catch (error) {
        token.meta={xmarkdownError:error.message};
        state.env.diagnostics.push({code:'INVALID_GRAPHIC',line:(state.env.lineOffset || 0)+token.map[0]+1,message:error.message});
      }
    }
  });
  const ordinaryFence=md.renderer.rules.fence;
  md.renderer.rules.fence=(tokens,i,options,env,self) => {
    const token=tokens[i];
    if (token.meta?.xmarkdown) {
      const id=`xg-${env.idPrefix || 'doc'}-${(env.graphicIndex=(env.graphicIndex || 0)+1)}`;
      return cache.render(token.meta.xmarkdown,id);
    }
    if (token.meta?.xmarkdownError) return `<pre class="x-error"><code>${escape(token.content)}</code></pre>\n`;
    return ordinaryFence(tokens,i,options,env,self);
  };
}

export function createParser(options={},adapters={}) {
  const limits=Object.freeze({...defaults,...options});
  for (const key of Object.keys(defaults)) {
    if (!Number.isSafeInteger(limits[key]) || limits[key]<(key==='cacheEntries'?0:1)) throw new RangeError(`${key} must be ${key==='cacheEntries'?'a nonnegative':'a positive'} integer`);
  }
  const md=new MarkdownIt({html:false,linkify:false,typographer:false,maxNesting:32});
  const cache=createExtensionCache(limits,adapters);
  configure(md,limits,cache);
  const parser={
    limits,
    cacheStats:()=>cache.stats(),
    clearCache:()=>cache.clear(),
    parse(source,{render=true,env={},lineOffset=0,idPrefix='doc'}={}) {
      if (typeof source!=='string') throw new TypeError('Source must be a string');
      if (source.length>limits.maxInputCodeUnits) throw new RangeError('Document exceeds the input limit');
      if (typeof idPrefix!=='string' || !/^[A-Za-z0-9_-]{1,64}$/.test(idPrefix)) throw new TypeError('Invalid graphic id prefix');
      // Caller environments are copied so diagnostics and renderer state do not leak between documents.
      const context={...env,diagnostics:[],lineOffset,idPrefix,graphicIndex:0};
      if (context.references) context.references={...context.references};
      const tokens=md.parse(source,context);
      if (tokens.length>limits.maxTokens) throw new RangeError('Document exceeds the token limit');
      const html=render ? md.renderer.render(tokens,md.options,context) : undefined;
      if (html && html.length>limits.maxOutputCodeUnits) throw new RangeError('Document exceeds the output limit');
      return {version:1,source,tokens,diagnostics:context.diagnostics,html,env:context,assets:assetsFor(tokens)};
    },
    renderTokens(tokens,env={}) {
      const html=md.renderer.render(tokens,md.options,{...env,graphicIndex:0});
      if (html.length>limits.maxOutputCodeUnits) throw new RangeError('Preview exceeds the output limit');
      return html;
    },
    stream(options={}) { return new DocumentStream(parser,options); },
  };
  return parser;
}

function assetsFor(tokens){return {modules:tokens.some(token=>token.meta?.xmarkdown?.kind==='x-widget')?['widgets']:[]};}

class DocumentStream {
  constructor(parser,{renderPreviews=true}={}) {
    this.parser=parser; this.renderPreviews=renderPreviews;
    this.chunks=[]; this.tailLines=[]; this.lineParts=[]; this.tailCodeUnits=0;
    this.totalCodeUnits=0; this.committedCodeUnits=0; this.committedLines=0;
    this.fence=null; this.calloutDepth=0; this.afterBlank=false; this.finished=false;
    this.mathBlock=false;
    this.references={}; this.revision=0;
    this.stats={previewParses:0,previewCodeUnits:0,finalCodeUnits:0,deferredPreviews:0};
  }
  write(chunk) {
    if (this.finished) throw new Error('Cannot write after finish');
    if (typeof chunk!=='string') throw new TypeError('Chunk must be a string');
    if (this.totalCodeUnits+chunk.length>this.parser.limits.maxInputCodeUnits) throw new RangeError('Document exceeds the input limit');
    if (!chunk.length) return {updates:[],pendingCodeUnits:this.totalCodeUnits-this.committedCodeUnits};
    this.chunks.push(chunk); this.totalCodeUnits+=chunk.length;
    const updates=[];
    let start=0, end;
    while ((end=chunk.indexOf('\n',start))!==-1) {
      this.lineParts.push(chunk.slice(start,end+1));
      const line=this.lineParts.join(''); this.lineParts=[];
      this.tailLines.push(line); this.tailCodeUnits+=line.length;
      this.observe(line,updates); start=end+1;
    }
    if (start<chunk.length) this.lineParts.push(chunk.slice(start));
    return {updates,pendingCodeUnits:this.totalCodeUnits-this.committedCodeUnits};
  }
  observe(line,updates) {
    const text=line.replace(/\r?\n$/,''), marker=fenceStart.exec(text);
    const mathDelimiter=/^ {0,3}\$\$[ \t]*$/.test(text);
    let closed=false;
    if(this.mathBlock){if(!mathDelimiter)return;this.mathBlock=false;closed=true;}
    else if (this.fence) {
      if (marker && marker[1][0]===this.fence[0] && marker[1].length>=this.fence.length && !marker[2].trim()) {
        this.fence=null; closed=true;
      } else return;
    } else if (marker) { this.fence=marker[1]; return; }
    else if(mathDelimiter){this.mathBlock=true;return;}
    else if (calloutStart.test(text.trimStart())) { this.calloutDepth++; return; }
    else if (this.calloutDepth && /^ {0,3}:::[ \t]*$/.test(text)) { this.calloutDepth--; closed=this.calloutDepth===0; }
    if (this.calloutDepth) return;
    const blank=!text.trim();
    // Flush at paragraph ends, not again at the first line of the next paragraph.
    // Closed root fences/callouts can be emitted immediately as complete blocks.
    if (closed || (blank && !this.afterBlank)) this.flush(updates,closed);
    this.afterBlank=blank || closed;
  }
  flush(updates,closed=false) {
    // Bound submitted preview input to 3N by default. Long ambiguous lists/containers
    // defer previews instead of repeatedly parsing a growing document without limit.
    if (this.stats.previewCodeUnits+this.tailCodeUnits>this.parser.limits.previewParseFactor*this.totalCodeUnits) {
      this.stats.deferredPreviews++; return;
    }
    const source=this.tailLines.join('');
    if (!source.trim()) return;
    const document=this.parser.parse(source,{render:false,env:{references:this.references},lineOffset:this.committedLines,idPrefix:`p${this.revision}`});
    this.stats.previewParses++; this.stats.previewCodeUnits+=source.length;
    let last=-1;
    for (let i=0;i<document.tokens.length;i++) if (document.tokens[i].level===0 && document.tokens[i].map) last=i;
    if (last<0) return;
    const root=document.tokens[last];
    const completeRoot=closed && ['fence','x_callout_open','x_math_block'].includes(root.type) && root.map[1]===this.tailLines.length;
    const cutoff=completeRoot ? this.tailLines.length : root.map[0];
    if (!cutoff) return;
    const prefix=this.tailLines.slice(0,cutoff).join('');
    const tokens=completeRoot ? document.tokens : document.tokens.slice(0,last);
    const diagnostics=document.diagnostics.filter(d=>d.line<=this.committedLines+cutoff);
    updates.push({start:this.committedCodeUnits,end:this.committedCodeUnits+prefix.length,startLine:this.committedLines+1,
      tokens,diagnostics,html:this.renderPreviews ? this.parser.renderTokens(tokens,document.env) : undefined,assets:assetsFor(tokens),provisional:true});
    this.references=document.env.references || {};
    this.tailLines=this.tailLines.slice(cutoff); this.tailCodeUnits-=prefix.length;
    this.committedCodeUnits+=prefix.length; this.committedLines+=cutoff; this.revision++;
  }
  finish({render=true}={}) {
    if (this.finished) throw new Error('Stream has already finished');
    this.finished=true;
    const source=this.chunks.join('');
    // One final complete parse preserves document-wide reference links and exact
    // Markdown semantics. Preview patches are explicitly provisional.
    const document=this.parser.parse(source,{render});
    this.stats.finalCodeUnits=source.length;
    this.chunks=[]; this.tailLines=[]; this.lineParts=[];
    return {document,stats:{...this.stats,totalCodeUnits:source.length,submittedCodeUnits:this.stats.previewCodeUnits+source.length},replacePreview:true};
  }
}
