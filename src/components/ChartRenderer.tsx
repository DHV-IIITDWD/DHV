import ReactECharts from 'echarts-for-react';
import {Download} from 'lucide-react';
export const toCSV=(t:Record<string,any>[])=>{const k=Object.keys(t[0]??{});return [k.join(','),...t.map(r=>k.map(c=>JSON.stringify(r[c]??'')).join(','))].join('\n')};
export const download=(name:string,text:string,type='text/csv')=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()};
export function DataTable({rows,max=50}:{rows:Record<string,any>[];max?:number}){
  if(!rows.length)return null;const k=Object.keys(rows[0]);
  return <div className="overflow-auto max-h-72 border border-stone-200 rounded"><table className="w-full text-xs"><thead className="sticky top-0 bg-stone-50"><tr>{k.map(c=><th key={c} className="text-left font-medium px-2 py-1.5 border-b border-stone-200 whitespace-nowrap">{c}</th>)}</tr></thead>
   <tbody>{rows.slice(0,max).map((r,i)=><tr key={i} className="odd:bg-white even:bg-stone-50/50">{k.map(c=><td key={c} className="px-2 py-1 whitespace-nowrap tabular-nums">{String(r[c]??'')}</td>)}</tr>)}</tbody></table></div>;}
export default function ChartRenderer({option,table,height=360,file='chart'}:{option:any;table?:Record<string,any>[];height?:number;file?:string}){
  const empty=!option?.series?.length||option.series.every((s:any)=>!(s.data?.length));
  return <div>{empty?<div className="h-40 grid place-items-center text-stone-500 text-sm border border-dashed border-stone-300 rounded">No data for the current selection.</div>
    :<ReactECharts option={option} style={{height}} notMerge/>}
    {table&&table.length>0&&<div className="mt-3"><div className="flex justify-between items-center mb-1.5"><span className="text-xs text-stone-500">{table.length} row(s)</span>
      <button className="btn" onClick={()=>download(file+'.csv',toCSV(table))}><Download size={14}/>CSV</button></div><DataTable rows={table}/></div>}</div>;}
