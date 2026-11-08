// Small expression interpreter shared by validation and browser widgets. No eval.
const functions = Object.freeze({
  min: (...x) => Math.min(...x), max: (...x) => Math.max(...x), abs: Math.abs,
  round: Math.round, floor: Math.floor, ceil: Math.ceil,
  clamp: (x, lo, hi) => Math.min(hi, Math.max(lo, x)),
});
const arities = {min:[1,16],max:[1,16],abs:[1,1],round:[1,1],floor:[1,1],ceil:[1,1],clamp:[3,3]};
const precedence = {'||':1,'&&':2,'==':3,'!=':3,'<':4,'<=':4,'>':4,'>=':4,'+':5,'-':5,'*':6,'/':6,'%':6};
export function compileExpression(source, names) {
  if (typeof source !== 'string' || !source.trim() || source.length>2048) throw new Error('Expression must contain 1–2048 characters');
  const tokens=[];
  const pattern=/\s+|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[A-Za-z][A-Za-z0-9_]*|"(?:[^"\\]|\\["\\nrt])*"|'(?:[^'\\]|\\['\\nrt])*'|<=|>=|==|!=|&&|\|\||[()+*/%?:,!<>-]/gy;
  for(let at=0;at<source.length;) {
    pattern.lastIndex=at; const match=pattern.exec(source);
    if(!match) throw new Error('Unsupported expression character at '+at);
    at=pattern.lastIndex; if(!/^\s+$/.test(match[0])) tokens.push(match[0]);
    if(tokens.length>256) throw new Error('Expression exceeds 256 tokens');
  }
  let cursor=0, nodes=0;
  const take=()=>tokens[cursor++];
  const expect=t=>{if(take()!==t) throw new Error('Expected '+t+' in expression');};
  function parse(minimum=0,depth=0) {
    if(depth>32 || ++nodes>256) throw new Error('Expression is too complex');
    const t=take(); let left;
    if(t==='(') {left=parse(0,depth+1);expect(')');}
    else if(['+','-','!'].includes(t)) left=['unary',t,parse(7,depth+1)];
    else if(t && /^[\d.]/.test(t)) {const n=Number(t); if(!Number.isFinite(n)||Math.abs(n)>1e12) throw new Error('Expression number is out of range');left=['literal',n];}
    else if(t?.startsWith('"') || t?.startsWith("'")) left=['literal',t.slice(1,-1).replace(/\\(["'\\nrt])/g,(_,c)=>({n:'\n',r:'\r',t:'\t'}[c]??c))];
    else if(t==='true'||t==='false') left=['literal',t==='true'];
    else if(t && tokens[cursor]==='(' && Object.hasOwn(functions,t)) {
      take();const args=[];
      if(tokens[cursor]!==')') {do {args.push(parse(0,depth+1));if(tokens[cursor]!==',')break;take();}while(true);}
      expect(')');const [lo,hi]=arities[t];if(args.length<lo||args.length>hi)throw new Error('Invalid argument count for '+t);
      left=['call',t,args];
    } else if(names.has(t)) left=['variable',t];
    else throw new Error('Unknown expression name: '+t);
    while(Object.hasOwn(precedence,tokens[cursor]) && precedence[tokens[cursor]]>=minimum) {
      const op=take();left=['binary',op,left,parse(precedence[op]+1,depth+1)];
    }
    if(minimum===0 && tokens[cursor]==='?') {take();const yes=parse(0,depth+1);expect(':');left=['conditional',left,yes,parse(0,depth+1)];}
    return left;
  }
  const ast=parse();if(cursor!==tokens.length)throw new Error('Unexpected expression token: '+tokens[cursor]);return ast;
}
export function evaluateExpression(ast, values) {
  function run(node,depth=0) {
    if(depth>64)throw new Error('Expression nesting limit exceeded');
    const [kind,op,a,b]=node;
    if(kind==='literal')return op;
    if(kind==='variable')return values[op];
    if(kind==='conditional')return run(op,depth+1)?run(a,depth+1):run(b,depth+1);
    if(kind==='unary'){const x=run(a,depth+1);return op==='!'?!x:op==='-'?-Number(x):Number(x);}
    if(kind==='call')return functions[op](...a.map(x=>Number(run(x,depth+1))));
    const x=run(a,depth+1);
    if(op==='&&')return x&&run(b,depth+1);if(op==='||')return x||run(b,depth+1);
    const y=run(b,depth+1);
    switch(op){case '+':return typeof x==='string'||typeof y==='string'?String(x)+String(y):x+y;
      case '-':return x-y;case '*':return x*y;case '/':return x/y;case '%':return x%y;
      case '<':return x<y;case '<=':return x<=y;case '>':return x>y;case '>=':return x>=y;
      case '==':return x===y;case '!=':return x!==y;default:throw new Error('Unsupported expression operator');}
  }
  const result=run(ast);
  if(typeof result==='number'&&(!Number.isFinite(result)||Math.abs(result)>1e12))throw new Error('Expression result is out of range');
  if(String(result).length>2048)throw new Error('Expression result is too long');return result;
}
