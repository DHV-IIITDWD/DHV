<<<<<<< HEAD
export const FIELDS = ['year','category','name','state','rank','score','TLR','RPC','GO','OI','PR','institutionId','imputed'] as const;
export type Field = typeof FIELDS[number];
export const NUM: Field[] = ['score','TLR','RPC','GO','OI','PR'];
export const PARAMS: Field[] = ['TLR','RPC','GO','OI','PR'];
export type Row = {
  year:number; category:string; name:string; state:string; rank:number;
  /** Upper bound is Infinity for open-ended bands, NaN if unranked. */
  rankUpper:number;
  /** False for bands/estimated/non-exact rank text. Never calculate exact rank movement from these. */
  rankExact:boolean;
  /** Original NIRF rank label, e.g. "101-150". */
  rankLabel:string;
  /** Stable project-level institution ID, available in nirf_merged.csv. */
  institutionId?:string;
  /** City helps disambiguate same-name campuses when no stable ID is available. */
  city?:string;
  /** True when at least one value in this row was imputed in preprocessing. */
  imputed:boolean;
  score:number; TLR:number; RPC:number; GO:number; OI:number; PR:number;
};
export type Mapping = Partial<Record<Field,string>>;
export interface Report {
  total:number; kept:number; dropped:number; duplicates:number;
  missing:Record<string,number>; avail:Field[]; rankBands:number; imputedRows:number;
}
=======
export const FIELDS = ['year','category','name','state','rank','score','TLR','RPC','GO','OI','PR'] as const;
export type Field = typeof FIELDS[number];
export const NUM: Field[] = ['score','TLR','RPC','GO','OI','PR'];
export const PARAMS: Field[] = ['TLR','RPC','GO','OI','PR'];
export type Row = {year:number;category:string;name:string;state:string;rank:number;score:number;TLR:number;RPC:number;GO:number;OI:number;PR:number};
export type Mapping = Partial<Record<Field,string>>;
export interface Report {total:number;kept:number;dropped:number;duplicates:number;missing:Record<string,number>;avail:Field[]}
>>>>>>> origin/main
export interface ChartSpec {type:'bar'|'line';title:string;x:(string|number)[];series:{name:string;data:number[]}[];xLabel:string;yLabel:string}
export interface AIResponse {intent:string;filters:Record<string,unknown>;operation:string;chart_type:string;chart:ChartSpec|null;explanation:string;warnings:string[]}
