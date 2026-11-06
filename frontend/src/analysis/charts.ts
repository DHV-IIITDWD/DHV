import {ChartSpec} from '../types';
import {THEME as T,font} from '../theme';
import {R,corr,boxStats,kde,jit,mean,sd,linreg} from './stats';
export {R,corr};
export const PAL=T.series;
export type Pt={name:string;x:number;y:number;hi?:boolean;z?:number};
export type Grp={name:string;v:number[];labels?:string[]};

const base=(t:string,trigger='axis',legend=false,sub?:string):any=>({color:T.series,textStyle:{fontFamily:font,color:T.text},animationDuration:300,
  title:{text:t,subtext:sub,left:0,textStyle:{fontSize:13,fontWeight:600,color:T.navy},subtextStyle:{fontSize:11,color:T.muted}},
  tooltip:{trigger,confine:true,backgroundColor:'#fff',borderColor:T.grid,textStyle:{color:T.text,fontSize:12}},
  grid:{left:12,right:28,top:(legend?64:48)+(sub?14:0),bottom:44,containLabel:true},
  toolbox:{right:8,feature:{saveAsImage:{title:'PNG',pixelRatio:2}}},
  ...(legend?{legend:{top:sub?40:26,left:0,textStyle:{fontSize:11,color:T.muted},itemWidth:14,itemHeight:8}}:{})});
const axLine={lineStyle:{color:T.muted}},split={lineStyle:{color:T.grid,type:'solid'}};
const axC=(data:any[],name:string,inverse=false,rot=0):any=>({type:'category',data,name,nameLocation:'middle',nameGap:rot?64:30,inverse,nameTextStyle:{color:T.muted,fontSize:11},
  axisLabel:{rotate:rot,hideOverlap:true,color:T.muted,fontSize:11},axisLine:axLine,axisTick:{show:false}});
const axV=(name:string,inverse=false,zero=false):any=>({type:'value',name,nameLocation:'middle',nameGap:44,inverse,scale:!zero,nameTextStyle:{color:T.muted,fontSize:11},
  axisLabel:{color:T.muted,fontSize:11},splitLine:split,axisLine:{show:false}});
const lab=(h:boolean,n:number)=>n<=15?{show:true,position:h?'right':'top',fontSize:10,color:T.navy,formatter:(p:any)=>R(+p.value)}:{show:false};

/* ---------- comparison charts ---------- */
export const bar=(t:string,labels:(string|number)[],vals:number[],xn:string,yn:string,h=false):any=>
  ({...base(t),xAxis:h?axV(xn,false,true):axC(labels,xn,false,labels.length>8?40:0),yAxis:h?{...axC(labels,yn,true),nameGap:110}:axV(yn,false,true),
   series:[{type:'bar',data:vals,barMaxWidth:28,itemStyle:{color:T.primary,borderRadius:h?[0,2,2,0]:[2,2,0,0]},label:lab(h,vals.length),emphasis:{itemStyle:{color:T.navy}}}]});
export const lollipop=(t:string,labels:(string|number)[],vals:number[],xn:string,yn:string,h=false):any=>
  ({...base(t),xAxis:h?axV(xn):axC(labels,xn,false,labels.length>8?40:0),yAxis:h?{...axC(labels,yn,true),nameGap:110}:axV(yn),
   series:[{type:'bar',data:vals,barWidth:2,silent:true,itemStyle:{color:T.light}},
     {type:'scatter',symbolSize:12,data:vals.map((v,i)=>h?[v,labels[i]]:[labels[i],v]),itemStyle:{color:T.primary},label:lab(h,vals.length),tooltip:{formatter:(p:any)=>`${h?p.value[1]:p.value[0]}: ${R(h?p.value[0]:p.value[1])}`}}]});
export const grouped=(t:string,x:(string|number)[],series:{name:string;data:number[]}[],xn:string,yn:string):any=>
  ({...base(t,'axis',true),xAxis:axC(x,xn,false,x.length>8?40:0),yAxis:axV(yn,false,true),series:series.map((s,i)=>({type:'bar',name:s.name,data:s.data,barMaxWidth:22,itemStyle:{color:T.series[i%T.series.length],borderColor:T.dark,borderWidth:.5}}))});
