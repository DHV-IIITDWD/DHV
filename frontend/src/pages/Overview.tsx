import {useState} from 'react';
import ChartRenderer from '../components/ChartRenderer';
import {Card,ChartTypeSelector,Kpi,useCat} from '../components/ui';
import {useStore} from '../store';
import * as C from '../analysis/charts';
import {mean,fin} from '../analysis/stats';
import {yrs} from '../analysis/questions';
import {THEME as T} from '../theme';
export default function Overview(){
  const {rows,year,category,state,setState,log}=useStore(),cat0=useCat(),[mode,setMode]=useState<C.DistMode>('box');
  const inState=(r:{state:string})=>!state||r.state===state,cat=cat0.filter(inState),cur=cat.filter(r=>r.year===year),sc=fin(cur.map(r=>r.score));
  const group=<T,>(a:T[],k:(x:T)=>string)=>{const m=new Map<string,number>();a.forEach(x=>m.set(k(x),(m.get(k(x))||0)+1));return [...m].sort((a,b)=>b[1]-a[1])};
  const yr=rows.filter(r=>r.year===year&&inState(r)),cc=group(yr,r=>r.category),st=group(cat0.filter(r=>r.year===year&&r.rank<=100&&r.state!=='Unknown'),r=>r.state).slice(0,15),top=[...cur].sort((a,b)=>a.rank-b.rank).slice(0,10);
  const ys=yrs(cat),avgOf=(a:{score:number}[])=>{const s=fin(a.map(r=>r.score));return s.length?C.R(mean(s)):NaN},avg=ys.map(y=>avgOf(cat.filter(r=>r.year===y)));
  const prev=ys.length>1?avgOf(cat.filter(r=>r.year===ys.at(-2))):NaN,now=ys.length?avg.at(-1)!:NaN;
  const catAvg=[...new Set(yr.map(r=>r.category))].map(c=>[c,avgOf(yr.filter(r=>r.category===c))] as const);
  const catGroups=[...new Set(yr.map(r=>r.category))].sort().map(c=>{const e=yr.filter(r=>r.category===c&&Number.isFinite(r.score));return {name:c,v:e.map(r=>r.score),labels:e.map(r=>r.name)}}).filter(g=>g.v.length);
  // cross-highlight: selected state in navy, others primary blue
  const stOpt=C.bar(`Top-100 institutions by state, ${year}`,st.map(a=>a[0]),st.map(a=>a[1]),'State','Institutions');
  stOpt.series[0].data=st.map(a=>({value:a[1],itemStyle:{color:!state||a[0]===state?T.primary:T.light}}));
  return <div className="space-y-4 max-w-[1500px]">
    {state&&<div className="text-xs text-stone-600 bg-accent-soft rounded-md px-3 py-2">Cross-filtered to <b>{state}</b>. Click the state bar again or use the chip in the header to clear. (The state chart itself always shows all states, with the selection highlighted.)</div>}
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      <Kpi label="Institutions (all years)" value={new Set(rows.filter(inState).map(r=>r.name)).size.toLocaleString()}/><Kpi label="Categories" value={new Set(rows.map(r=>r.category)).size}/>
      <Kpi label="Years covered" value={ys.length} sub={`${ys[0]}–${ys.at(-1)}`}/><Kpi label="Selected year" value={year??'–'} sub={category}/>
      <Kpi label="Highest score" value={sc.length?Math.max(...sc).toFixed(2):'n/a'}/><Kpi label="Average score" value={sc.length?C.R(mean(sc)):'n/a'} delta={Number.isFinite(now-prev)?C.R(now-prev):undefined} sub={Number.isFinite(now-prev)?` vs ${ys.at(-2)}`:undefined}/></div>
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title="Top 10 institutions"><ChartRenderer height={320} option={C.bar(`Top 10, ${category} ${year}${state?` · ${state}`:''}`,top.map(r=>r.name),top.map(r=>r.score||0),'Score (axis from 0)','Institution',true)}/></Card>
      <Card title="Score distribution"><ChartRenderer height={320} option={C.hist(`Scores, ${category} ${year}`,sc,'Score')}/></Card>
      <Card title="Year-wise trend"><ChartRenderer height={300} option={C.line(`Average score, ${category}${state?` · ${state}`:''}`,ys,[{name:'Average score',data:avg}],'Year','Score')}/></Card>
      <Card title="State-wise representation (click a bar to cross-filter)"><ChartRenderer height={300} option={stOpt} onPick={n=>setState(state===n?null:n)}/></Card>
      <Card title="Ranked institutions by category"><ChartRenderer height={300} option={C.bar(`Ranked institutions per category, ${year}`,cc.map(a=>a[0]),cc.map(a=>a[1]),'Category','Institutions')}/></Card>
      <Card title="Category-wise average score"><ChartRenderer height={300} option={C.lollipop(`Average score per category, ${year}`,catAvg.map(a=>a[0]),catAvg.map(a=>a[1]),'Category','Score')}/></Card></div>
    <Card title="Score distribution by category" right={<ChartTypeSelector label="View" value={mode} onChange={setMode} options={C.DIST_MODES}/>}>
      <ChartRenderer height={380} option={C.dist(`Score by category, ${year}`,catGroups,'Score','Category',mode)}/></Card>
    <Card title="Recent activity">{log.length?<ul className="text-xs space-y-1 max-h-40 overflow-auto">{[...log].reverse().slice(0,12).map((l,i)=><li key={i}><span className="text-stone-400 tabular-nums mr-2">{l.t}</span>{l.m}</li>)}</ul>:<p className="text-xs text-stone-500">No activity yet.</p>}</Card></div>;}
