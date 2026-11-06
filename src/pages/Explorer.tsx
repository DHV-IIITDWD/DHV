import {useMemo,useState} from 'react';
import ChartRenderer from '../components/ChartRenderer';
import {Card} from '../components/ui';
import {useStore} from '../store';
import {yrs} from '../analysis/questions';
import * as C from '../analysis/charts';
import {Field,Row} from '../types';
const AGG:Record<string,(a:number[])=>number>={mean:a=>a.reduce((s,x)=>s+x,0)/a.length,median:a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor((s.length-1)/2)]/2+s[Math.ceil((s.length-1)/2)]/2},max:a=>Math.max(...a),min:a=>Math.min(...a),count:a=>a.length};
export default function Explorer(){
  const {rows,report}=useStore(),ys=yrs(rows),cats=[...new Set(rows.map(r=>r.category))].sort(),states=[...new Set(rows.map(r=>r.state))].sort();
  const metrics=(['score','rank','TLR','RPC','GO','OI','PR'] as Field[]).filter(f=>report?.avail.includes(f)||f==='rank');
  const [f,setF]=useState({metric:'score',agg:'mean',group:'year',chart:'auto',y1:ys[0],y2:ys.at(-1)!,state:'All',cat:'All',maxRank:1000,x:'RPC',y:'score'});
  const u=(k:string,v:any)=>setF(o=>({...o,[k]:v}));
  const out=useMemo(()=>{
    const d=rows.filter(r=>r.year>=f.y1&&r.year<=f.y2&&r.rank<=f.maxRank&&(f.state==='All'||r.state===f.state)&&(f.cat==='All'||r.category===f.cat));
    const val=(r:Row,k:string)=>r[k as Field] as unknown as number;
    if(f.chart==='scatter'){const p=d.filter(r=>Number.isFinite(val(r,f.x))&&Number.isFinite(val(r,f.y)));const c=C.corr(p.map(r=>val(r,f.x)),p.map(r=>val(r,f.y)));
      return {option:C.scatter(`${f.x} vs ${f.y} (r = ${C.R(c)})`,p.map(r=>({name:`${r.name} (${r.year})`,x:val(r,f.x),y:val(r,f.y)})),f.x,f.y),note:`Pearson r = ${C.R(c)} over ${p.length} records.`,table:undefined};}
    const m=new Map<string|number,number[]>();d.forEach(r=>{const v=val(r,f.metric);if(Number.isFinite(v)||f.agg==='count')m.set(r[f.group as 'year'],[...(m.get(r[f.group as 'year'])||[]),v])});
    const t=[...m].map(([g,a])=>({[f.group]:g,[`${f.agg}_${f.metric}`]:C.R(AGG[f.agg](a)),n:a.length})).sort((a,b)=>f.group==='year'?+a[f.group]-+b[f.group]:(b[`${f.agg}_${f.metric}`] as number)-(a[`${f.agg}_${f.metric}`] as number));
    const lab=t.map(x=>x[f.group] as string),vals=t.map(x=>x[`${f.agg}_${f.metric}`] as number),title=`${f.agg} of ${f.metric} by ${f.group}`;
    const line=f.chart==='line'||(f.chart==='auto'&&f.group==='year');
    return {option:line?C.line(title,lab,[{name:title,data:vals}],f.group,`${f.agg} ${f.metric}`,f.metric==='rank'):C.bar(title,lab,vals,f.group,`${f.agg} ${f.metric}`),table:t,
      note:t.length?`${d.length} records matched. Highest: ${lab[vals.indexOf(Math.max(...vals))]} (${Math.max(...vals)}); lowest: ${lab[vals.indexOf(Math.min(...vals))]} (${Math.min(...vals)}).`:'No records match these filters.'};
  },[rows,f]);
  const S=(k:string,opts:(string|number)[],label:string)=><label className="text-xs text-stone-500 block">{label}<select className="inp w-full mt-1 text-ink" value={(f as any)[k]} onChange={e=>u(k,['y1','y2','maxRank'].includes(k)?+e.target.value:e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select></label>;
  return <div className="space-y-4 max-w-[1400px]"><Card title="Query builder"><div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
    {S('y1',ys,'From year')}{S('y2',ys,'To year')}{S('cat',['All',...cats],'Category')}{S('state',['All',...states],'State')}{S('maxRank',[10,25,50,100,200,1000],'Rank ≤')}{S('chart',['auto','bar','line','scatter'],'Chart')}
    {f.chart==='scatter'?<>{S('x',metrics,'X variable')}{S('y',metrics,'Y variable')}</>:<>{S('metric',metrics,'Metric')}{S('agg',Object.keys(AGG),'Aggregation')}{S('group',['year','category','state','name'],'Group by')}</>}</div></Card>
    <Card><ChartRenderer option={out.option} table={out.table} height={400} file="query"/><p className="text-sm mt-3 border-l-2 border-accent pl-3">{out.note}</p></Card></div>;}
