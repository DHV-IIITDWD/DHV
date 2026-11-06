import {useMemo,useState} from 'react';
import {useParams} from 'react-router-dom';
import {AlertTriangle} from 'lucide-react';
import ChartRenderer from '../components/ChartRenderer';
import {Card,ChartTypeSelector,EmptyState,useCat} from '../components/ui';
import {P,QUESTIONS,SECTIONS,yrs} from '../analysis/questions';
import {useStore} from '../store';
const LAB:Record<keyof P,string>={year:'Year',y1:'From year',y2:'To year',inst:'Institution',n:'Top N',k:'Min. years',s1:'State A',s2:'State B'};
const MAP_NOTE='Map views (choropleth of top-100 counts or average score by state) are not included: the project has no India state-boundary GeoJSON, and inventing boundaries would be misleading. The state bar charts and heatmaps below use the real data; drop a verified GeoJSON into the project to enable a map.';
export default function Section(){
  const sec=+(useParams().i??0),qs=QUESTIONS.filter(q=>q.sec===sec),[sel,setSel]=useState<Record<number,string>>({}),[ov,setOv]=useState<Partial<P>>({}),[alt,setAlt]=useState<Record<string,string>>({});
  const {year,report,note,rows:all}=useStore(),rows=useCat(),ys=yrs(rows),q=qs.find(x=>x.id===sel[sec])??qs[0];
  const top=[...rows].filter(r=>r.year===ys.at(-1)).sort((a,b)=>a.rank-b.rank)[0]?.name??'';
  const stc=[...new Set(rows.map(r=>r.state))].filter(s=>s!=='Unknown').sort(),pick=(n:string)=>stc.includes(n)?n:'';
  const p:P={year:year??ys.at(-1)??0,y1:sec===6?ys.at(-2)??ys[0]:ys[0],y2:ys.at(-1)??0,inst:top,n:q.id==='5.1'?5:10,k:3,s1:pick('Karnataka')||stc[0]||'',s2:pick('Tamil Nadu')||stc[1]||'',...ov};
  const missing=q.needs.filter(f=>!report?.avail.includes(f)),data=q.all?all:rows,noYear=q.params.some(k=>k==='year'||k==='y1'||k==='y2')&&q.params.some(k=>!data.some(r=>r.year===p[k as 'year'])&&(k==='year'||k==='y1'||k==='y2'));
  const res=useMemo(()=>{if(!q.run||missing.length||noYear)return null;try{return {r:q.run(data,p)}}catch(e){return {err:String(e)}}},[q,data,JSON.stringify(p)]);
  const set=(k:keyof P,v:any)=>setOv(o=>({...o,[k]:v})),r=res?.r,cur=r?.alts?.find(a=>a.label===alt[q.id])??r?.alts?.[0];
  return <div className="grid lg:grid-cols-[320px_1fr] gap-4 max-w-[1500px]">
    <Card title={SECTIONS[sec]} className="self-start"><ul className="space-y-0.5">{qs.map(x=><li key={x.id}><button onClick={()=>{setSel(s=>({...s,[sec]:x.id}));setOv({});note(`Query executed: ${x.id}`)}}
      className={`w-full text-left px-2 py-1.5 rounded-md text-[13px] leading-snug ${x.id===q.id?'bg-accent-soft text-accent font-medium':'hover:bg-stone-100'} ${x.run?'':'opacity-60'}`}><b className="tabular-nums mr-1.5">{x.id}{x.extra&&'*'}</b>{x.text}</button></li>)}</ul>
      {qs.some(x=>x.extra)&&<p className="text-[11px] text-stone-500 mt-2">* extra analysis beyond the 40 sample questions</p>}</Card>
    <div className="space-y-4 min-w-0"><Card><div className="text-xs text-stone-500 mb-1">Question {q.id}</div><h2 className="font-semibold text-navy">{q.text}</h2>
      <div className="flex flex-wrap gap-3 mt-3 text-xs">{q.params.map(k=><label key={k} className="flex items-center gap-1.5 text-stone-500">{LAB[k]}
        {k==='inst'?<select className="inp max-w-56" value={p.inst} onChange={e=>set(k,e.target.value)}>{[...new Set(rows.map(r=>r.name))].sort().map(n=><option key={n}>{n}</option>)}</select>
        :k==='s1'||k==='s2'?<select className="inp" value={p[k]} onChange={e=>set(k,e.target.value)}>{stc.map(n=><option key={n}>{n}</option>)}</select>
        :k==='n'||k==='k'?<input type="number" min={1} max={50} className="inp w-16" value={p[k]} onChange={e=>set(k,+e.target.value||1)}/>
        :<select className="inp" value={p[k]} onChange={e=>set(k,+e.target.value)}>{ys.map(y=><option key={y}>{y}</option>)}</select>}</label>)}
        {q.all&&<span className="text-stone-500 self-center">Uses all categories</span>}</div></Card>
      {!q.run?<Card><p className="text-sm text-stone-500">This question is not implemented yet.</p></Card>
      :missing.length?<Card><p className="text-sm flex items-start gap-2 text-amber-800"><AlertTriangle size={16} className="mt-0.5 shrink-0"/>Cannot answer: the active dataset has no usable <b>{missing.join(', ')}</b> column. Check the column mapping in Dataset Manager.</p></Card>
      :noYear?<Card><EmptyState title="No records for the selected year(s)">The selected category has no ranked institutions in one of the chosen years. Pick another year or category.</EmptyState></Card>
      :res?.err?<Card><p className="text-sm text-red-700">Could not compute this question: {res.err}</p></Card>
      :r&&<Card right={r.alts&&<ChartTypeSelector label={r.altsLabel??'View'} value={cur!.label} onChange={v=>setAlt(a=>({...a,[q.id]:v}))} options={r.alts.map(a=>({id:a.label,label:a.label}))}/>}>
        <ChartRenderer option={cur?.option??r.option} table={r.table} file={`q${q.id}`}/><p className="text-sm mt-3 border-l-2 border-accent pl-3"><span className="font-medium text-navy">Interpretation. </span>{r.note}</p></Card>}
      {sec===1&&<p className="text-xs text-stone-500 px-1">{MAP_NOTE}</p>}</div></div>;}
