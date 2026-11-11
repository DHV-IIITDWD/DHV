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
  return s.type==='bar'?{...base(s.title,'axis',s.series.length>1),xAxis:axC(s.x,s.xLabel,false,s.x.length>8?40:0),yAxis:axV(s.yLabel,false,true),
    series:s.series.map((a,i)=>({type:'bar',name:a.name,data:a.data,itemStyle:{color:T.series[i%8]}}))}
   :line(s.title,s.x,s.series,s.xLabel,s.yLabel);}
<<<<<<< HEAD


/* ---------- India state/UT choropleth ---------- */
// Compact labels keep every state/UT readable on the India map.
// The tooltip still displays each region's full name.
const INDIA_MAP_LABELS:Record<string,string>={
  'Andhra Pradesh':'AP','Arunachal Pradesh':'AR','Assam':'AS','Bihar':'BR',
  'Chhattisgarh':'CG','Goa':'GA','Gujarat':'GJ','Haryana':'HR',
  'Himachal Pradesh':'HP','Jharkhand':'JH','Karnataka':'KA','Kerala':'KL',
  'Madhya Pradesh':'MP','Maharashtra':'MH','Manipur':'MN','Meghalaya':'ML',
  'Mizoram':'MZ','Nagaland':'NL','Odisha':'OD','Punjab':'PB',
  'Rajasthan':'RJ','Sikkim':'SK','Tamil Nadu':'TN','Telangana':'TS',
  'Tripura':'TR','Uttar Pradesh':'UP','Uttarakhand':'UK','West Bengal':'WB',
  'Andaman and Nicobar Islands':'A&N','Chandigarh':'CH',
  'Dadra and Nagar Haveli and Daman and Diu':'DNH–DD','Delhi':'DL',
  'Jammu and Kashmir':'J&K','Ladakh':'LA','Lakshadweep':'LD','Puducherry':'PY'
};

export interface IndiaChoroplethOptions {
  metricLabel?: string;
  direction?: 'higher' | 'lower';
}

export function indiaChoropleth(
  t:string,
  data:{name:string;value:number|null}[],
  options:IndiaChoroplethOptions={}
):any{
  const metricLabel=options.metricLabel??'Top-100 institutions';
  const direction=options.direction??'higher';
  const safeData=data.map(item=>({
    name:item.name,
    value:item.value!==null&&Number.isFinite(Number(item.value))?Math.max(0,Number(item.value)):null
  }));
  const validValues=safeData.map(item=>item.value).filter((value):value is number=>value!==null&&Number.isFinite(value));
  const minValue=validValues.length?Math.min(...validValues):0;
  const maxValue=Math.max(minValue+1,...validValues);
  const span=maxValue-minValue||1;
  const countText=(value:number)=>value.toLocaleString('en-IN',{maximumFractionDigits:2});
  const palette=[
    '#ffffd9',
    '#edf8b1',
    '#c7e9b4',
    '#7fcdbb',
    '#41b6c4',
    '#2c7fb8',
    '#253494'
  ];
  const colours=direction==='lower'?[...palette].reverse():palette;
  const labelFormatter=(params:any)=>{
    const region=String(params.name??'');
    const raw=params.value;
    const hasValue=raw!==null&&raw!==undefined&&Number.isFinite(Number(raw));
    const value=hasValue?Math.max(0,Number(raw)):null;
    const regionCode=INDIA_MAP_LABELS[region]??region;
    const ratio=hasValue?(direction==='lower'?(maxValue-value!)/span:(value!-minValue)/span):0;
    const tone=hasValue&&ratio>=0.58?'light':'dark';
    return `{${tone}|${regionCode}}\n{${tone}|${hasValue?countText(value!):'—'}}`;
  };

  return {
    ...base(t,'item'),
    title:{
      text:t,
      subtext:`State/UT code · ${metricLabel}  |  Hover for full region name`,
      left:0,
      textStyle:{fontSize:13,fontWeight:600,color:'#1c1c1a'},
      subtextStyle:{fontSize:10,color:'#64748b'}
    },
    tooltip:{
      trigger:'item',
      formatter:(params:any)=>{
        const raw=params.value;
        const hasValue=raw!==null&&raw!==undefined&&Number.isFinite(Number(raw));
        return hasValue
          ?`<strong>${params.name}</strong><br/>${metricLabel}: ${countText(Number(raw))}`
          :`<strong>${params.name}</strong><br/>${metricLabel}: No data`;
      }
    },
    visualMap:{
      type:'continuous',
      min:minValue,
      max:maxValue,
      left:12,
      bottom:12,
      calculable:true,
      orient:'vertical',
      text:direction==='lower'?['Worse (higher rank number)','Better (lower rank number)']:['More','Fewer'],
      textStyle:{fontSize:10,color:'#475569'},
      precision:0,
      inRange:{color:colours},
      outOfRange:{color:'#eef2f7'}
    },
    series:[{
      name:metricLabel,
      type:'map',
      map:'india-states',
      roam:true,
      layoutCenter:['53%','51%'],
      layoutSize:'96%',
      itemStyle:{areaColor:'#eef2f7',borderColor:'#ffffff',borderWidth:1.1},
      label:{
        show:true,
        position:'inside',
        formatter:labelFormatter,
        fontSize:8,
        lineHeight:10,
        align:'center',
        verticalAlign:'middle',
        rich:{
          dark:{color:'#172554',fontSize:8,fontWeight:800,align:'center',lineHeight:10,textBorderColor:'rgba(255,255,255,0.82)',textBorderWidth:2},
          light:{color:'#ffffff',fontSize:8,fontWeight:800,align:'center',lineHeight:10,textBorderColor:'rgba(15,23,42,0.28)',textBorderWidth:1}
        }
      },
      labelLayout:{hideOverlap:false},
      emphasis:{
        label:{
          show:true,
          color:'#111827',
          fontSize:10,
          fontWeight:'bold',
          formatter:(params:any)=>{
            const raw=params.value;
            const hasValue=raw!==null&&raw!==undefined&&Number.isFinite(Number(raw));
            return hasValue?`${params.name}\n${countText(Number(raw))}`:`${params.name}\nNo data`;
          }
        },
        itemStyle:{borderColor:'#0f172a',borderWidth:1.8,shadowBlur:5,shadowColor:'rgba(15,23,42,0.22)'}
      },
      data:safeData
    }]
  };
}


