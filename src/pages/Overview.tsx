import ChartRenderer from '../components/ChartRenderer';
import {Card,Kpi,useCat} from '../components/ui';
import {useStore} from '../store';
import * as C from '../analysis/charts';
import {yrs} from '../analysis/questions';
export default function Overview(){
  const {rows,year,category,log}=useStore(),cat=useCat(),cur=cat.filter(r=>r.year===year),sc=cur.map(r=>r.score).filter(Number.isFinite);
  const group=<T,>(a:T[],k:(x:T)=>string)=>{const m=new Map<string,number>();a.forEach(x=>m.set(k(x),(m.get(k(x))||0)+1));return [...m].sort((a,b)=>b[1]-a[1])};
  const cc=group(rows.filter(r=>r.year===year),r=>r.category),st=group(cur.filter(r=>r.rank<=100&&r.state!=='Unknown'),r=>r.state),top=[...cur].sort((a,b)=>a.rank-b.rank).slice(0,10);
  const ys=yrs(cat),avg=ys.map(y=>{const s=cat.filter(r=>r.year===y).map(r=>r.score).filter(Number.isFinite);return s.length?C.R(s.reduce((a,b)=>a+b,0)/s.length):NaN});
  const catAvg=[...new Set(rows.filter(r=>r.year===year).map(r=>r.category))].map(c=>{const s=rows.filter(r=>r.year===year&&r.category===c).map(r=>r.score).filter(Number.isFinite);return [c,s.length?C.R(s.reduce((a,b)=>a+b,0)/s.length):0] as const});
  return <div className="space-y-4 max-w-[1400px]">
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      <Kpi label="Institutions (all years)" value={new Set(rows.map(r=>r.name)).size.toLocaleString()}/><Kpi label="Categories" value={new Set(rows.map(r=>r.category)).size}/>
      <Kpi label="Years covered" value={ys.length} sub={`${ys[0]}–${ys.at(-1)}`}/><Kpi label="Selected year" value={year??'–'} sub={category}/>
      <Kpi label="Highest score" value={sc.length?Math.max(...sc).toFixed(2):'n/a'}/><Kpi label="Average score" value={sc.length?C.R(sc.reduce((a,b)=>a+b,0)/sc.length):'n/a'}/></div>
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title="Top 10 institutions"><ChartRenderer height={320} option={C.bar(`Top 10, ${category} ${year}`,top.map(r=>r.name),top.map(r=>r.score||0),'Score','Institution',true)}/></Card>
      <Card title="Score distribution"><ChartRenderer height={320} option={C.hist(`Scores, ${category} ${year}`,sc,'Score')}/></Card>
      <Card title="Year-wise trend"><ChartRenderer height={300} option={C.line(`Average score, ${category}`,ys,[{name:'Average score',data:avg}],'Year','Score')}/></Card>
      <Card title="State-wise representation"><ChartRenderer height={300} option={C.bar(`Top-100 institutions by state, ${year}`,st.slice(0,15).map(a=>a[0]),st.slice(0,15).map(a=>a[1]),'State','Institutions')}/></Card>
      <Card title="Ranked institutions by category"><ChartRenderer height={300} option={C.bar(`Ranked institutions per category, ${year}`,cc.map(a=>a[0]),cc.map(a=>a[1]),'Category','Institutions')}/></Card>
      <Card title="Category-wise average score"><ChartRenderer height={300} option={C.bar(`Average score per category, ${year}`,catAvg.map(a=>a[0]),catAvg.map(a=>a[1]),'Category','Score')}/></Card></div>
    <Card title="Recent activity">{log.length?<ul className="text-xs space-y-1 max-h-40 overflow-auto">{[...log].reverse().slice(0,12).map((l,i)=><li key={i}><span className="text-stone-400 tabular-nums mr-2">{l.t}</span>{l.m}</li>)}</ul>:<p className="text-xs text-stone-500">No activity yet.</p>}</Card></div>;}
