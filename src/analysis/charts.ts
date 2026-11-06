import {ChartSpec} from '../types';
export const R=(x:number)=>Math.round(x*100)/100;
export const PAL=['#0f766e','#b45309','#475569','#be123c','#4338ca','#65a30d'];
const base=(t:string,trigger='axis',legend=false):any=>({color:PAL,textStyle:{fontFamily:'inherit'},
  title:{text:t,left:0,textStyle:{fontSize:13,fontWeight:600,color:'#1c1c1a'}},tooltip:{trigger},
  grid:{left:12,right:24,top:legend?64:48,bottom:44,containLabel:true},toolbox:{right:8,feature:{saveAsImage:{title:'PNG'}}},
  ...(legend?{legend:{top:26,left:0}}:{})});
const axC=(data:any[],name:string,inverse=false,rot=0):any=>({type:'category',data,name,nameLocation:'middle',nameGap:rot?64:30,inverse,axisLabel:{rotate:rot,hideOverlap:true}});
const axV=(name:string,inverse=false):any=>({type:'value',name,nameLocation:'middle',nameGap:44,inverse,scale:true});
export const bar=(t:string,labels:(string|number)[],vals:number[],xn:string,yn:string,h=false):any=>
  ({...base(t),xAxis:h?axV(xn):axC(labels,xn,false,labels.length>8?40:0),yAxis:h?{...axC(labels,yn,true),nameGap:110}:axV(yn),series:[{type:'bar',data:vals,barMaxWidth:28}]});
export const line=(t:string,x:(string|number)[],series:{name:string;data:number[]}[],xn:string,yn:string,inv=false):any=>
  ({...base(t,'axis',series.length>1),xAxis:axC(x,xn),yAxis:axV(yn,inv),series:series.map(s=>({type:'line',name:s.name,data:s.data,symbolSize:6}))});
export const stack=(t:string,x:string[],series:{name:string;data:number[]}[],xn:string,yn:string):any=>
  ({...base(t,'axis',true),xAxis:axC(x,xn),yAxis:axV(yn),series:series.map(s=>({type:'bar',stack:'a',name:s.name,data:s.data}))});
export const pie=(t:string,d:{name:string;value:number}[]):any=>({...base(t,'item',true),series:[{type:'pie',radius:['40%','68%'],top:30,data:d,label:{formatter:'{b}: {d}%'}}]});
export function corr(a:number[],b:number[]){const n=a.length;if(n<3)return NaN;const ma=a.reduce((s,x)=>s+x,0)/n,mb=b.reduce((s,x)=>s+x,0)/n;
  let sab=0,sa=0,sb=0;for(let i=0;i<n;i++){sab+=(a[i]-ma)*(b[i]-mb);sa+=(a[i]-ma)**2;sb+=(b[i]-mb)**2;}return sab/Math.sqrt(sa*sb);}
export function hist(t:string,v:number[],xn:string){
  if(!v.length)return bar(t,[],[],xn,'Institutions');
  const lo=Math.min(...v),hi=Math.max(...v),k=Math.min(12,Math.max(4,Math.ceil(Math.sqrt(v.length)))),w=(hi-lo)/k||1,c=Array(k).fill(0);
  v.forEach(x=>c[Math.min(k-1,Math.floor((x-lo)/w))]++);
  return bar(t,c.map((_,i)=>`${R(lo+i*w)}–${R(lo+(i+1)*w)}`),c,xn,'Institutions');}
export type Pt={name:string;x:number;y:number;hi?:boolean};
export function scatter(t:string,pts:Pt[],xn:string,yn:string,trend=true):any{
  const mk=(p:Pt[])=>p.map(a=>({value:[a.x,a.y],name:a.name}));
  const series:any[]=[{type:'scatter',name:'Institutions',data:mk(pts.filter(p=>!p.hi)),symbolSize:8,itemStyle:{opacity:.7}}];
  if(pts.some(p=>p.hi))series.push({type:'scatter',name:'Outliers',data:mk(pts.filter(p=>p.hi)),symbolSize:11,itemStyle:{color:'#be123c'}});
  if(trend&&pts.length>2){const n=pts.length,mx=pts.reduce((s,p)=>s+p.x,0)/n,my=pts.reduce((s,p)=>s+p.y,0)/n;
    const b=pts.reduce((s,p)=>s+(p.x-mx)*(p.y-my),0)/(pts.reduce((s,p)=>s+(p.x-mx)**2,0)||1),a=my-b*mx,xs=pts.map(p=>p.x),lo=Math.min(...xs),hi=Math.max(...xs);
    series.push({type:'line',name:'Trend line',data:[[lo,a+b*lo],[hi,a+b*hi]],showSymbol:false,lineStyle:{type:'dashed',color:'#1c1c1a',width:1.5},tooltip:{show:false}});}
  return {...base(t,'item',series.length>1),tooltip:{trigger:'item',formatter:(p:any)=>p.name?`${p.name}<br/>${xn}: ${R(p.value[0])}<br/>${yn}: ${R(p.value[1])}`:''},xAxis:axV(xn),yAxis:axV(yn),series};}
export function specToOption(s:ChartSpec):any{
  return s.type==='bar'?{...base(s.title,'axis',s.series.length>1),xAxis:axC(s.x,s.xLabel,false,s.x.length>8?40:0),yAxis:axV(s.yLabel),series:s.series.map(a=>({type:'bar',name:a.name,data:a.data}))}
   :line(s.title,s.x,s.series,s.xLabel,s.yLabel);}
