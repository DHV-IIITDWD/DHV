import {useMemo,useState} from 'react';
import {useParams} from 'react-router-dom';
import {AlertTriangle} from 'lucide-react';
import ChartRenderer from '../components/ChartRenderer';
import {Card,useCat} from '../components/ui';
import {P,QUESTIONS,SECTIONS,yrs} from '../analysis/questions';
import {useStore} from '../store';
const LAB:Record<keyof P,string>={year:'Year',y1:'From year',y2:'To year',inst:'Institution',n:'Top N',k:'Min. years'};
export default function Section(){
  const sec=+(useParams().i??0),qs=QUESTIONS.filter(q=>q.sec===sec),[sel,setSel]=useState<Record<number,string>>({}),[ov,setOv]=useState<Partial<P>>({});
  const {year,report,note}=useStore(),rows=useCat(),ys=yrs(rows),q=qs.find(x=>x.id===sel[sec])??qs[0];
  const top=[...rows].filter(r=>r.year===ys.at(-1)).sort((a,b)=>a.rank-b.rank)[0]?.name??'';
  const p:P={year:year??ys.at(-1)??0,y1:sec===6?ys.at(-2)??ys[0]:ys[0],y2:ys.at(-1)??0,inst:top,n:10,k:3,...ov};
  const missing=q.needs.filter(f=>!report?.avail.includes(f));
  const res=useMemo(()=>{if(!q.run||missing.length)return null;try{return {r:q.run(rows,p)}}catch(e){return {err:String(e)}}},[q,rows,JSON.stringify(p)]);
  const set=(k:keyof P,v:any)=>setOv(o=>({...o,[k]:v}));
  return <div className="grid lg:grid-cols-[320px_1fr] gap-4 max-w-[1400px]">
    <Card title={SECTIONS[sec]} className="self-start"><ul className="space-y-0.5">{qs.map(x=><li key={x.id}><button onClick={()=>{setSel(s=>({...s,[sec]:x.id}));setOv({});note(`Query executed: ${x.id}`)}}
      className={`w-full text-left px-2 py-1.5 rounded text-[13px] leading-snug ${x.id===q.id?'bg-accent-soft text-accent':'hover:bg-stone-100'} ${x.run?'':'opacity-60'}`}><b className="tabular-nums mr-1.5">{x.id}</b>{x.text}</button></li>)}</ul></Card>
    <div className="space-y-4 min-w-0"><Card><div className="text-xs text-stone-500 mb-1">Question {q.id}</div><h2 className="font-semibold">{q.text}</h2>
      <div className="flex flex-wrap gap-3 mt-3 text-xs">{q.params.map(k=><label key={k} className="flex items-center gap-1.5 text-stone-500">{LAB[k]}
        {k==='inst'?<select className="inp max-w-56" value={p.inst} onChange={e=>set(k,e.target.value)}>{[...new Set(rows.map(r=>r.name))].sort().map(n=><option key={n}>{n}</option>)}</select>
        :k==='n'||k==='k'?<input type="number" min={1} max={50} className="inp w-16" value={p[k]} onChange={e=>set(k,+e.target.value||1)}/>
        :<select className="inp" value={p[k]} onChange={e=>set(k,+e.target.value)}>{ys.map(y=><option key={y}>{y}</option>)}</select>}</label>)}</div></Card>
      {!q.run?<Card><p className="text-sm text-stone-500">This question is not implemented in the React build yet (see README). It is available in the Streamlit version.</p></Card>
      :missing.length?<Card><p className="text-sm flex items-start gap-2 text-amber-800"><AlertTriangle size={16} className="mt-0.5 shrink-0"/>Cannot answer: the active dataset has no usable <b>{missing.join(', ')}</b> column. Check the column mapping in Dataset Manager.</p></Card>
      :res?.err?<Card><p className="text-sm text-red-700">Could not compute this question: {res.err}</p></Card>
      :res?.r&&<Card><ChartRenderer option={res.r.option} table={res.r.table} file={`q${q.id}`}/><p className="text-sm mt-3 border-l-2 border-accent pl-3">{res.r.note}</p></Card>}</div></div>;}