/* ---------- Equivalent chart-view alternatives ---------- */
export type ChartView = { id: string; label: string; option: any };

const chartTitle = (option: any): string => String(option?.title?.text ?? 'Chart');

const cloneChartOption = (option: any): any => ({
  ...option,
  title: option?.title ? { ...option.title } : option?.title,
  legend: option?.legend ? { ...option.legend } : option?.legend,
  grid: option?.grid ? { ...option.grid } : option?.grid,
  xAxis: Array.isArray(option?.xAxis)
    ? option.xAxis.map((axis: any) => ({ ...axis }))
    : option?.xAxis ? { ...option.xAxis } : option?.xAxis,
  yAxis: Array.isArray(option?.yAxis)
    ? option.yAxis.map((axis: any) => ({ ...axis }))
    : option?.yAxis ? { ...option.yAxis } : option?.yAxis,
  series: (option?.series ?? []).map((series: any) => ({
    ...series,
    data: Array.isArray(series?.data) ? [...series.data] : series?.data,
    itemStyle: series?.itemStyle ? { ...series.itemStyle } : series?.itemStyle,
    lineStyle: series?.lineStyle ? { ...series.lineStyle } : series?.lineStyle,
    areaStyle: series?.areaStyle ? { ...series.areaStyle } : series?.areaStyle
  }))
});

const defaultChartLabel = (option: any): string => {
  const types = (option?.series ?? []).map((series: any) => series.type);
  if (types.includes('map')) return 'India choropleth map';
  if (types.includes('sankey')) return 'Sankey diagram';
  if (types.includes('radar')) return 'Radar chart';
  if (types.includes('scatter')) return types.includes('line') ? 'Scatter + trendline' : 'Scatter plot';
  if (types.includes('boxplot')) return 'Box plot';
  if (types.includes('custom')) return 'Custom distribution';
  if (types.includes('pie')) {
    const radius = option.series.find((series: any) => series.type === 'pie')?.radius;
    return Array.isArray(radius) ? 'Donut chart' : 'Pie chart';
  }
  if (types.includes('line')) return 'Line chart';
  if (types.includes('bar')) {
    if (types.length > 1 && (option.series ?? []).some((series: any) => !!series.stack)) return 'Stacked bar chart';
    return option?.xAxis?.type === 'value' && option?.yAxis?.type === 'category'
      ? 'Horizontal bar chart' : 'Column chart';
  }
  return 'Default chart';
};

/**
 * A compact signature of the actual visual encoding. Titles and tooltips are
 * deliberately ignored so the same data/encoding is not offered twice merely
 * because an alternative has a different caption. Function-valued custom
 * renderers are retained in the signature so distinct statistical views stay
 * selectable.
 */
