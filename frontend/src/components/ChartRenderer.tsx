<<<<<<< HEAD
import {useEffect,useRef,useState} from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import {Download,Maximize2,Minimize2,Image as Img} from 'lucide-react';
import {EmptyState} from './ui';
import {normalizeIndiaGeoJson} from '../analysis/indiaMap';

export const toCSV=(t:Record<string,any>[])=>{
  const k=Object.keys(t[0]??{});
  const cell=(v:any)=>{const x=String(v??'');return /[",\n\r]/.test(x)?`"${x.replace(/"/g,'""')}"`:x;};
  return [k.map(cell).join(','),...t.map(r=>k.map(c=>cell(r[c])).join(','))].join('\n');
};
export const download=(name:string,text:string,type='text/csv')=>{
  const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type}));
  a.href=url;a.download=name;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
};

export function DataTable({rows,max=50}:{rows:Record<string,any>[];max?:number}){
  const [page,setPage]=useState(0),[pageSize,setPageSize]=useState(Math.min(max,20)),[search,setSearch]=useState(''),[sort,setSort]=useState<{key:string;dir:'asc'|'desc'}|null>(null);
  const keys=Object.keys(rows[0]??[]);
  const filtered=rows.filter(row=>!search||keys.some(k=>String(row[k]??'').toLowerCase().includes(search.toLowerCase())));
  const sorted=sort?[...filtered].sort((a,b)=>{
    const x=a[sort.key],y=b[sort.key],nx=Number(x),ny=Number(y);
    const cmp=Number.isFinite(nx)&&Number.isFinite(ny)?nx-ny:String(x??'').localeCompare(String(y??''));
    return sort.dir==='asc'?cmp:-cmp;
  }):filtered;
  const pages=Math.max(1,Math.ceil(sorted.length/pageSize)),visible=sorted.slice(page*pageSize,(page+1)*pageSize);
  useEffect(()=>setPage(0),[search,rows,pageSize]);
  if(!rows.length)return null;
  return <div>
    <div className="flex flex-wrap items-center gap-2 mb-2"><div className="relative flex-1 min-w-36"><input className="inp w-full text-xs" placeholder="Search table…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <span className="text-[11px] text-stone-500">{filtered.length.toLocaleString()} matching rows</span>
      <button className="btn" onClick={()=>download('analysis-results.csv',toCSV(rows))}><Download size={13}/>Export all</button></div>
    <div className="overflow-auto max-h-[420px] border border-stone-200 rounded"><table className="w-full text-xs"><thead className="sticky top-0 bg-stone-50 z-10"><tr>{keys.map(c=><th key={c} className="text-left font-medium px-2 py-2 border-b border-stone-200 whitespace-nowrap"><button className="inline-flex items-center gap-1" onClick={()=>setSort(s=>s?.key===c?{key:c,dir:s.dir==='asc'?'desc':'asc'}:{key:c,dir:'asc'})}>{c}</button></th>)}</tr></thead>
      <tbody>{visible.map((r,i)=><tr key={i} className="odd:bg-white even:bg-stone-50/60">{keys.map(c=><td key={c} className="px-2 py-1.5 whitespace-nowrap tabular-nums">{String(r[c]??'')}</td>)}</tr>)}</tbody></table></div>
    <div className="flex items-center justify-between mt-2 text-xs text-stone-500"><label className="flex items-center gap-1">Rows <select className="inp py-0.5" value={pageSize} onChange={e=>setPageSize(+e.target.value)}>{[10,20,50,100].map(n=><option key={n} value={n}>{n}</option>)}</select> per page</label>
      <div className="flex items-center gap-2"><span>Page {page+1} of {pages}</span><button className="btn px-2 py-1" disabled={page===0} onClick={()=>setPage(x=>Math.max(0,x-1))}>Prev</button><button className="btn px-2 py-1" disabled={page+1>=pages} onClick={()=>setPage(x=>Math.min(pages-1,x+1))}>Next</button></div></div>
  </div>;
}

let indiaMapLoadPromise:Promise<void>|null=null;
async function ensureIndiaMapRegistered():Promise<void>{
  if(echarts.getMap('india-states'))return;
  if(!indiaMapLoadPromise){
    indiaMapLoadPromise=(async()=>{
      const response=await fetch('/map-assets/india-states.geojson');
      if(!response.ok)throw new Error(`India GeoJSON request failed (${response.status})`);
      const normalizedGeoJson=normalizeIndiaGeoJson(await response.json());
      (echarts as any).registerMap('india-states',{geoJSON:normalizedGeoJson});
      if(!echarts.getMap('india-states'))throw new Error('ECharts did not register the India state map.');
    })().catch(error=>{indiaMapLoadPromise=null;throw error;});
  }
  await indiaMapLoadPromise;
}

/** Chart toolbar plus safe, same-origin India GeoJSON loading for choropleth charts. */
export default function ChartRenderer({option,table,height=360,file='chart',onPick,empty}:{option:any;table?:Record<string,any>[];height?:number;file?:string;onPick?:(name:string)=>void;empty?:string}){
  const ref=useRef<ReactECharts>(null),[fs,setFs]=useState(false);
  const isIndiaMap=!!option?.series?.some((series:any)=>series.type==='map'&&series.map==='india-states');
  const [mapStatus,setMapStatus]=useState<'loading'|'ready'|'error'>(()=>isIndiaMap&&!echarts.getMap('india-states')?'loading':'ready');
  useEffect(()=>{
    if(!isIndiaMap){setMapStatus('ready');return;}
    let active=true;
    if(echarts.getMap('india-states')){setMapStatus('ready');return;}
    setMapStatus('loading');
    ensureIndiaMapRegistered().then(()=>{if(active)setMapStatus('ready');}).catch(error=>{
      console.error('India GeoJSON loading error:',error);if(active)setMapStatus('error');
    });
    return()=>{active=false;};
  },[isIndiaMap]);
  const mapRegistered=!!echarts.getMap('india-states');
  const none=!option?.series?.length||option.series.every((s:any)=>s.type!=='radar'&&s.type!=='sankey'&&s.type!=='parallel'&&!(s.data?.length||s.links?.length));
  const canRenderMap=!isIndiaMap||(mapStatus==='ready'&&mapRegistered);
  const png=()=>{const url=ref.current?.getEchartsInstance().getDataURL({type:'png',pixelRatio:2,backgroundColor:'#fff'});if(url){const a=document.createElement('a');a.href=url;a.download=file+'.png';a.click();}};
  const events=onPick?{click:(p:any)=>{const n=p.name||(typeof p.value==='string'?p.value:Array.isArray(p.value)?String(p.value.find((x:any)=>typeof x==='string')??''):'');if(n)onPick(n);}}:undefined;
  return <div className={fs?'fixed inset-0 z-50 bg-white p-6 overflow-auto':''}>
    {!none&&<div className="flex justify-end gap-1.5 mb-1"><button className="btn-sm" onClick={png} title="Export chart as PNG"><Img size={12}/>PNG</button>
      <button className="btn-sm" onClick={()=>{setFs(f=>!f);window.setTimeout(()=>ref.current?.getEchartsInstance().resize(),50);}} title="Full screen">{fs?<Minimize2 size={12}/>:<Maximize2 size={12}/>} {fs?'Close':'Full screen'}</button></div>}
    {isIndiaMap&&mapStatus==='loading'&&!mapRegistered
      ?<div className="h-64 grid place-items-center text-stone-500 text-sm border border-dashed border-stone-300 rounded p-4 text-center">Loading India state boundaries…</div>
      :isIndiaMap&&!canRenderMap
        ?<div className="h-64 grid place-items-center text-stone-600 text-sm border border-dashed border-amber-300 bg-amber-50 rounded p-4 text-center"><div><b>India state map could not be loaded.</b><p className="mt-2">Boundary data could not be fetched through the local development proxy. The state-wise table and historical trend remain available. Check your internet connection and restart the development server.</p></div></div>
        :none?<EmptyState title="No data for the current selection">{empty}</EmptyState>
        :<ReactECharts ref={ref} key={isIndiaMap?'india-states-map':'standard-chart'} option={option} style={{height:fs?'70vh':height}} notMerge onEvents={events}/>}
    {table&&table.length>0&&<div className="mt-3"><DataTable rows={table}/></div>}
  </div>;
}
=======
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
>>>>>>> origin/main