export const line=(t:string,x:(string|number)[],series:{name:string;data:number[]}[],xn:string,yn:string,inv=false,area=false,stacked=false):any=>
  ({...base(t,'axis',series.length>1),xAxis:{...axC(x,xn),boundaryGap:!area},yAxis:axV(yn,inv,area),
   series:series.map((s,i)=>({type:'line',name:s.name,data:s.data,symbol:T.symbols[i%8],symbolSize:7,lineStyle:{width:2,type:T.dashes[i%8],color:T.series[i%T.series.length]},itemStyle:{color:T.series[i%T.series.length]},
     ...(area?{areaStyle:{opacity:stacked?.55:.2},...(stacked?{stack:'a'}:{})}:{})}))});
export const stack=(t:string,x:string[],series:{name:string;data:number[]}[],xn:string,yn:string):any=>
  ({...base(t,'axis',true),xAxis:axC(x,xn),yAxis:axV(yn,false,true),series:series.map((s,i)=>({type:'bar',stack:'a',name:s.name,data:s.data,itemStyle:{color:[T.primary,T.light,T.navy][i%3],borderColor:'#fff',borderWidth:.5}}))});
export const pie=(t:string,d:{name:string;value:number}[],donut=true):any=>({...base(t,'item',true),series:[{type:'pie',radius:donut?['40%','68%']:'68%',top:30,data:d,
  label:{formatter:'{b}: {c} ({d}%)',fontSize:11,color:T.text},itemStyle:{borderColor:'#fff',borderWidth:2}}]});
export function slope(t:string,x:[string|number,string|number],items:{name:string;a:number;b:number}[],yn:string,inverse=false):any{
  return {...base(t),xAxis:{...axC(x as any,''),boundaryGap:['25%','25%']},yAxis:axV(yn,inverse),grid:{left:12,right:12,top:44,bottom:30,containLabel:true},
   series:items.map((s,i)=>({type:'line',name:s.name,symbolSize:7,lineStyle:{width:2,color:T.series[i%T.series.length],type:T.dashes[i%8]},itemStyle:{color:T.series[i%T.series.length]},
     data:[{value:s.a,label:{show:true,position:'left',formatter:s.name,fontSize:10,color:T.navy}},{value:s.b,label:{show:true,position:'right',formatter:s.name,fontSize:10,color:T.navy}}]}))};}
export function dumbbell(t:string,names:string[],a:number[],b:number[],xn:string,la:string,lb:string):any{
  const d=names.map((n,i)=>[a[i],b[i],i]);
  return {...base(t,'item',true),xAxis:axV(xn,true),yAxis:{...axC(names,'',true),nameGap:110},legend:{top:26,left:0,data:[la,lb]},
   series:[{type:'custom',name:'link',tooltip:{show:false},data:d,encode:{x:[0,1],y:2},
     renderItem:(_:any,api:any)=>{const p=api.coord([api.value(0),api.value(2)]),q=api.coord([api.value(1),api.value(2)]);return {type:'line',shape:{x1:p[0],y1:p[1],x2:q[0],y2:q[1]},style:{stroke:T.light,lineWidth:2}}}},
    {type:'scatter',name:la,data:names.map((n,i)=>[a[i],n]),symbolSize:10,symbol:'circle',itemStyle:{color:T.light,borderColor:T.dark,borderWidth:1}},
    {type:'scatter',name:lb,data:names.map((n,i)=>[b[i],n]),symbolSize:11,symbol:'diamond',itemStyle:{color:T.navy}}]};}

/* ---------- distributions ---------- */
export function hist(t:string,v:number[],xn:string){
  if(!v.length)return bar(t,[],[],xn,'Institutions');
  const lo=Math.min(...v),hi=Math.max(...v),k=Math.min(12,Math.max(4,Math.ceil(Math.sqrt(v.length)))),w=(hi-lo)/k||1,c=Array(k).fill(0);
  v.forEach(x=>c[Math.min(k-1,Math.floor((x-lo)/w))]++);
  return bar(t,c.map((_,i)=>`${R(lo+i*w)}–${R(lo+(i+1)*w)}`),c,xn,'Institutions');}
