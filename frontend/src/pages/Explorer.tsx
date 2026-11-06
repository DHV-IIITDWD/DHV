import {useMemo,useState} from 'react';
import {AlertTriangle,Download} from 'lucide-react';
import ChartRenderer,{download,toCSV} from '../components/ChartRenderer';
import {Card} from '../components/ui';
import {useStore} from '../store';
import {yrs} from '../analysis/questions';
import * as C from '../analysis/charts';
import {mean,median,corr,fin} from '../analysis/stats';
import {Field,Row} from '../types';
const AGG:Record<string,(a:number[])=>number>={mean,median,max:a=>Math.max(...a),min:a=>Math.min(...a),count:a=>a.length};
const CHARTS=[['auto','Auto'],['bar','Bar'],['lollipop','Lollipop'],['line','Line'],['area','Area'],['donut','Pie / Donut'],['hist','Histogram'],['box','Box plot'],['violin','Violin'],['strip','Strip'],['jitter','Jittered strip'],['sina','Sina'],['errorbar','Mean ± SD'],['heatmap','Heatmap'],['scatter','Scatter'],['bubble','Bubble']] as const;
type Ch=typeof CHARTS[number][0];const DIST=['box','violin','strip','jitter','sina','errorbar'];
export default function Explorer(){
  const {rows,report}=useStore(),ys=yrs(rows),cats=[...new Set(rows.map(r=>r.category))].sort(),states=[...new Set(rows.map(r=>r.state))].sort();
  const metrics=(['score','rank','TLR','RPC','GO','OI','PR'] as Field[]).filter(f=>report?.avail.includes(f)||f==='rank');
  const [f,setF]=useState({metric:'score',agg:'mean',group:'year',chart:'auto' as Ch,y1:ys[0],y2:ys.at(-1)!,state:'All',cat:'All',maxRank:1000,x:'TLR',y:'RPC',z:'score',color:'none',topN:15});
  const u=(k:string,v:any)=>setF(o=>({...o,[k]:v}));
  const d=useMemo(()=>rows.filter(r=>r.year>=f.y1&&r.year<=f.y2&&r.rank<=f.maxRank&&(f.state==='All'||r.state===f.state)&&(f.cat==='All'||r.category===f.cat)),[rows,f.y1,f.y2,f.maxRank,f.state,f.cat]);
  const val=(r:Row,k:string)=>r[k as Field] as unknown as number,gk=(r:Row)=>String(r[f.group as 'year']);
  const ch=f.chart==='auto'?(f.group==='year'?'line':'bar'):f.chart;
  const err=((): string|null=>{
    if(!d.length)return 'No records match these filters.';
    if(ch==='scatter'||ch==='bubble'){if(f.x===f.y)return 'X and Y must be different variables.';if(ch==='bubble'&&(f.z===f.x||f.z===f.y))return 'The bubble variable must differ from X and Y.';return null}
    if((ch==='line'||ch==='area')&&f.group!=='year')return 'Line and area charts need "Group by = year" because they show change over time.';
    if(ch==='area'&&f.agg==='min')return 'Area charts shade from zero, so use mean, median, max or count.';
    if(ch==='donut'&&f.agg!=='count')return 'Pie/donut shows shares of a whole, so use Aggregation = count.';
    if(ch==='hist'&&f.metric==='rank')return 'Rank is unique per institution, so its histogram is flat. Choose a score or parameter.';
    if(ch==='heatmap'&&f.group==='year')return 'Heatmap puts the group on rows and year on columns. Choose another "Group by".';
    if(DIST.includes(ch)&&f.group==='name')return 'Distribution plots need several observations per group; grouping by institution gives one to nine points each. Group by year, category or state.';
    return null})();
  const out=useMemo(()=>{
    if(err)return null;
    if(ch==='scatter'||ch==='bubble'){
      const p=d.filter(r=>Number.isFinite(val(r,f.x))&&Number.isFinite(val(r,f.y))&&(ch==='scatter'||Number.isFinite(val(r,f.z)))),c=corr(p.map(r=>val(r,f.x)),p.map(r=>val(r,f.y)));
      if(p.length<3)return {err:'Fewer than 3 records have both variables.'};
      const pt=(r:Row)=>({name:`${r.name} (${r.year})`,x:val(r,f.x),y:val(r,f.y),z:val(r,f.z)}),sub=`n = ${p.length}; Pearson r = ${C.R(c)}. Association is not causation.`;
      const tbl=p.slice(0,2000).map(r=>({institution:r.name,year:r.year,category:r.category,state:r.state,[f.x]:val(r,f.x),[f.y]:val(r,f.y)}));
      if(ch==='bubble')return {option:C.bubble(`${f.x} vs ${f.y} (size = ${f.z})`,p.map(pt),f.x,f.y,f.z),note:sub,table:tbl};
      if(f.color!=='none'){const g=new Map<string,Row[]>();p.forEach(r=>g.set(String(r[f.color as 'year']),[...(g.get(String(r[f.color as 'year']))||[]),r]));
        const top=[...g].sort((a,b)=>b[1].length-a[1].length).slice(0,8);return {option:C.scatterG(`${f.x} vs ${f.y} by ${f.color}`,top.map(([name,a])=>({name,pts:a.map(pt)})),f.x,f.y,sub),note:sub+(g.size>8?' Only the 8 largest groups are drawn.':''),table:tbl}}
      return {option:C.scatter(`${f.x} vs ${f.y} (r = ${C.R(c)})`,p.map(pt),f.x,f.y,true,sub),note:sub,table:tbl}}
    if(ch==='hist'){const v=fin(d.map(r=>val(r,f.metric)));return {option:C.hist(`Distribution of ${f.metric}`,v,f.metric),note:`${v.length} records.`}}
    if(DIST.includes(ch)){const m=new Map<string,Row[]>();d.forEach(r=>{if(Number.isFinite(val(r,f.metric)))m.set(gk(r),[...(m.get(gk(r))||[]),r])});
      let g=[...m];g=f.group==='year'?g.sort((a,b)=>+a[0]-+b[0]):g.sort((a,b)=>b[1].length-a[1].length).slice(0,f.topN);
      return {option:C.dist(`${f.metric} by ${f.group}`,g.map(([n,a])=>({name:n,v:a.map(r=>val(r,f.metric)),labels:a.map(r=>`${r.name} (${r.year})`)})),f.metric,f.group,ch as C.DistMode),
        note:`${g.length} group(s); n is shown under each label. ${f.group!=='year'&&m.size>f.topN?`Showing the ${f.topN} largest of ${m.size} groups.`:''}`}}
    if(ch==='heatmap'){const xs=yrs(d),m=new Map<string,Map<number,number[]>>();d.forEach(r=>{const v=val(r,f.metric);if(!Number.isFinite(v)&&f.agg!=='count')return;const g=gk(r);if(!m.has(g))m.set(g,new Map());m.get(g)!.set(r.year,[...(m.get(g)!.get(r.year)||[]),v])});
      const gs=[...m].sort((a,b)=>[...b[1].values()].flat().length-[...a[1].values()].flat().length).slice(0,f.topN).map(a=>a[0]),cells:[number,number,number][]=[];
      gs.forEach((g,i)=>xs.forEach((y,j)=>{const a=m.get(g)?.get(y);cells.push([j,i,a?.length?AGG[f.agg](a):NaN])}));
      return {option:C.heat(`${f.agg} of ${f.metric}: ${f.group} × year`,xs,gs,cells,'Year',f.group,{dec:f.agg==='count'?0:1,sub:'Empty cell = no matching records (not zero)'}),note:`Top ${gs.length} groups by record count.`}}
    const m=new Map<string,number[]>();d.forEach(r=>{const v=val(r,f.metric);if(Number.isFinite(v)||f.agg==='count')m.set(gk(r),[...(m.get(gk(r))||[]),v])});
    const key=`${f.agg}_${f.metric}`;let t=[...m].map(([g,a])=>({[f.group]:g,[key]:C.R(AGG[f.agg](a)),n:a.length}));
    t=f.group==='year'?t.sort((a,b)=>+a[f.group]-+b[f.group]):t.sort((a,b)=>(b[key] as number)-(a[key] as number)).slice(0,ch==='donut'?12:f.group==='name'?f.topN:t.length);
    const lab=t.map(x=>x[f.group] as string),vals=t.map(x=>x[key] as number),title=`${f.agg} of ${f.metric} by ${f.group}`,xn=f.group,yn=`${f.agg} ${f.metric}`;
    const option=ch==='line'?C.line(title,lab,[{name:title,data:vals}],xn,yn,f.metric==='rank'):ch==='area'?C.line(title,lab,[{name:title,data:vals}],xn,yn,f.metric==='rank',true):ch==='donut'?C.pie(title,t.map(x=>({name:String(x[f.group]),value:x[key] as number}))):ch==='lollipop'?C.lollipop(title,lab,vals,xn,yn,lab.length>8):C.bar(title,lab,vals,xn,yn);
    return {option,table:t,note:t.length?`${d.length} records matched. Highest: ${lab[vals.indexOf(Math.max(...vals))]} (${Math.max(...vals)}); lowest: ${lab[vals.indexOf(Math.min(...vals))]} (${Math.min(...vals)}).${f.metric==='rank'?' Lower rank = better.':''}`:'No groups.'};
  },[d,ch,f,err]);
  const S=(k:string,opts:(string|number)[],label:string,names?:Record<string,string>)=><label className="text-xs text-stone-500 block">{label}<select className="inp w-full mt-1 text-ink" value={(f as any)[k]} onChange={e=>u(k,['y1','y2','maxRank','topN'].includes(k)?+e.target.value:e.target.value)}>{opts.map(o=><option key={o} value={o}>{names?.[o]??o}</option>)}</select></label>;
  const two=ch==='scatter'||ch==='bubble';
  return <div className="space-y-4 max-w-[1500px]"><Card title="Chart builder" right={<button className="btn-sm" disabled={!d.length} onClick={()=>download('filtered_data.csv',toCSV(d as any))}><Download size={12}/>Filtered data CSV</button>}>
    <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
    {S('y1',ys,'From year')}{S('y2',ys,'To year')}{S('cat',['All',...cats],'Category')}{S('state',['All',...states],'State')}{S('maxRank',[10,25,50,100,200,1000],'Rank ≤')}{S('chart',CHARTS.map(c=>c[0]),'Chart type',Object.fromEntries(CHARTS))}
    {two?<>{S('x',metrics,'X variable')}{S('y',metrics,'Y variable')}{ch==='bubble'?S('z',metrics,'Bubble variable'):S('color',['none','category','state','year'],'Colour by')}</>
     :ch==='hist'?S('metric',metrics,'Variable'):<>{S('metric',metrics,'Metric')}{!DIST.includes(ch)&&ch!=='heatmap'||ch==='heatmap'?S('agg',Object.keys(AGG),'Aggregation'):null}{S('group',['year','category','state','name'],'Group by')}{S('topN',[5,10,15,20,30],'Max groups')}</>}</div></Card>
    <Card>{err?<p className="text-sm flex items-start gap-2 text-amber-800 py-4"><AlertTriangle size={16} className="mt-0.5 shrink-0"/>{err}</p>
     :out&&'err' in out&&out.err?<p className="text-sm text-amber-800 py-4">{out.err}</p>
     :out&&'option' in out&&<><ChartRenderer option={out.option} table={'table' in out?out.table:undefined} height={420} file="chart-explorer"/><p className="text-sm mt-3 border-l-2 border-accent pl-3"><span className="font-medium text-navy">Interpretation. </span>{out.note}</p></>}</Card></div>;}