const chartEncodingSignature = (option: any): string => {
  const axis = (value: any) => (Array.isArray(value) ? value : value ? [value] : []).map((item: any) => ({
    type: item.type,
    data: item.data,
    inverse: item.inverse,
    min: item.min,
    max: item.max
  }));
  const series = (option?.series ?? []).map((item: any) => ({
    type: item.type,
    name: item.name,
    data: item.data,
    stack: item.stack,
    radius: item.radius,
    symbol: item.symbol,
    symbolSize: item.symbolSize,
    areaStyle: item.areaStyle,
    lineStyle: item.lineStyle,
    itemStyle: item.itemStyle,
    encode: item.encode,
    renderItem: typeof item.renderItem === 'function' ? item.renderItem.toString() : item.renderItem
  }));
  return JSON.stringify({ xAxis: axis(option?.xAxis), yAxis: axis(option?.yAxis), radar: option?.radar?.indicator, series });
};

/**
 * Generate mathematically valid alternative views from an existing question result.
 * The original analysis and its underlying values are not recalculated or changed.
 */
export function chartViews(
  option: any,
  additional: { label: string; option: any }[] = []
): ChartView[] {
  if (!option?.series?.length) return [];

  const title = chartTitle(option);
  const firstType = option.series.find((series: any) => series.type)?.type;
  const result: ChartView[] = [
    { id: 'default', label: defaultChartLabel(option), option }
  ];
  const signatures = new Set([chartEncodingSignature(option)]);
  const add = (id: string, label: string, viewOption: any) => {
    const signature = chartEncodingSignature(viewOption);
    if (!result.some(view => view.id === id) && !signatures.has(signature)) {
      signatures.add(signature);
      result.push({ id, label, option: viewOption });
    }
  };

  // Explicit options are curated for the exact question. Prefer them to generic
  // transformations, and suppress the common case where the first explicit
  // option simply repeats the default chart.
  if (additional.length) {
    additional.forEach((view, index) => add(`custom-${index}`, view.label, view.option));
    return result;
  }

  // A map or Sankey has no safe generic chart-family conversion.
  if (option.series.some((series: any) => series.type === 'map' || series.type === 'sankey')) {
    return result;
  }

  if (firstType === 'line') {
    if (!/bump chart/i.test(title)) {
      const area = cloneChartOption(option);
      area.series = area.series.map((series: any) => ({
        ...series,
        type: 'line',
        areaStyle: { opacity: 0.14 },
        symbolSize: series.symbolSize ?? 5
      }));
      add('area', 'Area chart', area);

      const columns = cloneChartOption(option);
      columns.series = columns.series.map((series: any) => {
        const { areaStyle, lineStyle, symbol, symbolSize, ...rest } = series;
        return { ...rest, type: 'bar', barMaxWidth: 30 };
      });
      add('columns', 'Grouped column chart', columns);
    }
  }

  if (firstType === 'bar') {
    const isStacked = option.series.some((series: any) => !!series.stack);
    if (isStacked) {
      const grouped = cloneChartOption(option);
      grouped.series = grouped.series.map((series: any) => {
        const { stack, ...rest } = series;
        return rest;
      });
      add('grouped-bars', 'Grouped bar chart', grouped);
    }

    const isVertical = option?.xAxis?.type === 'category' && option?.yAxis?.type === 'value';
    const isHorizontal = option?.xAxis?.type === 'value' && option?.yAxis?.type === 'category';
    const categoryAxis = isVertical ? option.xAxis : isHorizontal ? option.yAxis : null;
    const labels: any[] = Array.isArray(categoryAxis?.data) ? categoryAxis.data : [];
    const numericSeries = option.series.filter((series: any) => series.type === 'bar');
    const allValues: number[] = numericSeries.flatMap((series: any) => (series.data ?? []).map((value: any) => Number(value)) as number[]);

    if ((isVertical || isHorizontal) && labels.length >= 2 && !isStacked) {
      const flipped = cloneChartOption(option);
      if (isVertical) {
        flipped.xAxis = { ...option.yAxis, inverse: false };
        flipped.yAxis = { ...option.xAxis, inverse: true };
        add('horizontal', 'Horizontal bar chart', flipped);
      } else {
        flipped.xAxis = { ...option.yAxis, inverse: false };
        flipped.yAxis = { ...option.xAxis, inverse: false };
        add('columns', 'Column chart', flipped);
      }

      const titleIsDistribution = /distribution/i.test(title);
      const looksLikeBins = labels.length > 2 && labels.every((label: any) => /[-–—]/.test(String(label)));
      if (titleIsDistribution && looksLikeBins && numericSeries.length === 1) {
        const frequency = cloneChartOption(option);
        frequency.series = numericSeries.map((series: any) => ({
          ...series,
          type: 'line',
          symbol: 'circle',
          symbolSize: 6,
          smooth: false,
          areaStyle: undefined,
          lineStyle: { width: 2 }
        }));
        add('frequency-polygon', 'Frequency polygon', frequency);
      }

      const canUsePie = labels.length >= 2 && labels.length <= 7 &&
        allValues.length > 0 && allValues.every(value => Number.isFinite(value) && value >= 0) &&
        allValues.some(value => value > 0) &&
        !/(rank|gap|correlation|variability|summary|movement|volatility|residual|quartile|score distribution)/i.test(title) &&
        !titleIsDistribution;
      if (canUsePie && numericSeries.length === 1 && numericSeries[0].data.length === labels.length) {
        const pieData = labels.map((name: any, index: number) => ({
          name: String(name),
          value: Number(numericSeries[0].data[index])
        }));
        add('donut', 'Donut chart', {
          ...base(title, 'item', true),
          legend: { top: 28, type: 'scroll' },
          series: [{
            type: 'pie',
            radius: ['42%', '68%'],
            center: ['50%', '57%'],
            avoidLabelOverlap: true,
            data: pieData,
            label: { formatter: '{b}: {c} ({d}%)' }
          }]
        });
      }
    }
  }

  if (firstType === 'pie') {
    const pieSeries = option.series.find((series: any) => series.type === 'pie');
    const data = (pieSeries?.data ?? []).filter((item: any) => item && Number.isFinite(Number(item.value)));
    if (data.length >= 2) {
      const names = data.map((item: any) => String(item.name ?? ''));
      const values = data.map((item: any) => Number(item.value));
      add('columns', 'Column chart', bar(title, names, values, 'Group', 'Institutions'));
      add('horizontal', 'Horizontal bar chart', bar(title, names, values, 'Group', 'Institutions', true));
    }
  }

  if (firstType === 'scatter') {
    const scatterSeries = option.series.filter((series: any) => series.type === 'scatter');
    const trendSeries = option.series.filter((series: any) => series.type === 'line');
    if (trendSeries.length) {
      const withoutTrend = cloneChartOption(option);
      withoutTrend.series = withoutTrend.series.filter((series: any) => series.type !== 'line');
      add('scatter-only', 'Scatter plot (no trendline)', withoutTrend);
    } else {
      const points = scatterSeries.flatMap((series: any) => (series.data ?? []).map((point: any) => {
        const value = Array.isArray(point) ? point : point?.value;
        return Array.isArray(value) && value.length >= 2
          ? [Number(value[0]), Number(value[1])] : null;
      })).filter((point: any) => point && point.every(Number.isFinite));
      if (points.length >= 3) {
        const meanX = points.reduce((sum: number, point: number[]) => sum + point[0], 0) / points.length;
        const meanY = points.reduce((sum: number, point: number[]) => sum + point[1], 0) / points.length;
        const denominator = points.reduce((sum: number, point: number[]) => sum + (point[0] - meanX) ** 2, 0);
        if (denominator > 0) {
          const slope = points.reduce((sum: number, point: number[]) => sum + (point[0] - meanX) * (point[1] - meanY), 0) / denominator;
          const intercept = meanY - slope * meanX;
          const minX = Math.min(...points.map((point: number[]) => point[0]));
          const maxX = Math.max(...points.map((point: number[]) => point[0]));
          const withTrend = cloneChartOption(option);
          withTrend.series = [
            ...withTrend.series,
            {
              type: 'line',
              name: 'Linear trendline',
              data: [[minX, intercept + slope * minX], [maxX, intercept + slope * maxX]],
              showSymbol: false,
              lineStyle: { type: 'dashed', width: 2, color: '#334155' },
              tooltip: { show: false }
            }
          ];
          add('scatter-trend', 'Scatter + trendline', withTrend);
        }
      }
    }
  }

  if (firstType === 'radar') {
    const indicators = (option.radar?.indicator ?? []).map((indicator: any) => String(indicator.name));
    const radarSeries = option.series.find((series: any) => series.type === 'radar');
    const rows = radarSeries?.data ?? [];
    if (indicators.length && rows.length) {
      const grouped = {
        ...base(title, 'axis', rows.length > 1),
        xAxis: axC(indicators, 'NIRF parameter'),
        yAxis: axV('Score'),
        series: rows.map((row: any) => ({
          type: 'bar',
          name: String(row.name ?? 'Institution'),
          data: (row.value ?? []).map(Number),
          barMaxWidth: 24
        }))
      };
      add('grouped-columns', 'Grouped column chart', grouped);
    }
  }

  return result;
}
=======
>>>>>>> origin/main
