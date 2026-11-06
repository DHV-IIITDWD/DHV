import {useState} from 'react';
import {Send,Trash2} from 'lucide-react';
<<<<<<< HEAD
import ChartRenderer,{DataTable} from '../components/ChartRenderer';
import {askAI,uploadCSV} from '../services/aiService';
=======
import ChartRenderer from '../components/ChartRenderer';
import {askAI} from '../services/aiService';
>>>>>>> 56e088a4e38f53be52a4a2e05c20d359a98eac80
import {specToOption} from '../analysis/charts';
import {API} from '../services/api';
import {useStore} from '../store';
import {AIResponse} from '../types';
<<<<<<< HEAD
type Msg={role:'user'|'ai'|'error';text:string;res?:AIResponse;q?:string};
=======
type Msg={role:'user'|'ai'|'error';text:string;res?:AIResponse};
>>>>>>> 56e088a4e38f53be52a4a2e05c20d359a98eac80
const SUGG=['Show the top 10 engineering colleges in Karnataka in 2025','Compare IIT Bombay and IIT Delhi from 2017 to 2025','Show the correlation between RPC and overall score','Which states have the highest representation in the top 100?'];
export default function AIQuery(){
  const [msgs,setMsgs]=useState<Msg[]>([]),[q,setQ]=useState(''),[busy,setBusy]=useState(false),note=useStore(s=>s.note);
  async function send(text:string){if(!text.trim()||busy)return;setMsgs(m=>[...m,{role:'user',text}]);setQ('');setBusy(true);note(`Query executed: "${text}"`);
<<<<<<< HEAD
    try{const hist=msgs.filter(m=>m.res?.plan).slice(-4).map(m=>({question:m.q!,plan:m.res!.plan}));const res=await askAI(text,hist);setMsgs(m=>[...m,{role:'ai',text:res.explanation,res,q:text}]);}
    catch(e){setMsgs(m=>[...m,{role:'error',text:`${String(e).replace(/^Error: /,'')} (backend: ${API}). The rest of the dashboard still works.`}]);}
=======
    try{const res=await askAI(text);setMsgs(m=>[...m,{role:'ai',text:res.explanation,res}]);}
    catch(e){setMsgs(m=>[...m,{role:'error',text:`The AI backend is unavailable (${API}/api/ai/query): ${e}. The rest of the dashboard still works.`}]);}
>>>>>>> 56e088a4e38f53be52a4a2e05c20d359a98eac80
    setBusy(false);}
  return <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-6.5rem)]">
    <div className="flex-1 overflow-y-auto space-y-3 pb-3">{!msgs.length&&<div className="card p-5"><h2 className="font-semibold mb-1">Ask about the NIRF data</h2><p className="text-xs text-stone-500 mb-3">An LLM on the backend turns your question into a structured query; all numbers are computed from the real dataset.</p>
      <div className="flex flex-wrap gap-2">{SUGG.map(s=><button key={s} className="btn text-left" onClick={()=>send(s)}>{s}</button>)}</div></div>}
      {msgs.map((m,i)=><div key={i} className={m.role==='user'?'flex justify-end':''}><div className={`card p-3 max-w-[92%] ${m.role==='user'?'bg-accent text-white border-accent':m.role==='error'?'border-red-300 bg-red-50 text-red-800':''}`}>
        <p className="text-sm">{m.text}</p>
        {m.res&&<div className="mt-2 text-xs text-stone-500">Intent: {m.res.intent} · Operation: {m.res.operation} · Filters: {JSON.stringify(m.res.filters)}</div>}
<<<<<<< HEAD
        {!!m.res?.insights?.length&&<ul className="mt-2 text-xs list-disc pl-4 space-y-0.5">{m.res.insights.map((x,k)=><li key={k}>{x}</li>)}</ul>}
        {m.res?.warnings?.map((w,k)=><p key={k} className="text-xs text-amber-700 mt-1">⚠ {w}</p>)}
        {m.res?.chart&&<div className="mt-2 w-[min(680px,80vw)]"><ChartRenderer option={specToOption(m.res.chart)} height={300}/></div>}
        {!!m.res?.data?.length&&m.res.data.length>1&&<details className="mt-2"><summary className="text-xs text-stone-500 cursor-pointer">Result table ({m.res.data.length} rows) · {m.res.sql_or_analysis}</summary><div className="mt-1.5"><DataTable rows={m.res.data}/></div></details>}</div></div>)}
      {busy&&<div className="text-xs text-stone-500 animate-pulse">Analysing…</div>}</div>
    <div className="flex gap-2"><input className="inp flex-1 py-2" placeholder="Ask a question about NIRF rankings…" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send(q)}/>
      <button className="btn-p" onClick={()=>send(q)} disabled={busy}><Send size={14}/>Send</button><label className="btn cursor-pointer" title="Upload a CSV to the backend for the AI to analyse">Upload CSV<input type="file" accept=".csv" hidden onChange={async e=>{const f=e.target.files?.[0];e.target.value='';if(!f)return;try{const r=await uploadCSV(f);setMsgs(m=>[...m,{role:'ai',text:`Dataset "${r.dataset.name}" loaded in the AI backend: ${r.dataset.rows} rows, ${r.dataset.columns.length} columns.`}])}catch(x){setMsgs(m=>[...m,{role:'error',text:`Upload failed: ${String(x).replace(/^Error: /,'')}`}])}}}/></label><button className="btn" onClick={()=>setMsgs([])} aria-label="Clear"><Trash2 size={14}/></button></div></div>;}
=======
        {m.res?.warnings?.map((w,k)=><p key={k} className="text-xs text-amber-700 mt-1">⚠ {w}</p>)}
        {m.res?.chart&&<div className="mt-2 w-[min(680px,80vw)]"><ChartRenderer option={specToOption(m.res.chart)} height={300}/></div>}</div></div>)}
      {busy&&<div className="text-xs text-stone-500 animate-pulse">Analysing…</div>}</div>
    <div className="flex gap-2"><input className="inp flex-1 py-2" placeholder="Ask a question about NIRF rankings…" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send(q)}/>
      <button className="btn-p" onClick={()=>send(q)} disabled={busy}><Send size={14}/>Send</button><button className="btn" onClick={()=>setMsgs([])} aria-label="Clear"><Trash2 size={14}/></button></div></div>;}
>>>>>>> 56e088a4e38f53be52a4a2e05c20d359a98eac80
