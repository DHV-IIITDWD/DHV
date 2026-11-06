import {Link} from 'react-router-dom';
import {useStore} from '../store';
import {Row} from '../types';
export const Kpi=({label,value,sub}:{label:string;value:string|number;sub?:string})=><div className="card p-3.5"><div className="text-xs text-stone-500">{label}</div><div className="text-2xl font-semibold tabular-nums mt-1">{value}</div>{sub&&<div className="text-xs text-stone-500 mt-0.5">{sub}</div>}</div>;
export const Card=({title,children,className=''}:{title?:string;children:React.ReactNode;className?:string})=><section className={`card p-4 ${className}`}>{title&&<h3 className="text-sm font-semibold mb-2">{title}</h3>}{children}</section>;
export function Gate({children}:{children:React.ReactNode}){const n=useStore(s=>s.rows.length);
  return n?<>{children}</>:<div className="card p-10 text-center max-w-lg mx-auto mt-16"><h2 className="font-semibold text-lg">No dataset loaded</h2><p className="text-stone-500 mt-1 mb-4">Upload a NIRF CSV or XLSX file. Nothing is shown until real data is loaded.</p><Link to="/data" className="btn-p">Go to Dataset Manager</Link></div>;}
export const useCat=():Row[]=>{const {rows,category}=useStore();return rows.filter(r=>r.category===category)};
