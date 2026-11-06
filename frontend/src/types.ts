export const FIELDS = ['year','category','name','state','rank','score','TLR','RPC','GO','OI','PR'] as const;
export type Field = typeof FIELDS[number];
export const NUM: Field[] = ['score','TLR','RPC','GO','OI','PR'];
export const PARAMS: Field[] = ['TLR','RPC','GO','OI','PR'];
export type Row = {year:number;category:string;name:string;state:string;rank:number;score:number;TLR:number;RPC:number;GO:number;OI:number;PR:number};
export type Mapping = Partial<Record<Field,string>>;
export interface Report {total:number;kept:number;dropped:number;duplicates:number;missing:Record<string,number>;avail:Field[]}
export interface ChartSpec {type:'bar'|'line'|'area'|'pie'|'scatter'|'heatmap'|'box'|'histogram';title:string;x:(string|number)[];series:{name:string;data:number[]}[];xLabel:string;yLabel:string;
  pie?:{name:string;value:number}[];points?:{x:number;y:number;name:string}[];heat?:{xs:string[];ys:string[];cells:[number,number,number][]};box?:number[][]}
export interface AIResponse {intent:string;filters:Record<string,unknown>;operation:string;chart_type:string;chart:ChartSpec|null;explanation:string;warnings:string[];data?:Record<string,any>[];insights?:string[];sql_or_analysis?:string;plan?:unknown}
