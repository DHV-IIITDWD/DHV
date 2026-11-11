import Papa from 'papaparse';
import * as XLSX from 'xlsx';
<<<<<<< HEAD
import { FIELDS, NUM, Field, Mapping, Report, Row } from './types';
type Raw = Record<string, unknown>;

const ALIAS: Record<Field, string[]> = {
  year: ['year', 'ranking year'], category: ['category', 'discipline', 'ranking category'],
  name: ['institute name', 'institute', 'institution', 'institution name', 'name', 'college name'],
  state: ['state'], rank: ['rank', 'nirf rank', 'overall rank'],
  score: ['score', 'overall score', 'total score', 'total'],
  TLR: ['tlr'], RPC: ['rpc', 'rp'], GO: ['go'], OI: ['oi'], PR: ['pr'],
  institutionId: ['inst id', 'institution id', 'institute id', 'inst id'],
  imputed: ['filled', 'imputed', 'was filled']
};
export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export async function readFile(f: File): Promise<Raw[]> {
  if (/\.xlsx?$/i.test(f.name)) {
    const wb = XLSX.read(await f.arrayBuffer(), { cellDates: false });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    if (!sheet) throw new Error(`Workbook ${f.name} has no visible worksheet.`);
    return XLSX.utils.sheet_to_json(sheet, { defval: null }) as Raw[];
  }
  return new Promise((resolve, reject) => Papa.parse<Raw>(f, {
    header: true, skipEmptyLines: 'greedy', encoding: 'UTF-8',
    complete: r => r.errors.length ? reject(new Error(r.errors.slice(0, 3).map(e => e.message).join('; '))) : resolve(r.data),
    error: reject
  }));
}

export function autoMap(cols: string[]): Mapping {
  const mapped: Mapping = {};
  for (const field of FIELDS) {
    const candidates = ALIAS[field];
    const match = cols.find(c => candidates.includes(norm(c)));
    if (match) mapped[field] = match;
  }
  return mapped;
}

const numeric = (value: unknown): number => {
  if (value === null || value === undefined || String(value).trim() === '') return NaN;
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};
const truthy = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'y'].includes(String(value ?? '').trim().toLowerCase());
};
export function parseRank(value: unknown): { lower: number; upper: number; exact: boolean; label: string } {
  const label = String(value ?? '').trim();
  if (!label || /^(?:na|n\/a|not ranked|unranked|-)$/i.test(label))
    return { lower: NaN, upper: NaN, exact: false, label };
  const range = label.match(/(\d+)\s*(?:-|–|—|to)\s*(\d+)/i);
  if (range) return { lower: Number(range[1]), upper: Number(range[2]), exact: false, label };
  const plus = label.match(/(\d+)\s*\+/);
  if (plus) return { lower: Number(plus[1]), upper: Infinity, exact: false, label };
  const single = label.match(/^\s*#?\s*(\d+(?:\.0+)?)\s*$/);
  if (single) return { lower: Number(single[1]), upper: Number(single[1]), exact: true, label };
  const number = label.match(/\d+/);
  return number ? { lower: Number(number[0]), upper: Number(number[0]), exact: false, label }
    : { lower: NaN, upper: NaN, exact: false, label };
}
const identityText = (s: string) => norm(s).replace(/\b(the|of|and)\b/g, ' ').replace(/\s+/g, ' ').trim();

export function build(raw: Raw[], map: Mapping): { rows: Row[]; report: Report } {
  const get = (o: Raw, f: Field) => map[f] ? o[map[f]!] : undefined;
  const seen = new Set<string>();
  const rows: Row[] = [];
  let duplicates = 0, dropped = 0, rankBands = 0, imputedRows = 0;

  for (const record of raw) {
    const yearText = String(get(record, 'year') ?? '').match(/\b(?:19|20)\d{2}\b/)?.[0];
    const year = yearText ? Number(yearText) : NaN;
    const name = String(get(record, 'name') ?? '').trim();
    if (!Number.isInteger(year) || !name) { dropped++; continue; }

    const category = map.category ? String(get(record, 'category') ?? 'Unknown').trim() || 'Unknown' : 'All';
    const state = String(get(record, 'state') ?? '').trim() || 'Unknown';
    const rank = parseRank(get(record, 'rank'));
    const idValue = String(get(record, 'institutionId') ?? '').trim();
    const identity = idValue
      ? `id:${idValue.toLowerCase()}`
      : `loc:${identityText(name)}|${identityText(state)}|${identityText(String(record.city ?? ''))}`;
    const key = `${year}|${category.toLowerCase()}|${identity}`;
    if (seen.has(key)) { duplicates++; continue; }
    seen.add(key);

    if (Number.isFinite(rank.lower) && !rank.exact) rankBands++;
    const imputed = map.imputed ? truthy(get(record, 'imputed')) : false;
    if (imputed) imputedRows++;
    rows.push({
      year, category, name, state, rank: rank.lower,
      rankUpper: rank.upper, rankExact: rank.exact, rankLabel: rank.label,
      institutionId: idValue || undefined, city: String(record.city ?? '').trim() || undefined, imputed,
      score: numeric(get(record, 'score')),
      TLR: numeric(get(record, 'TLR')), RPC: numeric(get(record, 'RPC')),
      GO: numeric(get(record, 'GO')), OI: numeric(get(record, 'OI')), PR: numeric(get(record, 'PR'))
    });
  }

  const missing: Record<string, number> = {};
  const avail: Field[] = ['year', 'name'];
  for (const field of NUM) {
    missing[field] = rows.filter(row => !Number.isFinite(row[field])).length;
    if (rows.length && missing[field] < rows.length) avail.push(field);
  }
  missing.rank = rows.filter(row => !Number.isFinite(row.rank)).length;
  missing.state = rows.filter(row => row.state === 'Unknown').length;
  if (rows.some(row => Number.isFinite(row.rank))) avail.push('rank');
  if (rows.some(row => row.state !== 'Unknown')) avail.push('state');
  if (map.category) avail.push('category');
  if (map.institutionId) avail.push('institutionId');
  if (map.imputed) avail.push('imputed');

  return { rows, report: { total: raw.length, kept: rows.length, dropped, duplicates, missing, avail, rankBands, imputedRows } };
}

/** Load the bundled merged dataset so the dashboard is usable immediately after startup. */
export async function readRemoteCsv(url: string): Promise<Raw[]> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Dataset request failed (${response.status})`);
  const csv = await response.text();
  return new Promise((resolve, reject) => Papa.parse<Raw>(csv, {
    header: true, skipEmptyLines: 'greedy', encoding: 'UTF-8',
    complete: result => result.errors.length
      ? reject(new Error(result.errors.slice(0, 3).map(error => error.message).join('; ')))
      : resolve(result.data),
    error: reject
  }));
=======
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
>>>>>>> origin/main
}