export function density(t:string,groups:Grp[],xn:string):any{
  const ok=groups.filter(g=>g.v.length>=5);
  return {...base(t,'axis',ok.length>1,'Gaussian KDE, drawn only between each group’s min and max'),xAxis:{...axV(xn),nameGap:30},yAxis:axV('Density',false,true),
   series:ok.map((g,i)=>{const k=kde(g.v);return {type:'line',name:`${g.name} (n=${g.v.length})`,showSymbol:false,smooth:true,data:k.ys.map((y,j)=>[R(y),k.ds[j]]),
     lineStyle:{width:2,color:T.series[i%8],type:T.dashes[i%8]},areaStyle:{opacity:.15,color:T.series[i%8]}}})};}
export type DistMode='box'|'violin'|'strip'|'jitter'|'sina'|'errorbar';
export const DIST_MODES:{id:DistMode;label:string}[]=[{id:'box',label:'Box'},{id:'violin',label:'Violin'},{id:'strip',label:'Strip'},{id:'jitter',label:'Jittered strip'},{id:'sina',label:'Sina'},{id:'errorbar',label:'Mean ± SD'}];
/** One entry point for the six "many distributions" views from the course (box, violin, strip, jittered strip, sina, error bars). */
export function dist(t:string,groups:Grp[],yn:string,xn:string,mode:DistMode):any{
  const gs=groups.filter(g=>g.v.length>0),names=gs.map(g=>`${g.name}\n(n=${g.v.length})`),MIN_KDE=5;
  const sub={box:'Box = Q1–Q3, line = median, whiskers = last point within 1.5×IQR, dots = outliers',violin:'Width = estimated density within each group’s range; groups with n<5 show raw points only',
    strip:'Every dot is one institution (no jitter: dots at equal values overlap)',jitter:'Every dot is one institution; horizontal offset is only to reduce overlap',
    sina:'Dots spread horizontally in proportion to local density, inside the violin outline',errorbar:'Point = mean, bar = ± 1 sample standard deviation (n≥2)'}[mode];
  const pts=(fn:(g:Grp,i:number,j:number)=>number,sym=5,op=.65,color=T.primary)=>({type:'scatter',name:'Institutions',symbolSize:sym,itemStyle:{color,opacity:op,borderColor:'#fff',borderWidth:.3},
    data:gs.flatMap((g,i)=>g.v.map((y,j)=>({value:[i+fn(g,i,j),y],name:g.labels?.[j]??''}))),tooltip:{formatter:(p:any)=>`${p.name||'Value'}<br/>${yn}: ${R(p.value[1])}`}});
  const kd=gs.map(g=>g.v.length>=MIN_KDE&&sd(g.v)>0?kde(g.v):null);
  const violin=(fill:string,op:number)=>({type:'custom',name:'Density',z:1,silent:true,tooltip:{show:false},data:gs.map((g,i)=>[i,Math.min(...g.v),Math.max(...g.v)]),encode:{x:0,y:[1,2]},
    renderItem:(p:any,api:any)=>{const i=p.dataIndex,k=kd[i];if(!k)return;const half=api.size([1,0])[0]*.42,mx=Math.max(...k.ds),c=k.ys.map(y=>api.coord([i,y]));
      const pts2=[...c.map((q:number[],j:number)=>[q[0]+half*k.ds[j]/mx,q[1]]),...c.map((q:number[],j:number)=>[q[0]-half*k.ds[j]/mx,q[1]]).reverse()];
      return {type:'polygon',shape:{points:pts2},style:{fill,opacity:op,stroke:T.primary,lineWidth:1}}}});
  const sparse=(op=.8)=>({...pts(()=>0,6,op),data:gs.flatMap((g,i)=>kd[i]?[]:g.v.map((y,j)=>({value:[i+jit(g.labels?.[j]??`${g.name}${j}`)*.3,y],name:g.labels?.[j]??''})))});
  let series:any[]=[];
  if(mode==='box'){const b=gs.map(g=>boxStats(g.v));
    series=[{type:'boxplot',name:'Distribution',data:b.map(s=>[s.min,s.q1,s.med,s.q3,s.max]),itemStyle:{color:T.pale,borderColor:T.primary,borderWidth:1.5},boxWidth:['30%','50%'],
      tooltip:{formatter:(p:any)=>{const v=p.value;return `${gs[p.dataIndex].name}<br/>n=${gs[p.dataIndex].v.length}<br/>Max (whisker): ${R(v[5])}<br/>Q3: ${R(v[4])}<br/>Median: ${R(v[3])}<br/>Q1: ${R(v[2])}<br/>Min (whisker): ${R(v[1])}`}}},
     {type:'scatter',name:'Outliers',symbol:'diamond',symbolSize:8,itemStyle:{color:T.navy},data:b.flatMap((s,i)=>s.out.map(y=>({value:[i,y],name:gs[i].labels?.[gs[i].v.indexOf(y)]??''}))),
      tooltip:{formatter:(p:any)=>`${p.name||'Outlier'}<br/>${yn}: ${R(p.value[1])} (outlier)`}}];}
  else if(mode==='violin')series=[violin(T.pale,.9),sparse()];
  else if(mode==='strip')series=[pts(()=>0,6,.6)];
  else if(mode==='jitter')series=[pts((g,i,j)=>jit(g.labels?.[j]??`${g.name}${j}`)*.5,5,.65)];
  else if(mode==='sina')series=[violin(T.veryLight,.9),pts((g,i,j)=>{const k=kd[i];if(!k)return jit(`${g.name}${j}`)*.3;return jit(g.labels?.[j]??`${g.name}${j}`)*2*.42*k.at(g.v[j])/Math.max(...k.ds)},5,.7)];
  else{const st=gs.map(g=>({m:mean(g.v),s:sd(g.v)}));
    series=[{type:'custom',name:'± SD',data:st.map((s,i)=>[i,s.m-(s.s||0),s.m+(s.s||0)]),encode:{x:0,y:[1,2]},tooltip:{show:false},silent:true,
      renderItem:(_:any,api:any)=>{const i=api.value(0),lo=api.coord([i,api.value(1)]),hi=api.coord([i,api.value(2)]),w=api.size([1,0])[0]*.12;
        return {type:'group',children:[{type:'line',shape:{x1:lo[0],y1:lo[1],x2:hi[0],y2:hi[1]},style:{stroke:T.dark,lineWidth:1.5}},
          {type:'line',shape:{x1:lo[0]-w,y1:lo[1],x2:lo[0]+w,y2:lo[1]},style:{stroke:T.dark,lineWidth:1.5}},{type:'line',shape:{x1:hi[0]-w,y1:hi[1],x2:hi[0]+w,y2:hi[1]},style:{stroke:T.dark,lineWidth:1.5}}]}}},
     {type:'scatter',name:'Mean',symbolSize:11,symbol:'diamond',itemStyle:{color:T.primary},data:st.map((s,i)=>[i,s.m]),tooltip:{formatter:(p:any)=>`${gs[p.dataIndex].name}<br/>Mean: ${R(p.value[1])}<br/>SD: ${R(st[p.dataIndex].s)}`}}];}
  return {...base(t,'item',false,sub),xAxis:axC(names,xn,false,gs.length>8?40:0),yAxis:axV(yn),series};}

