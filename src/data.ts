import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {FIELDS,NUM,Field,Mapping,Report,Row} from './types';
type Raw = Record<string,any>;
const ALIAS: Record<Field,string[]> = {year:['year','ranking year'],category:['category','discipline','ranking category'],
 name:['institute name','institute','institution','institution name','name','college name'],state:['state'],rank:['rank','nirf rank','overall rank'],
 score:['score','overall score','total score','total'],TLR:['tlr'],RPC:['rpc','rp'],GO:['go'],OI:['oi'],PR:['pr']};
export const norm=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export async function readFile(f:File):Promise<Raw[]> {
  if (/\.xlsx?$/i.test(f.name)) { const wb=XLSX.read(await f.arrayBuffer()); return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as Raw[]; }
  return new Promise((res,rej)=>Papa.parse<Raw>(f,{header:true,skipEmptyLines:true,complete:r=>res(r.data),error:rej}));
}
export function autoMap(cols:string[]):Mapping {
  const m:Mapping={};
  for (const f of FIELDS) { const c=cols.find(c=>ALIAS[f].includes(norm(c))); if (c) m[f]=c; }
  return m;
}
const num=(v:any)=>{const n=parseFloat(String(v??'').replace(/,/g,''));return Number.isFinite(n)?n:NaN};
export function build(raw:Raw[],map:Mapping):{rows:Row[];report:Report} {
  const g=(o:Raw,f:Field)=>map[f]?o[map[f]!]:undefined;
  const seen=new Set<string>(); const rows:Row[]=[]; let dup=0, drop=0;
  for (const o of raw) {
    const year=parseInt(String(g(o,'year')??'').match(/\d{4}/)?.[0]??'');
    const rank=parseInt(String(g(o,'rank')??'').match(/\d+/)?.[0]??'');  // "101-150" -> 101
    const name=String(g(o,'name')??'').trim();
    if (!year||!rank||!name) {drop++;continue;}
    const category=map.category?String(g(o,'category')).trim():'All';
    const k=`${year}|${category}|${name.toLowerCase()}`;
    if (seen.has(k)) {dup++;continue;} seen.add(k);
    rows.push({year,category,name,state:String(g(o,'state')??'').trim()||'Unknown',rank,score:num(g(o,'score')),
      TLR:num(g(o,'TLR')),RPC:num(g(o,'RPC')),GO:num(g(o,'GO')),OI:num(g(o,'OI')),PR:num(g(o,'PR'))});
  }
  const missing:Record<string,number>={}; const avail:Field[]=['year','name','rank'];
  for (const f of NUM) { missing[f]=rows.filter(r=>Number.isNaN(r[f])).length; if (rows.length&&missing[f]<rows.length) avail.push(f); }
  missing.state=rows.filter(r=>r.state==='Unknown').length; if (rows.length&&missing.state<rows.length) avail.push('state');
  if (map.category) avail.push('category');
  return {rows,report:{total:raw.length,kept:rows.length,dropped:drop,duplicates:dup,missing,avail}};
}
