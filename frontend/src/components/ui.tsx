import {Link} from 'react-router-dom';
import {Inbox,TrendingDown,TrendingUp} from 'lucide-react';
import {useStore} from '../store';
import {Row} from '../types';
export const Kpi=({label,value,sub,delta}:{label:string;value:string|number;sub?:string;delta?:number})=><div className="card p-3.5 border-l-4 border-l-accent">
  <div className="text-[11px] uppercase tracking-wide text-stone-500">{label}</div><div className="text-2xl font-semibold tabular-nums mt-1 text-navy">{value}</div>
  <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">{delta!==undefined&&Number.isFinite(delta)&&(delta>=0?<TrendingUp size={12} className="text-accent"/>:<TrendingDown size={12} className="text-navy"/>)}{delta!==undefined&&Number.isFinite(delta)&&<b className="tabular-nums">{delta>=0?'+':''}{delta}</b>}{sub}</div></div>;
export const Card=({title,children,className='',right}:{title?:string;children:React.ReactNode;className?:string;right?:React.ReactNode})=><section className={`card p-4 ${className}`}>
  {(title||right)&&<div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold text-navy">{title}</h3>{right}</div>}{children}</section>;
export const EmptyState=({title,children}:{title:string;children?:React.ReactNode})=><div className="py-10 grid place-items-center text-center text-stone-500"><Inbox size={28} className="text-accent/50 mb-2"/><div className="font-medium text-stone-700 text-sm">{title}</div>{children&&<p className="text-xs mt-1 max-w-md">{children}</p>}</div>;
export function ChartTypeSelector<T extends string>({value,onChange,options,label}:{value:T;onChange:(v:T)=>void;options:{id:T;label:string}[];label?:string}){
  return <div className="flex items-center gap-2">{label&&<span className="text-xs text-stone-500">{label}</span>}<div className="seg" role="group" aria-label={label??'Chart type'}>{options.map(o=><button key={o.id} aria-pressed={o.id===value} onClick={()=>onChange(o.id)}>{o.label}</button>)}</div></div>;}
export function Gate({children}:{children:React.ReactNode}){const n=useStore(s=>s.rows.length);
  return n?<>{children}</>:<div className="card p-10 text-center max-w-lg mx-auto mt-16"><h2 className="font-semibold text-lg text-navy">No dataset loaded</h2><p className="text-stone-500 mt-1 mb-4">Upload a NIRF CSV or XLSX file. Nothing is shown until real data is loaded.</p><Link to="/data" className="btn-p">Go to Dataset Manager</Link></div>;}
<<<<<<< HEAD
export const useCat=():Row[]=>{const {rows,category,includeImputed}=useStore();return rows.filter(r=>r.category===category&&(includeImputed||!r.imputed))};
=======
export const useCat=():Row[]=>{const {rows,category}=useStore();return rows.filter(r=>r.category===category)};
>>>>>>> origin/main