/* ---------- relationships ---------- */
export function scatter(t:string,pts:Pt[],xn:string,yn:string,trend=true,sub?:string):any{
  const mk=(p:Pt[])=>p.map(a=>({value:[a.x,a.y],name:a.name}));
  const series:any[]=[{type:'scatter',name:'Institutions',data:mk(pts.filter(p=>!p.hi)),symbolSize:8,itemStyle:{color:T.primary,opacity:.5,borderColor:T.dark,borderWidth:.4}}];
  if(pts.some(p=>p.hi))series.push({type:'scatter',name:'Flagged',symbol:'diamond',data:mk(pts.filter(p=>p.hi)),symbolSize:12,itemStyle:{color:T.navy,borderColor:'#fff',borderWidth:1}});
  if(trend&&pts.length>2){const f=linreg(pts.map(p=>p.x),pts.map(p=>p.y)),xs=pts.map(p=>p.x),lo=Math.min(...xs),hi=Math.max(...xs);
    series.push({type:'line',name:'Linear trend',data:[[lo,f.a+f.b*lo],[hi,f.a+f.b*hi]],showSymbol:false,lineStyle:{type:'dashed',color:T.dark,width:1.8},tooltip:{show:false}});}
  return {...base(t,'item',series.length>1,sub),tooltip:{trigger:'item',confine:true,formatter:(p:any)=>p.name?`${p.name}<br/>${xn}: ${R(p.value[0])}<br/>${yn}: ${R(p.value[1])}`:''},xAxis:axV(xn),yAxis:axV(yn),series};}
