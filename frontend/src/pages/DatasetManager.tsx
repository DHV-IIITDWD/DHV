import {useRef,useState} from 'react';
import {UploadCloud,Download,AlertTriangle} from 'lucide-react';
import {Card,Kpi} from '../components/ui';
import {DataTable,download,toCSV} from '../components/ChartRenderer';
import {readFile} from '../data';
import {useStore} from '../store';
import {FIELDS,Field} from '../types';
const REQ:Field[]=['year','name'];
export default function DatasetManager(){
  const s=useStore(),ref=useRef<HTMLInputElement>(null),[status,setStatus]=useState(''),[err,setErr]=useState(''),[drag,setDrag]=useState(false);
  async function ingest(list:FileList|null){
    if(!list?.length)return;setErr('');const files=Array.from(list).filter(f=>/\.(csv|xlsx?)$/i.test(f.name));
    if(!files.length){setErr('Unsupported file type. Please upload CSV or XLSX files.');return;}
    try{const all:any[]=[];for(let i=0;i<files.length;i++){setStatus(`Reading ${files[i].name} (${i+1}/${files.length})…`);all.push(...await readFile(files[i]));}
      if(!all.length)throw new Error('The file contains no data rows.');setStatus('Processing…');s.load(all,files.map(f=>({name:f.name,size:f.size})));setStatus('');}
    catch(e){setErr(`Could not read file: ${e}`);setStatus('');}}
  const miss=REQ.filter(f=>!s.map[f]);
  return <div className="space-y-4 max-w-[1200px]">
    <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);ingest(e.dataTransfer.files)}}
      className={`card border-dashed p-8 text-center ${drag?'border-accent bg-accent-soft':''}`}><UploadCloud className="mx-auto text-stone-400" size={28}/>
      <p className="mt-2 font-medium">Drag and drop NIRF files here</p><p className="text-xs text-stone-500 mb-3">CSV or XLSX · multiple files are combined (e.g. one file per year)</p>
      <button className="btn-p" onClick={()=>ref.current?.click()}>Browse files</button><input ref={ref} type="file" hidden multiple accept=".csv,.xlsx,.xls" onChange={e=>ingest(e.target.files)}/>
      {status&&<div className="mt-3 text-xs text-stone-600"><div className="h-1 w-48 mx-auto bg-stone-200 rounded overflow-hidden"><div className="h-full w-1/2 bg-accent animate-pulse"/></div>{status}</div>}
      {err&&<p className="mt-3 text-sm text-red-700">{err}</p>}</div>
    {s.report&&<>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3"><Kpi label="Records read" value={s.report.total}/><Kpi label="Records kept" value={s.report.kept}/>
        <Kpi label="Dropped (missing year/name)" value={s.report.dropped}/><Kpi label="Rank bands" value={s.report.rankBands}/><Kpi label="Estimated rows" value={s.report.imputedRows}/><Kpi label="Duplicates removed" value={s.report.duplicates}/><Kpi label="Files" value={s.files.length} sub={s.files.map(f=>`${f.name} (${(f.size/1024).toFixed(0)} KB)`).join(', ')}/></div>
      {(s.report.rankBands>0||s.report.imputedRows>0)&&<Card title="Data quality and provenance"><p className="text-xs text-stone-600">The merged dataset contains {s.report.rankBands.toLocaleString()} rank-band observations and {s.report.imputedRows.toLocaleString()} rows marked as estimated/filled. Estimated rows are excluded from analytical views by default; use the global switch to include them deliberately. Rank intervals remain intervals and are not treated as exact ranks in movement calculations.</p></Card>}
      <Card title="Column mapping"><p className="text-xs text-stone-500 mb-3">Map your file's columns to the standard fields. Year and Institution name are required to identify a record. Rank can be missing; rank-specific questions will exclude those records. Institution ID and Filled provenance are mapped automatically when present.</p>
        {miss.length>0&&<p className="text-sm text-amber-800 flex gap-2 mb-3"><AlertTriangle size={16}/>Required field(s) not mapped: {miss.join(', ')}</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{FIELDS.map(f=><label key={f} className="text-xs text-stone-500 block">{f}{REQ.includes(f)&&' *'}
          <select className="inp w-full mt-1 text-ink" value={s.map[f]??''} onChange={e=>s.setMap({...s.map,[f]:e.target.value||undefined})}><option value="">— not mapped —</option>{s.cols.map(c=><option key={c}>{c}</option>)}</select></label>)}</div></Card>
      <div className="grid lg:grid-cols-2 gap-4"><Card title="Missing values (in kept records)"><DataTable rows={Object.entries(s.report.missing).map(([field,missing])=>({field,missing,percent:s.report!.kept?+(missing*100/s.report!.kept).toFixed(1):0}))}/></Card>
        <Card title="Columns detected"><DataTable rows={s.cols.map(c=>({column:c,mapped_to:FIELDS.find(f=>s.map[f]===c)??'—'}))}/></Card></div>
      <Card title="Preview (first 10 raw rows)"><DataTable rows={s.raw.slice(0,10)} max={10}/>
        <button className="btn mt-3" disabled={!s.rows.length} onClick={()=>download('nirf_cleaned.csv',toCSV(s.rows))}><Download size={14}/>Download cleaned dataset (CSV)</button></Card></>}</div>;}
