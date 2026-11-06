import {useRef,useState} from 'react';
import ReactECharts from 'echarts-for-react';
import {Download,Maximize2,Minimize2,Image as Img} from 'lucide-react';
import {EmptyState} from './ui';
export const toCSV=(t:Record<string,any>[])=>{const k=Object.keys(t[0]??{});return [k.join(','),...t.map(r=>k.map(c=>JSON.stringify(r[c]??'')).join(','))].join('\n')};
export const download=(name:string,text:string,type='text/csv')=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()};
export function DataTable({rows,max=50}:{rows:Record<string,any>[];max?:number}){
  const [page,setPage]=useState(0);if(!rows.length)return null;const k=Object.keys(rows[0]),pages=Math.ceil(rows.length/max),sl=rows.slice(page*max,page*max+max);
  return <div><div className="overflow-auto max-h-72 border border-stone-200 rounded-md"><table className="w-full text-xs"><thead className="sticky top-0 bg-accent-soft text-navy"><tr>{k.map(c=><th key={c} className="text-left font-medium px-2 py-1.5 border-b border-stone-200 whitespace-nowrap">{c}</th>)}</tr></thead>
   <tbody>{sl.map((r,i)=><tr key={i} className="odd:bg-white even:bg-stone-50/60">{k.map(c=><td key={c} className="px-2 py-1 whitespace-nowrap tabular-nums">{String(r[c]??'')}</td>)}</tr>)}</tbody></table></div>
   {pages>1&&<div className="flex items-center gap-2 mt-1.5 text-xs text-stone-500"><button className="btn-sm" disabled={page===0} onClick={()=>setPage(p=>p-1)}>Prev</button>Page {page+1} / {pages}<button className="btn-sm" disabled={page>=pages-1} onClick={()=>setPage(p=>p+1)}>Next</button></div>}</div>;}
/** Chart + toolbar (PNG, full screen) + optional data table with CSV export. onPick = cross-filter hook (receives the clicked category/name). */
export default function ChartRenderer({option,table,height=360,file='chart',onPick,empty}:{option:any;table?:Record<string,any>[];height?:number;file?:string;onPick?:(name:string)=>void;empty?:string}){
  const ref=useRef<ReactECharts>(null),[fs,setFs]=useState(false);
  const none=!option?.series?.length||option.series.every((s:any)=>s.type!=='radar'&&s.type!=='sankey'&&s.type!=='parallel'&&!(s.data?.length||s.links?.length));
  const png=()=>{const u=ref.current?.getEchartsInstance().getDataURL({type:'png',pixelRatio:2,backgroundColor:'#fff'});if(u){const a=document.createElement('a');a.href=u;a.download=file+'.png';a.click()}};
  const events=onPick?{click:(p:any)=>{const n=p.name||(typeof p.value==='string'?p.value:Array.isArray(p.value)?String(p.value.find((x:any)=>typeof x==='string')??''):'');if(n)onPick(n)}}:undefined;
  return <div className={fs?'fixed inset-0 z-50 bg-white p-6 overflow-auto':''}>
    {!none&&<div className="flex justify-end gap-1.5 mb-1"><button className="btn-sm" onClick={png} title="Export chart as PNG"><Img size={12}/>PNG</button>
      <button className="btn-sm" onClick={()=>{setFs(f=>!f);setTimeout(()=>ref.current?.getEchartsInstance().resize(),50)}} title="Full screen">{fs?<Minimize2 size={12}/>:<Maximize2 size={12}/>}{fs?'Close':'Full screen'}</button></div>}
    {none?<EmptyState title="No data for the current selection">{empty}</EmptyState>
     :<ReactECharts ref={ref} option={option} style={{height:fs?'70vh':height}} notMerge onEvents={events}/>}
    {table&&table.length>0&&<div className="mt-3"><div className="flex justify-between items-center mb-1.5"><span className="text-xs text-stone-500">{table.length} row(s)</span>
      <button className="btn-sm" onClick={()=>download(file+'.csv',toCSV(table))}><Download size={12}/>CSV</button></div><DataTable rows={table}/></div>}</div>;}