export function scatterG(t:string,groups:{name:string;pts:Pt[]}[],xn:string,yn:string,sub?:string):any{
  return {...base(t,'item',true,sub),tooltip:{trigger:'item',confine:true,formatter:(p:any)=>`${p.name}<br/>${p.seriesName}<br/>${xn}: ${R(p.value[0])}<br/>${yn}: ${R(p.value[1])}`},xAxis:axV(xn),yAxis:axV(yn),
   series:groups.map((g,i)=>({type:'scatter',name:g.name,symbol:T.symbols[i%8],symbolSize:8,itemStyle:{color:T.series[i%8],opacity:.55,borderColor:T.dark,borderWidth:.4},data:g.pts.map(a=>({value:[a.x,a.y],name:a.name}))}))};}
/** Bubble: third variable is encoded by BOTH size and blue shade, and always printed in the tooltip (size alone is hard to read). */
export function bubble(t:string,pts:Pt[],xn:string,yn:string,zn:string):any{
  const z=pts.map(p=>p.z!).filter(Number.isFinite),lo=Math.min(...z),hi=Math.max(...z);
  return {...base(t,'item',false,`Bubble size and shade = ${zn} (exact value in tooltip)`),grid:{left:12,right:90,top:62,bottom:44,containLabel:true},
   tooltip:{trigger:'item',confine:true,formatter:(p:any)=>`${p.name}<br/>${xn}: ${R(p.value[0])}<br/>${yn}: ${R(p.value[1])}<br/>${zn}: ${R(p.value[2])}`},xAxis:axV(xn),yAxis:axV(yn),
   visualMap:{dimension:2,min:lo,max:hi,right:0,top:'middle',text:[`${zn} high`,'low'],calculable:true,inRange:{color:[T.pale,T.primary,T.navy],symbolSize:[8,34]},textStyle:{color:T.muted,fontSize:10}},
   series:[{type:'scatter',data:pts.filter(p=>Number.isFinite(p.z)).map(p=>({value:[p.x,p.y,p.z],name:p.name})),itemStyle:{opacity:.7,borderColor:T.dark,borderWidth:.5}}]};}
export function heat(t:string,xs:(string|number)[],ys:(string|number)[],cells:[number,number,number][],xn:string,yn:string,o:{min?:number;max?:number;dec?:number;sub?:string;label?:boolean;unit?:string}={}):any{
  const v=cells.map(c=>c[2]).filter(Number.isFinite),min=o.min??Math.min(...v),max=o.max??Math.max(...v),dec=o.dec??0;
  return {...base(t,'item',false,o.sub),grid:{left:12,right:76,top:o.sub?62:48,bottom:50,containLabel:true},
   tooltip:{trigger:'item',confine:true,formatter:(p:any)=>`${yn}: ${ys[p.value[1]]}<br/>${xn}: ${xs[p.value[0]]}<br/><b>${Number.isFinite(p.value[2])?R(p.value[2],dec)+(o.unit??''):'no data'}</b>`},
   xAxis:{...axC(xs as any[],xn,false,xs.length>10?40:0),splitArea:{show:true}},yAxis:{...axC(ys as any[],yn,true),nameGap:90,splitArea:{show:true}},
   visualMap:{min,max,calculable:false,right:0,top:'middle',itemHeight:140,inRange:{color:T.ramp},textStyle:{color:T.muted,fontSize:10}},
   series:[{type:'heatmap',data:cells.map(c=>Number.isFinite(c[2])?c:[c[0],c[1],'-']),label:{show:o.label??cells.length<=120,fontSize:10,formatter:(p:any)=>Number.isFinite(+p.value[2])?R(+p.value[2],dec):'',color:T.text},itemStyle:{borderColor:'#fff',borderWidth:1}}]};}
