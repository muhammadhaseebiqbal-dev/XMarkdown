// Larger fixtures exercise the same public parser as every other example.
const block=(kind,spec)=>'```'+kind+'\n'+JSON.stringify(spec)+'\n```\n';
const text=(x,y,label,size=15,fill='#e0e8df',extra={})=>['text',{x,y,'font-size':size,fill,'font-family':'sans-serif',...extra},label];
const card=(x,y,label,detail,accent='#d8ee91')=>['g',{},['use',{href:'#service',x,y,width:184,height:88}],['circle',{cx:x+17,cy:y+24,r:3,fill:accent}],text(x+28,y+29,label,15),text(x+16,y+56,detail,10,'#a1b39d')];
const path=(d,dash=false)=>['path',{d,fill:'none',stroke:dash?'#70877a':'#c8df8c','stroke-width':2,'marker-end':'url(#arrow)',...(dash?{'stroke-dasharray':'5 6'}:{})}];
export const architectureScene={title:'A production document platform',description:'A layered system with edge validation, orchestration, cache and queues, durable storage, and a separate observability path. Reusable symbols, gradients, clipping, masking, patterns, and curved connectors form the artwork.',viewBox:[0,0,1000,720],children:[
  ['defs',{},
    ['linearGradient',{id:'background',x1:'0%',y1:'0%',x2:'100%',y2:'100%'},['stop',{offset:'0%','stop-color':'#18251e'}],['stop',{offset:'100%','stop-color':'#0e151a'}]],
    ['radialGradient',{id:'glow',cx:'80%',cy:'15%',r:'70%'},['stop',{offset:'0%','stop-color':'#456044','stop-opacity':.5}],['stop',{offset:'100%','stop-color':'#18251e','stop-opacity':0}]],
    ['linearGradient',{id:'fade'},['stop',{offset:'0%','stop-color':'white','stop-opacity':0}],['stop',{offset:'100%','stop-color':'white'}]],
    ['mask',{id:'light'},['rect',{width:1000,height:720,fill:'url(#fade)'}]],
    ['clipPath',{id:'frame'},['rect',{width:1000,height:720,rx:22}]],
    ['pattern',{id:'grid',width:24,height:24,patternUnits:'userSpaceOnUse'},['path',{d:'M24 0H0V24',fill:'none',stroke:'#6b826d','stroke-width':.4,opacity:.25}]],
    ['symbol',{id:'service',viewBox:'0 0 184 88'},['rect',{x:1,y:1,width:182,height:86,rx:12,fill:'#202e26',stroke:'#60735c'}],['path',{d:'M16 70H168',stroke:'#425541','stroke-width':1}]],
    ['symbol',{id:'storage',viewBox:'0 0 48 48'},['path',{d:'M6 10C6 2 42 2 42 10V36C42 44 6 44 6 36Z',fill:'#3d5540',stroke:'#bdd689'}],['ellipse',{cx:24,cy:10,rx:18,ry:6,fill:'#536d48',stroke:'#bdd689'}],['path',{d:'M6 23C6 31 42 31 42 23',fill:'none',stroke:'#bdd689'}]],
    ['marker',{id:'arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto'},['path',{d:'M0 0L10 5L0 10Z',fill:'#c8df8c'}]],
  ],
  ['g',{'clip-path':'url(#frame)'},
    ['rect',{width:1000,height:720,fill:'url(#background)'}],['rect',{width:1000,height:720,fill:'url(#grid)'}],['rect',{width:1000,height:720,fill:'url(#glow)',mask:'url(#light)'}],
    text(34,39,'SYSTEM BLUEPRINT / 001',11,'#bdd689',{'font-weight':'bold'}),text(34,82,'A production document platform',31,'#f0f2e5',{'font-weight':'bold'}),text(34,111,'One checked document, from generation to delivery. Dashed paths carry telemetry.',13,'#afbea6'),
    ['rect',{x:28,y:144,width:944,height:180,rx:16,fill:'#1a281f',stroke:'#3c5140','fill-opacity':.7}],text(44,168,'01 / REQUEST & ORCHESTRATION',10,'#a6be89'),
    ['rect',{x:266,y:340,width:706,height:142,rx:16,fill:'#18252a',stroke:'#354e51','fill-opacity':.7}],text(284,365,'02 / FAST PATH & ASYNC WORK',10,'#99bac3'),
    ['rect',{x:28,y:500,width:944,height:136,rx:16,fill:'#24271d',stroke:'#50543a','fill-opacity':.7}],text(44,525,'03 / DURABLE STATE',10,'#c4c795'),
    path('M236 238H283'),path('M470 238H517'),path('M704 238H751'),
    path('M378 282V365'),path('M610 282V365'),path('M844 282V365',true),
    path('M378 456C378 505 168 490 168 546'),path('M610 456V546'),path('M844 456V546',true),
    path('M610 365C610 320 844 328 844 282'),
    card(52,194,'Client / AI output','Streaming document source'),card(286,194,'Edge gateway','Auth · input budget · routing'),card(520,194,'Parser + validator','Markdown · schemas · limits'),card(754,194,'Trusted renderer','HTML · SVG · MathML'),
    card(286,370,'Geometry cache','Bounded reuse · unique IDs','#91c9d5'),card(520,370,'Job queue','Export / batch processing','#91c9d5'),card(754,370,'Observability','Latency · diagnostics · usage','#91c9d5'),
    ['use',{href:'#storage',x:75,y:552,width:48,height:48}],text(137,572,'Document store',15),text(137,593,'Versioned source + metadata',10,'#b1bba1'),
    ['use',{href:'#storage',x:510,y:552,width:48,height:48}],text(572,572,'Object storage',15),text(572,593,'Validated exports',10,'#b1bba1'),
    ['use',{href:'#storage',x:748,y:552,width:48,height:48}],text(810,572,'Metrics',15),text(810,593,'No document text',10,'#b1bba1'),
    ['circle',{cx:45,cy:675,r:5,fill:'#d8ee91'}],text(61,679,'STATIC SCENE PROFILE',10,'#d8ee91'),text(350,679,'Symbols · patterns · masks · gradients · paths · clipping',11,'#a9b8a2'),
  ],
]};
export const capacityPlanner={type:'controls',title:'Capacity planning lab',description:'Model peak traffic, service time, instance count, reserved headroom, and a cache strategy. Outputs depend on earlier calculated values; the chart elsewhere in the report is a separate static trace.',inputs:[
  {id:'traffic',label:'Peak requests / second',type:'range',min:50,max:2500,step:50,value:800},
  {id:'latency',label:'Service time (ms)',type:'number',min:1,max:1000,value:40},
  {id:'instances',label:'Worker instances',type:'number',min:1,max:64,value:8},
  {id:'headroom',label:'Reserve 20% headroom',type:'toggle',value:true},
  {id:'hit',label:'Cache hit strategy',type:'select',value:.6,options:[{label:'No cache',value:0},{label:'Moderate / 60%',value:.6},{label:'Strong / 90%',value:.9}]},
],outputs:[
  {id:'effective',label:'Requests reaching workers',expr:'round(traffic * (1-hit))',unit:'req/s'},
  {id:'throughput',label:'Available worker capacity',expr:'round(instances * 1000 / latency * (headroom ? 0.8 : 1))',unit:'req/s'},
  {id:'utilization',label:'Capacity utilization',expr:'round(effective / throughput * 100)',unit:'%'},
  {id:'backlog',label:'Queue growth',expr:'max(0, effective-throughput)',unit:'req/s'},
  {id:'needed',label:'Recommended minimum workers',expr:'max(1, ceil(effective * latency / (1000 * (headroom ? 0.8 : 1))))'},
  {id:'decision',label:'Operating status',expr:"utilization > 100 ? 'Over capacity: scale or reduce service time' : (utilization > 80 ? 'Near the limit: keep watching' : 'Within the modeled capacity')"},
]};
export const releaseGraph={title:'Release readiness: parallel gates and feedback',description:'Build fans out to security, correctness, and distribution checks. Staging combines those paths before a canary and release. Rollback feeds back to the fix cycle. This uses the basic graph layout, so it does not promise exact crossing-free routes.',direction:'TD',nodes:[
  ['change','Change proposal'],['review','Review'],['build','Build'],['unit','Unit tests'],['fuzz','Fuzz fixtures'],['audit','Dependency audit'],['package','Package smoke test'],['docs','Docs build'],['integration','Integration'],['staging','Staging'],['browser','Browser checks'],['perf','Workload checks'],['canary','Canary'],['observe','Observe'],['release','Release'],['rollback','Rollback'],['fix','Fix cycle'],['announce','Release notes'],
].map(([id,label])=>({id,label})),edges:[['change','review'],['review','build'],['build','unit'],['build','fuzz'],['build','audit'],['build','package'],['build','docs'],['unit','integration'],['fuzz','integration'],['audit','staging'],['package','staging'],['docs','staging'],['integration','staging'],['staging','browser'],['staging','perf'],['browser','canary'],['perf','canary'],['canary','observe'],['observe','release'],['observe','rollback'],['rollback','fix'],['fix','review'],['release','announce']]};
const trace={type:'line',title:'Twenty-four hours of request traffic',description:'Synthetic hourly requests per second for a workload narrative. This chart does not update from the capacity controls.',x:'hour',y:'requests',data:[80,72,63,59,70,114,220,410,560,690,750,820,790,740,770,890,1030,1190,1040,810,640,430,260,150].map((requests,hour)=>({hour:String(hour).padStart(2,'0'),requests}))};
const equations=String.raw`# Modeling latency and capacity

An explanatory document can mix prose, a derivation, matrices, and piecewise equations.

## Queueing model

For an M/M/1 queue with $\lambda < \mu$:

$$
\begin{aligned}
\rho &= \frac{\lambda}{\mu} \\
L &= \frac{\rho}{1-\rho} \\
W &= \frac{1}{\mu-\lambda} \\
W_q &= \frac{\rho}{\mu-\lambda}
\end{aligned}
$$

## A transition matrix

$$
P=\begin{bmatrix}
0.85 & 0.10 & 0.05 \\
0.15 & 0.75 & 0.10 \\
0.05 & 0.20 & 0.75
\end{bmatrix},\qquad \pi P=\pi,\quad \sum_i \pi_i=1
$$

## A bounded decision rule

$$
f(\rho)=\begin{cases}
\text{normal}, & 0\leq\rho<0.8 \\
\text{near capacity}, & 0.8\leq\rho<1 \\
\text{unstable model}, & \rho\geq 1
\end{cases}
$$

:::warning[Model assumptions]
These equations assume the stated queue model. Real worker concurrency, caching, retry bursts, and scheduling need separate measurement.
:::
`;
export const showcaseCases=[
  {id:'14-architecture',level:'Difficult',title:'Layered platform architecture',x:block('x-svg',architectureScene),assessment:'A larger original SVG scene: three layers, seven service cards, three storage endpoints, branching connectors, reusable symbols, pattern grid, gradients, a mask, and clipping. It is rendered by the same validated XMarkdown SVG processor.'},
  {id:'15-planner',level:'Difficult',title:'Multi-input capacity planning',x:block('x-widget',capacityPlanner),assessment:'Five input types/settings and six dependent outputs exercise arithmetic, conditionals, rounding, caching assumptions, headroom, and recommendations. This is a simplified numerical model, not a real infrastructure sizing guarantee.'},
  {id:'16-release',level:'Difficult',title:'Release gates and rollback loop',x:block('x-diagram',releaseGraph),assessment:'Eighteen nodes, parallel gates, converging dependencies, and a rollback cycle exercise the graph processor. Placement is basic; complex routing can have crossings and should not be mistaken for a full graph-layout engine.'},
  {id:'17-equations',level:'Difficult',title:'Derivations, matrices, piecewise math',x:equations,assessment:'Aligned derivations, a transition matrix, and a piecewise rule compile through the shared bounded TeX adapter into MathML. The equations are explanatory model assumptions.'},
  {id:'18-report',level:'Difficult',title:'Complete operations report',x:'# Operations review / November\n\nA complete document combining structured prose, a 24-hour trace, an interactive capacity model, release gates, and vector architecture.\n\n| Area | Finding | Next step |\n|---|---|---|\n| Traffic | Evening peak dominates | Reserve capacity |\n| Delivery | Parallel checks converge in staging | Verify canary gates |\n| Rendering | One parser handles all document blocks | Inspect diagnostics |\n\n:::note[Reading the report]\nThe trace is synthetic and static. The capacity controls calculate independently; no chart-data binding is claimed.\n:::\n\n## Traffic over a full day\n\n'+block('x-chart',trace)+'\n## Model the peak\n\n'+block('x-widget',capacityPlanner)+'\n## Release dependencies\n\n'+block('x-diagram',releaseGraph)+'\n## System blueprint\n\n'+block('x-svg',architectureScene),assessment:'This end-to-end document exercises tables, callouts, a 24-point line chart, five-input/six-output controls, an eighteen-node cyclic graph, and a layered SVG scene. All blocks use the actual public renderer; no hand-authored replacement preview is used.'},
];
