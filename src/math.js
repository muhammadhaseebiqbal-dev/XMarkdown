export function compileMath(source,display,limits,adapters){
  if(source.length>limits.maxMathCodeUnits)throw new Error('Equation exceeds source limit');
  const katex=adapters.math();
  return katex.renderToString(source,{displayMode:display,output:'mathml',throwOnError:true,trust:false,strict:'error',maxExpand:256,maxSize:20});
}
export function configureMath(md,compile){
  md.inline.ruler.before('escape','x_math',(state,silent)=>{
    const start=state.pos;if(state.src[start]!=='$'||state.src[start+1]==='$'||/\s/.test(state.src[start+1]||' '))return false;
    let end=state.src.indexOf('$',start+1);
    while(end!==-1&&end-start<=4096&&state.src[end-1]==='\\')end=state.src.indexOf('$',end+1);
    if(end<0||end-start>4096||/\s/.test(state.src[end-1])||/\d/.test(state.src[end+1]||'')||state.src.slice(start,end).includes('\n'))return false;
    if(!silent){const token=state.push('x_math_inline','math',0);token.content=state.src.slice(start+1,end);try{token.meta={html:compile(token.content,false)};}catch(error){token.meta={error:error.message,offset:start};state.env.pendingMathErrors=true;}}
    state.pos=end+1;return true;
  });
  md.block.ruler.before('fence','x_math_block',(state,start,end,silent)=>{
    if(state.sCount[start]-state.blkIndent>=4)return false;
    if(state.src.charCodeAt(state.bMarks[start]+state.tShift[start])!==36)return false;
    const first=state.src.slice(state.bMarks[start]+state.tShift[start],state.eMarks[start]);if(first.trim()!=='$$')return false;
    let close=start+1;
    for(;close<end&&close-start<=256;close++){if(state.bMarks[close]-state.bMarks[start]>4096)return false;const line=state.src.slice(state.bMarks[close]+state.tShift[close],state.eMarks[close]);if(line.trim()==='$$')break;}
    if(close>=end||close-start>256)return false;if(silent)return true;
    const token=state.push('x_math_block','math',0);token.map=[start,close+1];token.content=state.getLines(start+1,close,state.blkIndent,false);
    try{token.meta={html:compile(token.content,true)};}catch(error){token.meta={error:error.message};state.env.diagnostics.push({code:'INVALID_MATH',line:(state.env.lineOffset||0)+start+1,message:error.message});}
    state.line=close+1;return true;
  });
  const escaped=s=>md.utils.escapeHtml(s);
  md.renderer.rules.x_math_inline=(tokens,i)=>tokens[i].meta.html||'<code class="x-error">'+escaped('$'+tokens[i].content+'$')+'</code>';
  md.renderer.rules.x_math_block=(tokens,i)=>tokens[i].meta.html?tokens[i].meta.html+'\n':'<pre class="x-error">'+escaped(tokens[i].content)+'</pre>\n';
  md.core.ruler.after('inline','x_math_diagnostics',state=>{
    if(!state.env.pendingMathErrors)return;delete state.env.pendingMathErrors;
    for(const block of state.tokens){if(block.type!=='inline'||!block.map)continue;const visit=children=>{for(const token of children||[]){if(token.type==='x_math_inline'&&token.meta.error){const line=(state.env.lineOffset||0)+block.map[0]+1+(block.content.slice(0,token.meta.offset).match(/\n/g)||[]).length;state.env.diagnostics.push({code:'INVALID_MATH',line,message:token.meta.error});}if(token.children)visit(token.children);}};visit(block.children);}
  });
}