export function corrHeat(t:string,names:string[],m:number[][]):any{
  const cells:[number,number,number][]=[];names.forEach((_,i)=>names.forEach((__,j)=>cells.push([j,i,m[i][j]])));
  const o=heat(t,names,names,cells,'','',{min:-1,max:1,dec:2,label:true,sub:'Pearson r (−1…+1). Darker blue = stronger positive; palest = negative. Values printed in every cell.'});
  o.visualMap.inRange.color=[T.pale,T.veryLight,T.light,T.primary,T.navy];o.yAxis.nameGap=30;return o;}
export function radar(t:string,ind:{name:string;max:number}[],series:{name:string;value:number[]}[]):any{
  return {...base(t,'item',true),radar:{indicator:ind,center:['50%','58%'],radius:'62%',axisName:{color:T.navy,fontSize:11},splitLine:{lineStyle:{color:T.grid}},splitArea:{areaStyle:{color:['#fff',T.veryLight]}}},
   series:[{type:'radar',data:series.map((s,i)=>({name:s.name,value:s.value,symbol:T.symbols[i%8],symbolSize:6,lineStyle:{width:2,type:T.dashes[i%8],color:T.series[i%8]},itemStyle:{color:T.series[i%8]},areaStyle:{opacity:.06,color:T.series[i%8]}}))}]};}
export function parallel(t:string,dims:{name:string;max?:number}[],items:{name:string;vals:number[]}[]):any{
  return {...base(t,'item',false,'Each line is one institution; hover a line for its name'),grid:{left:20,right:40,top:70,bottom:30},parallelAxis:dims.map((d,i)=>({dim:i,name:d.name,max:d.max,nameTextStyle:{color:T.navy},axisLine:axLine,axisLabel:{color:T.muted,fontSize:10}})),
   parallel:{left:30,right:50,top:70,bottom:30},series:items.map((it,i)=>({type:'parallel',name:it.name,lineStyle:{width:2,color:T.series[i%8],type:T.dashes[i%8]},data:[{value:it.vals,name:it.name}],emphasis:{lineStyle:{width:4}}}))};}
export function sankey(t:string,nodes:string[],links:{source:string;target:string;value:number}[]):any{
  return {...base(t,'item',false,'Flow width = number of institutions ranked in both years'),series:[{type:'sankey',top:56,bottom:10,left:10,right:110,nodeGap:10,data:nodes.map(n=>({name:n})),links,
   lineStyle:{color:'gradient',opacity:.35},itemStyle:{color:T.primary,borderColor:T.dark},label:{color:T.navy,fontSize:11},emphasis:{focus:'adjacency'}}]};}
export function specToOption(s:ChartSpec):any{
<<<<<<< HEAD
  if(s.type==='pie'&&s.pie)return pie(s.title,s.pie,false);
  if(s.type==='scatter'&&s.points)return scatter(s.title,s.points,s.xLabel,s.yLabel);
  if(s.type==='heatmap'&&s.heat)return heat(s.title,s.heat.xs,s.heat.ys,s.heat.cells,'','',{dec:2,label:true});
  if(s.type==='box'&&s.box)return {...base(s.title,'item',false),xAxis:axC(s.x,s.xLabel,false,s.x.length>8?40:0),yAxis:axV(s.yLabel),series:[{type:'boxplot',data:s.box,itemStyle:{color:T.pale,borderColor:T.primary}}]};
  if(s.type==='area')return line(s.title,s.x,s.series,s.xLabel,s.yLabel,false,true);
  return s.type==='bar'||s.type==='histogram'?{...base(s.title,'axis',s.series.length>1),xAxis:axC(s.x,s.xLabel,false,s.x.length>8?40:0),yAxis:axV(s.yLabel,false,true),
=======
  return s.type==='bar'?{...base(s.title,'axis',s.series.length>1),xAxis:axC(s.x,s.xLabel,false,s.x.length>8?40:0),yAxis:axV(s.yLabel,false,true),
>>>>>>> 56e088a4e38f53be52a4a2e05c20d359a98eac80
    series:s.series.map((a,i)=>({type:'bar',name:a.name,data:a.data,itemStyle:{color:T.series[i%8]}}))}
   :line(s.title,s.x,s.series,s.xLabel,s.yLabel);}
