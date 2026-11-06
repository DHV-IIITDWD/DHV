import {create} from 'zustand';
import {Mapping,Report,Row} from './types';
import {autoMap,build} from './data';
type Raw=Record<string,any>;
interface S {raw:Raw[];cols:string[];files:{name:string;size:number}[];map:Mapping;rows:Row[];report:Report|null;
  year:number|null;category:string;state:string|null;log:{t:string;m:string}[];collapsed:boolean;
  load:(raw:Raw[],files:{name:string;size:number}[])=>void;setMap:(m:Mapping)=>void;setYear:(y:number)=>void;setCategory:(c:string)=>void;setState:(s:string|null)=>void;
  reset:()=>void;toggle:()=>void;note:(m:string)=>void}
const stamp=()=>new Date().toLocaleTimeString();
const derive=(rows:Row[])=>{const ys=rows.map(r=>r.year);const cs=[...new Set(rows.map(r=>r.category))].sort();
  return {year:ys.length?Math.max(...ys):null,category:cs.includes('Overall')?'Overall':cs[0]??'',state:null as string|null}};
export const useStore=create<S>((set,get)=>({raw:[],cols:[],files:[],map:{},rows:[],report:null,year:null,category:'',state:null,log:[],collapsed:false,
  load:(raw,files)=>{const cols=[...new Set(raw.flatMap(o=>Object.keys(o)))];const map=autoMap(cols);const {rows,report}=build(raw,map);
    set(s=>({raw,cols,files,map,rows,report,...derive(rows),log:[...s.log,{t:stamp(),m:`Dataset uploaded: ${files.map(f=>f.name).join(', ')}`},{t:stamp(),m:`Dataset processed: ${rows.length} of ${raw.length} records kept`}]}));},
  setMap:map=>{const {rows,report}=build(get().raw,map);set(s=>({map,rows,report,...derive(rows),log:[...s.log,{t:stamp(),m:'Column mapping changed'}]}));},
  setYear:year=>set(s=>({year,log:[...s.log,{t:stamp(),m:`Filter changed: year ${year}`}]})),
  setCategory:category=>set(s=>({category,log:[...s.log,{t:stamp(),m:`Filter changed: category ${category}`}]})),
  setState:state=>set(s=>({state,log:[...s.log,{t:stamp(),m:state?`Cross-filter: state ${state}`:'Cross-filter cleared'}]})),
  reset:()=>set(s=>({...derive(s.rows),log:[...s.log,{t:stamp(),m:'Filters reset'}]})),
  toggle:()=>set(s=>({collapsed:!s.collapsed})),note:m=>set(s=>({log:[...s.log,{t:stamp(),m}]}))}));
