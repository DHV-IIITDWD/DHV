import {Field,Row} from '../types';
<<<<<<< HEAD
import {INDIA_REGIONS,normalizeIndiaStateName} from './indiaMap';
=======
>>>>>>> origin/main
import * as C from './charts';
const {R}=C;
export interface P{year:number;y1:number;y2:number;inst:string;n:number;k:number;s1:string;s2:string}
export interface Alt{label:string;option:any}
<<<<<<< HEAD
export interface Extra{title:string;option:any;table?:Record<string,any>[];note?:string;alts?:Alt[]}
export interface Res{option:any;table?:Record<string,any>[];note:string;alts?:Alt[];altsLabel?:string;extra?:Extra[]}
=======
export interface Res{option:any;table?:Record<string,any>[];note:string;alts?:Alt[];altsLabel?:string}
>>>>>>> origin/main
/** all:true = question compares categories, so it receives rows from every category instead of only the selected one. */
export interface Q{id:string;sec:number;text:string;needs:Field[];params:(keyof P)[];run?:(r:Row[],p:P)=>Res;all?:boolean;extra?:boolean}
export const SECTIONS=['Time-series and trend analysis','Geospatial and regional analysis','Univariate analysis','Bivariate analysis and correlation','Multivariate analysis','Distribution and statistical comparison','Ranking transitions and institutional mobility','Outlier detection and performance gaps'];
import {mean,qt,sd,median,corr as pcorr,linreg,fin} from './stats';
const none=(note:string):Res=>({option:{},note});
const PARAMS=['TLR','RPC','GO','OI','PR'] as Field[];
const BANDS:[number,number,string][]=[[1,10,'1–10'],[11,50,'11–50'],[51,100,'51–100'],[101,200,'101–200'],[201,Infinity,'201+']];
const band=(rk:number)=>BANDS.findIndex(b=>rk>=b[0]&&rk<=b[1]);
<<<<<<< HEAD
const bandRow=(row:Row)=>BANDS.findIndex(b=>Number.isFinite(row.rank)&&row.rank>=b[0]&&row.rankUpper<=b[1]);
const identityRow=(row:Row)=>row.institutionId?`id:${row.institutionId.toLowerCase()}`:`loc:${row.name.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}|${row.state.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}|${(row.city??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}`;
const matched=(r:Row[],a:number,b:number)=>{const B=new Map(at(r,b).map(x=>[identityRow(x),x]));return at(r,a).flatMap(x=>{const y=B.get(identityRow(x));return y?[{a:x,b:y}]:[]});};
=======
>>>>>>> origin/main
const distAlts=(title:string,groups:C.Grp[],yn:string,xn:string,note:string,table?:Record<string,any>[]):Res=>{
  const g=groups.filter(x=>x.v.length>0);if(!g.length)return none('No data for this selection.');
  return {option:C.dist(title,g,yn,xn,'box'),alts:C.DIST_MODES.map(m=>({label:m.label,option:C.dist(title,g,yn,xn,m.id)})),altsLabel:'Distribution view',note,table}};
const zs=(a:number[])=>{const m=mean(a),s=sd(a);return a.map(x=>s?(x-m)/s:0)};
export const yrs=(r:Row[])=>[...new Set(r.map(x=>x.year))].sort((a,b)=>a-b);
const at=(r:Row[],y:number)=>r.filter(x=>x.year===y);
const v=(x:Row,f:Field)=>x[f] as unknown as number;
const ok=(a:number[])=>a.filter(Number.isFinite);
const sc=(r:Row[],y:number)=>ok(at(r,y).map(x=>x.score));
<<<<<<< HEAD
const trans=(r:Row[],a:number,b:number)=>matched(r,a,b).filter(({a,b})=>a.rankExact&&b.rankExact&&Number.isFinite(a.rank)&&Number.isFinite(b.rank)).map(({a,b})=>({name:a.name,state:a.state,rankA:a.rank,rankB:b.rank,move:a.rank-b.rank,institutionId:a.institutionId}));
=======
const trans=(r:Row[],a:number,b:number)=>{const B=new Map(at(r,b).map(x=>[x.name,x]));
  return at(r,a).filter(x=>B.has(x.name)).map(x=>({name:x.name,state:x.state,rankA:x.rank,rankB:B.get(x.name)!.rank,move:x.rank-B.get(x.name)!.rank}))};
>>>>>>> origin/main
const movers=(up:boolean)=>(r:Row[],p:P):Res=>{
  const t=trans(r,p.y1,p.y2).sort((a,b)=>up?b.move-a.move:a.move-b.move).slice(0,p.n);
  return {option:C.bar(`${up?'Greatest improvement':'Largest decline'} in rank, ${p.y1} → ${p.y2}`,t.map(a=>a.name),t.map(a=>a.move),'Places gained (negative = lost)','Institution',true),table:t,
    alts:[{label:'Bar',option:C.bar(`${up?'Greatest improvement':'Largest decline'} in rank, ${p.y1} → ${p.y2}`,t.map(a=>a.name),t.map(a=>a.move),'Places gained (negative = lost)','Institution',true)},
      {label:'Lollipop',option:C.lollipop(`Rank change, ${p.y1} → ${p.y2}`,t.map(a=>a.name),t.map(a=>a.move),'Places gained (negative = lost)','Institution',true)},
      {label:'Dumbbell',option:C.dumbbell(`Rank in ${p.y1} vs ${p.y2} (1 = best)`,t.map(a=>a.name),t.map(a=>a.rankA),t.map(a=>a.rankB),'Rank (1 = best, left)',String(p.y1),String(p.y2))},
      {label:'Slope',option:C.slope(`Rank slope, ${p.y1} → ${p.y2}`,[p.y1,p.y2],t.map(a=>({name:a.name,a:a.rankA,b:a.rankB})),'Rank (1 = best, top)',true)}],
    note:t.length?`${t[0].name} moved ${t[0].move>=0?'up':'down'} ${Math.abs(t[0].move)} places.`:'No institution appears in both years.'}};
<<<<<<< HEAD
const cnt=(r:Row[],y:number)=>{const m=new Map<string,number>();at(r,y).filter(x=>Number.isFinite(x.rank)&&x.rankUpper<=100).forEach(x=>{const state=normalizeIndiaStateName(x.state)||x.state;if(state!=='Unknown')m.set(state,(m.get(state)||0)+1);});return m};
const indiaCountData=(r:Row[],y:number)=>{const counts=new Map<string,number>();at(r,y).filter(x=>Number.isFinite(x.rank)&&x.rankUpper<=100).forEach(x=>{const state=normalizeIndiaStateName(x.state);if(state)counts.set(state,(counts.get(state)||0)+1);});return INDIA_REGIONS.map(name=>({name,value:counts.get(name)||0}));};
=======
const cnt=(r:Row[],y:number)=>{const m=new Map<string,number>();at(r,y).filter(x=>x.rank<=100).forEach(x=>m.set(x.state,(m.get(x.state)||0)+1));return m};
>>>>>>> origin/main
const pair=(a:Field,b:Field)=>(r:Row[],p:P):Res=>{
  const d=at(r,p.year).filter(x=>Number.isFinite(v(x,a))&&Number.isFinite(v(x,b)));const c=C.corr(d.map(x=>v(x,a)),d.map(x=>v(x,b)));
  const z=(['PR','TLR','GO','OI','score'] as Field[]).find(f=>f!==a&&f!==b&&d.filter(x=>Number.isFinite(v(x,f))).length>=3);
  const sub=`n = ${d.length}; Pearson r = ${R(c)}. Correlation does not imply causation.`;
  return {option:C.scatter(`${a} vs ${b}, ${p.year} (r = ${R(c)})`,d.map(x=>({name:x.name,x:v(x,a),y:v(x,b)})),a,b,true,sub),
    alts:[{label:'Scatter + trend',option:C.scatter(`${a} vs ${b}, ${p.year} (r = ${R(c)})`,d.map(x=>({name:x.name,x:v(x,a),y:v(x,b)})),a,b,true,sub)},{label:'Scatter only',option:C.scatter(`${a} vs ${b}, ${p.year}`,d.map(x=>({name:x.name,x:v(x,a),y:v(x,b)})),a,b,false,sub)},
     ...(z?[{label:`Bubble (${z})`,option:C.bubble(`${a} vs ${b}, ${p.year}`,d.map(x=>({name:x.name,x:v(x,a),y:v(x,b),z:v(x,z)})),a,b,z)}]:[])],
    note:`Pearson r = ${R(c)} over ${d.length} institutions (${Math.abs(c)>.7?'strong':Math.abs(c)>.4?'moderate':'weak'}, ${c>=0?'positive':'negative'} association). This shows association only, not causation.`,table:[{variable_x:a,variable_y:b,r:R(c),n:d.length}]}};
const gap=(a:Field,b:Field)=>(r:Row[],p:P):Res=>{
<<<<<<< HEAD
  const t=at(r,p.year).filter(x=>Number.isFinite(v(x,a))&&Number.isFinite(v(x,b))).map(x=>({name:x.name,rank:x.rankLabel||'Unranked',[a]:v(x,a),[b]:v(x,b),gap:R(v(x,a)-v(x,b))})).sort((s,u)=>u.gap-s.gap).slice(0,p.n);
=======
  const t=at(r,p.year).filter(x=>Number.isFinite(v(x,a))&&Number.isFinite(v(x,b))).map(x=>({name:x.name,rank:x.rank,[a]:v(x,a),[b]:v(x,b),gap:R(v(x,a)-v(x,b))})).sort((s,u)=>u.gap-s.gap).slice(0,p.n);
>>>>>>> origin/main
  return {option:C.bar(`Largest ${a} − ${b} gaps, ${p.year}`,t.map(x=>x.name),t.map(x=>x.gap),`${a} − ${b} (points)`,'Institution',true),table:t,note:t.length?`${t[0].name} has the largest gap (${t[0].gap}).`:'No data.'}};
const q=(id:string,text:string,needs:Field[],params:(keyof P)[]=[],run?:Q['run'],all=false,extra=false):Q=>({id,sec:+id[0]-1,text,needs,params,run,all,extra});
const stat=(f:(a:number[])=>number)=>(r:Row[])=>yrs(r).map(y=>R(f(sc(r,y))));
export const QUESTIONS:Q[]=[
 q('1.1','How has the overall NIRF ranking of a selected institution changed from 2017 to 2025?',['year','name','rank'],['inst'],(r,p)=>{
<<<<<<< HEAD
   const x=r.filter(a=>a.name===p.inst).sort((a,b)=>a.year-b.year),exact=x.filter(a=>a.rankExact&&Number.isFinite(a.rank));
   const chart=C.line(`Exact-rank history of ${p.inst}`,x.map(a=>a.year),[{name:'Exact rank',data:x.map(a=>a.rankExact?a.rank:NaN)}],'Year','Rank (1 = best)',true);
   return {option:chart,table:x.map(a=>({year:a.year,rank:a.rankLabel||'Unranked',exact_rank:a.rankExact?'Yes':'No',score:a.score})),
     note:x.length?`${exact.length} of ${x.length} observations have exact numeric ranks. Rank bands are retained in the table and shown as gaps in the line, rather than being treated as exact places.`:'Institution not found in this category.'}}),
=======
   const x=r.filter(a=>a.name===p.inst).sort((a,b)=>a.year-b.year);
   return {option:C.line(`Rank of ${p.inst}`,x.map(a=>a.year),[{name:'Rank',data:x.map(a=>a.rank)}],'Year','Rank (1 = best)',true),table:x.map(a=>({year:a.year,rank:a.rank,score:a.score})),
     note:x.length?`Ranked in ${x.length} year(s); best rank ${Math.min(...x.map(a=>a.rank))}, latest ${x.at(-1)!.rank} (${x.at(-1)!.year}).`:'Institution not found in this category.'}}),
>>>>>>> origin/main
 q('1.2','Which institutions have shown the greatest improvement in rank over the nine years?',['year','name','rank'],['y1','y2','n'],movers(true)),
 q('1.3','Which institutions have experienced the largest decline in ranking?',['year','name','rank'],['y1','y2','n'],movers(false)),
 q('1.4','How has the average score of institutions changed over time?',['year','score'],[],r=>{const y=yrs(r),d=stat(mean)(r);
   return {option:C.line('Average score by year',y,[{name:'Average score',data:d}],'Year','Average score'),alts:[{label:'Line',option:C.line('Average score by year',y,[{name:'Average score',data:d}],'Year','Average score')},
     {label:'Area (axis from 0)',option:C.line('Average score by year',y,[{name:'Average score',data:d}],'Year','Average score',false,true)},{label:'Bar',option:C.bar('Average score by year',y,d,'Year','Average score')}],table:y.map((a,i)=>({year:a,avg_score:d[i]})),note:`Average score moved from ${d[0]} (${y[0]}) to ${d.at(-1)} (${y.at(-1)}).`}}),
 q('1.5','Which institutions have remained consistently in the top 10 across multiple years?',['year','name','rank'],['k'],(r,p)=>{
<<<<<<< HEAD
   const m=new Map<string,{name:string;years:number}>();r.filter(x=>Number.isFinite(x.rank)&&x.rankUpper<=10).forEach(x=>{const id=identityRow(x),old=m.get(id);m.set(id,{name:x.name,years:(old?.years??0)+1});});
   const t=[...m.values()].filter(x=>x.years>=p.k).sort((a,b)=>b.years-a.years).map(x=>({name:x.name,years_in_top10:x.years}));
   return {option:C.bar(`Institutions with ≥ ${p.k} years in the top 10`,t.map(a=>a.name),t.map(a=>a.years_in_top10),'Years in top 10','Institution',true),table:t,note:`${t.length} institution(s) qualify.`}}),
 q('2.1','Which states have the highest number of institutions in the top 100?',['year','state','rank'],['year'],(r,p)=>{
   const counts=cnt(r,p.year),t=[...counts].sort((a,b)=>b[1]-a[1]);return {option:C.bar(`Institutions in the top 100 by state, ${p.year}`,t.map(a=>a[0]),t.map(a=>a[1]),'State','Institutions'),
     alts:[{label:'Bar',option:C.bar(`Institutions in the top 100 by state, ${p.year}`,t.map(a=>a[0]),t.map(a=>a[1]),'State','Institutions')},{label:'Lollipop',option:C.lollipop(`Institutions in the top 100 by state, ${p.year}`,t.map(a=>a[0]),t.map(a=>a[1]),'State','Institutions')},
      {label:'Donut (share)',option:C.pie(`Share of top-100 places by state, ${p.year}`,t.map(a=>({name:a[0],value:a[1]})))}],table:t.map(([state,institutions])=>({state,institutions})),note:t.length?`${t[0][0]} leads with ${t[0][1]}.`:'No data.',
     extra:[{title:`India state map · Top-100 institutions (${p.year})`,option:C.indiaChoropleth(`Top-100 institutions by state (${p.year})`,indiaCountData(r,p.year)),note:`All 36 states and Union Territories are shown. Labels display each state/UT code and its Top-100 count; hover for the full region name.`}]}}),
 q('2.2','How is the geographical distribution of top-ranked institutions changing from 2017 to 2025?',['year','state','rank'],['year'],(r,p)=>{
   const y=yrs(r),by=y.map(a=>cnt(r,a));
   const current=cnt(r,p.year),mapData=indiaCountData(r,p.year);
   const totals=new Map<string,number>();by.forEach(m=>m.forEach((count,state)=>totals.set(state,(totals.get(state)||0)+count)));
   const topStates=[...totals].sort((a,b)=>b[1]-a[1]).slice(0,7).map(([state])=>state);
   const trendSeries=topStates.map(state=>({name:state,data:by.map(m=>m.get(state)||0)}));
   const trendOption=C.line('Top-100 institutions by state over time',y,trendSeries,'Year','Institutions');
   const table=INDIA_REGIONS.map(state=>({state,top_100_institutions:current.get(state)||0})).sort((a,b)=>b.top_100_institutions-a.top_100_institutions);
   return {option:C.indiaChoropleth(`Top-100 institutions across India, ${p.year}`,mapData),table,
     note:`Map shows all 28 states and 8 Union Territories, including zero counts. Counts include only institutions whose complete rank band is within 1–100. Boundary layer is illustrative, not an authoritative legal boundary.`,
     extra:[{title:'Historical state-wise trend (top 7 by total representation)',option:trendOption,
       table:topStates.flatMap(state=>y.map((year,i)=>({state,year,institutions:by[i].get(state)||0}))),
       note:'The main map and trend use the same category and observed/imputed-row filter.'}]};
 }),
 q('2.3','Which states have improved their representation in the top 100 over time?',['year','state','rank'],['y1','y2'],(r,p)=>{
   const a=cnt(r,p.y1),b=cnt(r,p.y2),t=[...new Set([...a.keys(),...b.keys()])].map(s=>({state:s,[`n_${p.y1}`]:a.get(s)||0,[`n_${p.y2}`]:b.get(s)||0,change:(b.get(s)||0)-(a.get(s)||0)})).sort((x,y)=>y.change-x.change);
   return {option:C.bar(`Change in top-100 representation, ${p.y1} → ${p.y2}`,t.map(x=>x.state),t.map(x=>x.change),'Change in institutions','State',true),table:t,note:t.length?`${t[0].state} gained the most (${t[0].change>=0?'+':''}${t[0].change}).`:'No data.',
     extra:[{title:`India state map · Top-100 institutions (${p.y2})`,option:C.indiaChoropleth(`Top-100 institutions by state (${p.y2})`,indiaCountData(r,p.y2)),note:`The map shows the destination year (${p.y2}) for context. The main chart shows the change between ${p.y1} and ${p.y2}.`}]}}),
 q('2.4','How do the rankings of institutions in Karnataka compare with those in Tamil Nadu?',['year','state','rank'],['s1','s2'],(r,p)=>{
   const y=yrs(r),S=[p.s1,p.s2],med=(s:string)=>y.map(a=>{const x=r.filter(q=>q.year===a&&q.state===s&&q.rankExact).map(q=>q.rank);return x.length?R(median(x)):NaN}),
     top=(s:string)=>y.map(a=>r.filter(q=>q.year===a&&q.state===s&&Number.isFinite(q.rank)&&q.rankUpper<=100).length);
   if(p.s1===p.s2)return none('Choose two different states.');
   const t=y.flatMap(a=>S.map(s=>{const all=r.filter(q=>q.year===a&&q.state===s),x=all.filter(q=>q.rankExact).map(q=>q.rank);return {year:a,state:s,ranked_institutions:all.filter(q=>Number.isFinite(q.rank)).length,in_top_100:all.filter(q=>Number.isFinite(q.rank)&&q.rankUpper<=100).length,best_exact_rank:x.length?Math.min(...x):'–',median_exact_rank:x.length?R(median(x)):'–'}}));
   const latestRows=at(r,p.year),rankGroups=new Map<string,number[]>();latestRows.filter(x=>x.rankExact&&Number.isFinite(x.rank)).forEach(x=>{const state=normalizeIndiaStateName(x.state);if(state)rankGroups.set(state,[...(rankGroups.get(state)||[]),x.rank]);});
   const rankMapData=INDIA_REGIONS.map(state=>{const values=rankGroups.get(state)||[];return {name:state,value:values.length?R(median(values)):null};});
   const rankMapTable=INDIA_REGIONS.map(state=>{const values=rankGroups.get(state)||[];return {state,exact_ranked_institutions:values.length,median_exact_rank:values.length?R(median(values)):'No exact rank data'};}).sort((a,b)=>a.exact_ranked_institutions===b.exact_ranked_institutions?String(a.state).localeCompare(String(b.state)):b.exact_ranked_institutions-a.exact_ranked_institutions);
   return {option:C.line(`Median rank of ranked institutions: ${p.s1} vs ${p.s2}`,y,S.map(s=>({name:s,data:med(s)})),'Year','Median rank (1 = best, axis flipped)',true),
     alts:[{label:'Median rank',option:C.line(`Median rank of ranked institutions: ${p.s1} vs ${p.s2}`,y,S.map(s=>({name:s,data:med(s)})),'Year','Median rank (1 = best, axis flipped)',true)},
       {label:'Top-100 count',option:C.grouped(`Institutions in the top 100: ${p.s1} vs ${p.s2}`,y,S.map(s=>({name:s,data:top(s)})),'Year','Institutions')}],table:t,
     note:`Lower rank = better. Median rank covers only institutions ranked in the selected category; years with no ranked institution for a state show a gap. The map provides a wider geographic view for ${p.year}.`,
     extra:[{title:`India state map · Median exact rank (${p.year})`,option:C.indiaChoropleth(`Median exact rank by state (${p.year})`,rankMapData,{metricLabel:'Median exact NIRF rank',direction:'lower'}),table:rankMapTable,note:`The map uses exact numeric ranks only for ${p.year}. Darker colours indicate a lower (better) median rank. Regions without an exact rank are shown as no data.`}]}}),
 q('2.5','Which states have produced the largest number of newly appearing institutions in the rankings?',['year','state','rank'],[],r=>{
   const y=yrs(r);if(y.length<2)return none('Need at least two years of data.');
   const first=new Map<string,Row>();[...r].filter(x=>Number.isFinite(x.rank)).sort((a,b)=>a.year-b.year).forEach(x=>{const id=identityRow(x);if(!first.has(id))first.set(id,x)});
   const nw=[...first.values()].filter(x=>x.year>y[0]),m=new Map<string,number>();nw.forEach(x=>m.set(x.state,(m.get(x.state)||0)+1));
   const mapCounts=new Map<string,number>();nw.forEach(x=>{const state=normalizeIndiaStateName(x.state);if(state)mapCounts.set(state,(mapCounts.get(state)||0)+1);});
   const t=[...m].sort((a,b)=>b[1]-a[1]).map(([state,new_institutions])=>({state,new_institutions}));
   return {option:C.bar(`Institutions first observed after ${y[0]}, by state`,t.slice(0,15).map(a=>a.state),t.slice(0,15).map(a=>a.new_institutions),'Newly appearing institutions','State',true),
     table:t,note:t.length?`${t[0].state} has the most new entrants (${t[0].new_institutions} of ${nw.length}). These are first observations in the available dataset, not necessarily newly established institutions. Stable institution IDs are used when available; otherwise name, state and city identify a campus.`:'No new institutions found.',
     extra:[{title:'India state map · Newly appearing institutions',option:C.indiaChoropleth(`Institutions first observed after ${y[0]}, by state`,INDIA_REGIONS.map(name=>({name,value:mapCounts.get(name)||0})),{metricLabel:'Newly appearing institutions',direction:'higher'}),note:`The map shows the state-wise count of institutions whose first observed ranking record is after ${y[0]}. This indicates first appearance in the dataset, not the institution's founding year.`}]}}),
=======
   const m=new Map<string,number>();r.filter(x=>x.rank<=10).forEach(x=>m.set(x.name,(m.get(x.name)||0)+1));
   const t=[...m].filter(([,c])=>c>=p.k).sort((a,b)=>b[1]-a[1]).map(([name,years])=>({name,years_in_top10:years}));
   return {option:C.bar(`Institutions with ≥ ${p.k} years in the top 10`,t.map(a=>a.name),t.map(a=>a.years_in_top10),'Years in top 10','Institution',true),table:t,note:`${t.length} institution(s) qualify.`}}),
 q('2.1','Which states have the highest number of institutions in the top 100?',['year','state','rank'],['year'],(r,p)=>{
   const t=[...cnt(r,p.year)].sort((a,b)=>b[1]-a[1]);return {option:C.bar(`Institutions in the top 100 by state, ${p.year}`,t.map(a=>a[0]),t.map(a=>a[1]),'State','Institutions'),
     alts:[{label:'Bar',option:C.bar(`Institutions in the top 100 by state, ${p.year}`,t.map(a=>a[0]),t.map(a=>a[1]),'State','Institutions')},{label:'Lollipop',option:C.lollipop(`Institutions in the top 100 by state, ${p.year}`,t.map(a=>a[0]),t.map(a=>a[1]),'State','Institutions')},
      {label:'Donut (share)',option:C.pie(`Share of top-100 places by state, ${p.year}`,t.map(a=>({name:a[0],value:a[1]})))}],table:t.map(([state,institutions])=>({state,institutions})),note:t.length?`${t[0][0]} leads with ${t[0][1]}.`:'No data.'}}),
 q('2.2','How is the geographical distribution of top-ranked institutions changing from 2017 to 2025?',['year','state','rank'],[],r=>{
   const y=yrs(r),by=y.map(a=>cnt(r,a)),tot=new Map<string,number>();by.forEach(m=>m.forEach((c,s)=>tot.set(s,(tot.get(s)||0)+c)));
   const st=[...tot].filter(([s])=>s!=='Unknown').sort((a,b)=>b[1]-a[1]).slice(0,15).map(a=>a[0]);if(!st.length)return none('No state information for ranked institutions.');
   const cells:[number,number,number][]=[];st.forEach((s,i)=>y.forEach((_,j)=>cells.push([j,i,by[j].get(s)||0])));
   return {option:C.heat('Top-100 institutions per state and year',y,st,cells,'Year','State',{sub:'Count of institutions with rank ≤ 100; darker = more. Showing the 15 states with most top-100 places overall.'}),
     table:st.map(s=>({state:s,...Object.fromEntries(y.map((a,j)=>[String(a),by[j].get(s)||0]))})),note:`Top state overall: ${st[0]} (${tot.get(st[0])} top-100 places summed over ${y.length} years).`}}),
 q('2.3','Which states have improved their representation in the top 100 over time?',['year','state','rank'],['y1','y2'],(r,p)=>{
   const a=cnt(r,p.y1),b=cnt(r,p.y2),t=[...new Set([...a.keys(),...b.keys()])].map(s=>({state:s,[`n_${p.y1}`]:a.get(s)||0,[`n_${p.y2}`]:b.get(s)||0,change:(b.get(s)||0)-(a.get(s)||0)})).sort((x,y)=>y.change-x.change);
   return {option:C.bar(`Change in top-100 representation, ${p.y1} → ${p.y2}`,t.map(x=>x.state),t.map(x=>x.change),'Change in institutions','State',true),table:t,note:t.length?`${t[0].state} gained the most (${t[0].change>=0?'+':''}${t[0].change}).`:'No data.'}}),
 q('2.4','How do the rankings of institutions in Karnataka compare with those in Tamil Nadu?',['year','state','rank'],['s1','s2'],(r,p)=>{
   const y=yrs(r),S=[p.s1,p.s2],med=(s:string)=>y.map(a=>{const x=r.filter(q=>q.year===a&&q.state===s).map(q=>q.rank);return x.length?R(median(x)):NaN}),
     top=(s:string)=>y.map(a=>r.filter(q=>q.year===a&&q.state===s&&q.rank<=100).length);
   if(p.s1===p.s2)return none('Choose two different states.');
   const t=y.flatMap(a=>S.map(s=>{const x=r.filter(q=>q.year===a&&q.state===s).map(q=>q.rank);return {year:a,state:s,ranked_institutions:x.length,in_top_100:x.filter(k=>k<=100).length,best_rank:x.length?Math.min(...x):'–',median_rank:x.length?R(median(x)):'–'}}));
   return {option:C.line(`Median rank of ranked institutions: ${p.s1} vs ${p.s2}`,y,S.map(s=>({name:s,data:med(s)})),'Year','Median rank (1 = best, axis flipped)',true),
     alts:[{label:'Median rank',option:C.line(`Median rank of ranked institutions: ${p.s1} vs ${p.s2}`,y,S.map(s=>({name:s,data:med(s)})),'Year','Median rank (1 = best, axis flipped)',true)},
       {label:'Top-100 count',option:C.grouped(`Institutions in the top 100: ${p.s1} vs ${p.s2}`,y,S.map(s=>({name:s,data:top(s)})),'Year','Institutions')}],table:t,
     note:`Lower rank = better. Median rank covers only institutions ranked in the selected category; years with no ranked institution for a state show a gap.`}}),
 q('2.5','Which states have produced the largest number of newly appearing institutions in the rankings?',['year','state','rank'],[],r=>{
   const y=yrs(r);if(y.length<2)return none('Need at least two years of data.');
   const first=new Map<string,Row>();[...r].sort((a,b)=>a.year-b.year).forEach(x=>{if(!first.has(x.name))first.set(x.name,x)});
   const nw=[...first.values()].filter(x=>x.year>y[0]),m=new Map<string,number>();nw.forEach(x=>m.set(x.state,(m.get(x.state)||0)+1));
   const t=[...m].sort((a,b)=>b[1]-a[1]).map(([state,new_institutions])=>({state,new_institutions}));
   return {option:C.bar(`Institutions first appearing after ${y[0]}, by state`,t.slice(0,15).map(a=>a.state),t.slice(0,15).map(a=>a.new_institutions),'Newly appearing institutions','State',true),
     table:t,note:t.length?`${t[0].state} has the most new entrants (${t[0].new_institutions} of ${nw.length}). Institutions already ranked in ${y[0]} are not "new"; matching is by exact name, so renamed institutions may be counted as new.`:'No new institutions found.'}}),
>>>>>>> origin/main
 q('3.1','What is the distribution of NIRF scores for a selected year?',['year','score'],['year'],(r,p)=>{const s=sc(r,p.year);return {option:C.hist(`Score distribution, ${p.year}`,s,'Score'),alts:[{label:'Histogram',option:C.hist(`Score distribution, ${p.year}`,s,'Score')},{label:'Density (KDE)',option:C.density(`Score density, ${p.year}`,[{name:String(p.year),v:s}],'Score')}],note:`${s.length} institutions; mean ${R(mean(s))}.`}}),
 q('3.2','What is the distribution of overall ranks across all institutions?',['year','rank'],['year'],(r,p)=>{
   const k=at(r,p.year).map(x=>x.rank);if(!k.length)return none('No data.');
   return {option:C.hist(`Rank distribution, ${p.year}`,k,'Rank (1 = best)'),alts:[{label:'Histogram',option:C.hist(`Rank distribution, ${p.year}`,k,'Rank (1 = best)')},{label:'Density (KDE)',option:C.density(`Rank density, ${p.year}`,[{name:String(p.year),v:k}],'Rank')}],
<<<<<<< HEAD
     note:`${k.length} records have a rank value. For rank bands, the lower endpoint is used only as an explicitly labelled numeric proxy; this is not an exact-rank distribution.`}}),
=======
     note:`${k.length} ranked institutions, ranks ${Math.min(...k)}–${Math.max(...k)}. Ranks are ordinal and unique, so this is mostly uniform; banded ranks (e.g. 101–150) are stored as their lower bound.`}}),
>>>>>>> origin/main
 q('3.3','What is the average, median, minimum, and maximum score in a given year?',['year','score'],['year'],(r,p)=>{
   const s=sc(r,p.year),t=[{statistic:'Mean',value:R(mean(s))},{statistic:'Median',value:R(qt(s,.5))},{statistic:'Min',value:R(Math.min(...s))},{statistic:'Max',value:R(Math.max(...s))}];
   return {option:C.bar(`Score summary, ${p.year}`,t.map(x=>x.statistic),t.map(x=>x.value),'Statistic','Score'),table:t,note:`Range ${t[2].value}–${t[3].value}.`}}),
 q('3.4','What percentage of ranked institutions fall into each score quartile?',['year','score'],['year'],(r,p)=>{
   const s=sc(r,p.year),[a,b,c]=[.25,.5,.75].map(x=>qt(s,x)),n=[0,0,0,0];s.forEach(x=>n[x<=a?0:x<=b?1:x<=c?2:3]++);
   const t=['Q1 (lowest)','Q2','Q3','Q4 (highest)'].map((name,i)=>({quartile:name,institutions:n[i],percent:R(n[i]*100/s.length)}));
   return {option:C.pie(`Score quartiles, ${p.year}`,t.map(x=>({name:x.quartile,value:x.institutions}))),alts:[{label:'Donut',option:C.pie(`Score quartiles, ${p.year}`,t.map(x=>({name:x.quartile,value:x.institutions})))},{label:'Pie',option:C.pie(`Score quartiles, ${p.year}`,t.map(x=>({name:x.quartile,value:x.institutions})),false)},{label:'Bar',option:C.bar(`Score quartiles, ${p.year}`,t.map(x=>x.quartile),t.map(x=>x.institutions),'Quartile','Institutions')}],table:t,note:'Quartile cut-offs: '+[a,b,c].map(R).join(' / ')}}),
 q('3.5','How does the spread of scores differ across NIRF categories?',['year','score','category'],['year'],(r,p)=>{
   const g=[...new Set(at(r,p.year).map(x=>x.category))].sort().map(c=>({name:c,v:fin(at(r,p.year).filter(x=>x.category===c).map(x=>x.score)),labels:at(r,p.year).filter(x=>x.category===c&&Number.isFinite(x.score)).map(x=>x.name)}));
   const t=g.filter(x=>x.v.length).map(x=>({category:x.name,n:x.v.length,median:R(median(x.v)),iqr:R(qt(x.v,.75)-qt(x.v,.25)),sd:x.v.length>1?R(sd(x.v)):'–',min:R(Math.min(...x.v)),max:R(Math.max(...x.v))}));
   return distAlts(`Score distribution by category, ${p.year}`,g,'Score','Category',t.length?`Widest IQR: ${[...t].sort((a,b)=>+b.iqr-+a.iqr)[0].category}. Categories with few institutions give unreliable shapes, so n is shown under every label.`:'No data.',t)},true),
 q('4.1','How strongly are Research and Professional Practice (RPC) scores associated with overall scores?',['year','RPC','score'],['year'],pair('RPC','score')),
 q('4.2','How does Perception (PR) relate to overall scores?',['year','PR','score'],['year'],pair('PR','score')),
 q('4.3','Which NIRF parameter has the strongest correlation with the overall score?',['year','score','TLR','RPC','GO','OI','PR'],['year'],(r,p)=>{
   const d=at(r,p.year),t=(['TLR','RPC','GO','OI','PR'] as Field[]).map(f=>{const e=d.filter(x=>Number.isFinite(v(x,f))&&Number.isFinite(x.score));return {parameter:f,r:R(C.corr(e.map(x=>v(x,f)),e.map(x=>x.score)))}}).sort((a,b)=>b.r-a.r);
   return {option:C.bar(`Correlation of each parameter with score, ${p.year}`,t.map(x=>x.parameter),t.map(x=>x.r),'Parameter','Pearson r'),alts:[{label:'Bar',option:C.bar(`Correlation of each parameter with score, ${p.year}`,t.map(x=>x.parameter),t.map(x=>x.r),'Parameter','Pearson r')},{label:'Lollipop',option:C.lollipop(`Correlation of each parameter with score, ${p.year}`,t.map(x=>x.parameter),t.map(x=>x.r),'Parameter','Pearson r')}],table:t,note:`${t[0].parameter} has the strongest correlation (r = ${t[0].r}).`}}),
 q('4.4','How are TLR and RPC scores related across institutions?',['year','TLR','RPC'],['year'],pair('TLR','RPC')),
 q('4.5','Has the correlation between research scores and overall scores changed from 2017 to 2025?',['year','RPC','score'],[],r=>{
   const y=yrs(r),d=y.map(a=>{const e=at(r,a).filter(x=>Number.isFinite(x.RPC)&&Number.isFinite(x.score));return R(C.corr(e.map(x=>x.RPC),e.map(x=>x.score)))});
   return {option:C.line('Correlation of RPC with overall score, by year',y,[{name:'Pearson r',data:d}],'Year','Pearson r'),table:y.map((a,i)=>({year:a,r:d[i]})),note:'Years with fewer than 3 valid rows show NaN.'}}),
 q('4.6','Correlation matrix (correlogram) of all NIRF parameters and the overall score.',['year','score','TLR','RPC','GO','OI','PR'],['year'],(r,p)=>{
   const F=[...PARAMS,'score'] as Field[],d=at(r,p.year),m=F.map(a=>F.map(b=>{const e=d.filter(x=>Number.isFinite(v(x,a))&&Number.isFinite(v(x,b)));return a===b?1:pcorr(e.map(x=>v(x,a)),e.map(x=>v(x,b)))}));
   const pairs=F.flatMap((a,i)=>F.slice(i+1).map((b,k)=>({x:a,y:b,r:R(m[i][i+1+k])}))).sort((a,b)=>Math.abs(b.r)-Math.abs(a.r));
   return {option:C.corrHeat(`Correlation matrix, ${p.year}`,F as string[],m),table:pairs,note:pairs.length?`Strongest pair: ${pairs[0].x}–${pairs[0].y} (r = ${pairs[0].r}). Pairs use institutions with both values; correlation is not causation.`:'No data.'}},false,true),
 q('5.1','How do the top five institutions compare across all five NIRF parameters?',['year','TLR','RPC','GO','OI','PR'],['year','n'],(r,p)=>{
<<<<<<< HEAD
   const d=at(r,p.year).filter(x=>Number.isFinite(x.rank)),top=[...d].sort((a,b)=>a.rank-b.rank).slice(0,Math.min(p.n,8));if(!top.length)return none('No ranked institutions for this year.');
   const mx=PARAMS.map(f=>Math.ceil(Math.max(...fin(d.map(x=>v(x,f))))/5)*5||100),nm=(x:Row)=>`${x.name} (${x.rankLabel||'rank unavailable'})`;
   const t=top.map(x=>({institution:x.name,rank:x.rankLabel||'Unranked',rank_exact:x.rankExact?'Yes':'No',...Object.fromEntries(PARAMS.map(f=>[f,R(v(x,f))]))}));
=======
   const d=at(r,p.year),top=[...d].sort((a,b)=>a.rank-b.rank).slice(0,Math.min(p.n,8));if(!top.length)return none('No data.');
   const mx=PARAMS.map(f=>Math.ceil(Math.max(...fin(d.map(x=>v(x,f))))/5)*5||100),nm=(x:Row)=>`${x.name} (#${x.rank})`;
   const t=top.map(x=>({institution:x.name,rank:x.rank,...Object.fromEntries(PARAMS.map(f=>[f,R(v(x,f))]))}));
>>>>>>> origin/main
   return {option:C.radar(`Top ${top.length} institutions across NIRF parameters, ${p.year}`,PARAMS.map((f,i)=>({name:f,max:mx[i]})),top.map(x=>({name:nm(x),value:PARAMS.map(f=>v(x,f))}))),
     alts:[{label:'Radar',option:C.radar(`Top ${top.length} institutions across NIRF parameters, ${p.year}`,PARAMS.map((f,i)=>({name:f,max:mx[i]})),top.map(x=>({name:nm(x),value:PARAMS.map(f=>v(x,f))})))},
       {label:'Grouped bars',option:C.grouped(`Top ${top.length} institutions across NIRF parameters, ${p.year}`,PARAMS as string[],top.map(x=>({name:nm(x),data:PARAMS.map(f=>v(x,f))})),'Parameter','Score')},
       {label:'Parallel coordinates',option:C.parallel(`Top ${top.length} institutions across NIRF parameters, ${p.year}`,PARAMS.map((f,i)=>({name:f,max:mx[i]})),top.map(x=>({name:nm(x),vals:PARAMS.map(f=>v(x,f))})))}],table:t,
     note:`Radar axes run from 0 to the highest value of each parameter in this category and year (${PARAMS.map((f,i)=>`${f} ${mx[i]}`).join(', ')}). Limited to ${top.length} institutions to stay readable.`}}),
 q('5.2','Which institutions have high research scores but relatively low teaching scores?',['year','RPC','TLR'],['year','n'],gap('RPC','TLR')),
 q('5.3','Which institutions have high teaching scores but relatively low perception scores?',['year','TLR','PR'],['year','n'],gap('TLR','PR')),
 q('5.4','Which institutions have improved their overall scores despite declining scores in one or more parameters?',['year','score','TLR','RPC','GO','OI','PR'],['y1','y2','n'],(r,p)=>{
<<<<<<< HEAD
   const out=matched(r,p.y1,p.y2).flatMap(({a,b})=>{if(!Number.isFinite(a.score)||!Number.isFinite(b.score)||b.score<=a.score)return [];
=======
   const B=new Map(at(r,p.y2).map(x=>[x.name,x])),out=at(r,p.y1).flatMap(a=>{const b=B.get(a.name);if(!b||!Number.isFinite(a.score)||!Number.isFinite(b.score)||b.score<=a.score)return [];
>>>>>>> origin/main
     const dec=PARAMS.filter(f=>Number.isFinite(v(a,f))&&Number.isFinite(v(b,f))&&v(b,f)<v(a,f)).map(f=>`${f} ${R(v(b,f)-v(a,f))}`);return dec.length?[{name:a.name,score_change:R(b.score-a.score),declined_parameters:dec.join(', ')}]:[]}).sort((a,b)=>b.score_change-a.score_change);
   if(!out.length)return none(`No institution improved its overall score between ${p.y1} and ${p.y2} while declining on a parameter.`);const t=out.slice(0,p.n);
   return {option:C.lollipop(`Score gain despite parameter decline, ${p.y1} → ${p.y2}`,t.map(a=>a.name),t.map(a=>a.score_change),'Overall score change (points)','Institution',true),table:out,
     note:`${out.length} institution(s) gained overall score while at least one parameter fell (top ${t.length} charted, all in the table). Parameters are not re-weighted across years, so a rise despite a fall may reflect weight changes.`}}),
 q('5.5','Which institutions have the largest difference between their strongest and weakest parameters?',['year','TLR','RPC','GO','OI','PR'],['year','n'],(r,p)=>{
<<<<<<< HEAD
   const all=at(r,p.year).filter(x=>PARAMS.every(f=>Number.isFinite(v(x,f)))).map(x=>{const s=[...PARAMS].sort((a,b)=>v(x,b)-v(x,a)),hi=s[0],lo=s.at(-1)!;return {name:x.name,rank:x.rankLabel||'Unranked',strongest:`${hi} ${R(v(x,hi))}`,weakest:`${lo} ${R(v(x,lo))}`,hiV:v(x,hi),loV:v(x,lo),gap:R(v(x,hi)-v(x,lo))}}).sort((a,b)=>b.gap-a.gap);
=======
   const all=at(r,p.year).filter(x=>PARAMS.every(f=>Number.isFinite(v(x,f)))).map(x=>{const s=[...PARAMS].sort((a,b)=>v(x,b)-v(x,a)),hi=s[0],lo=s.at(-1)!;return {name:x.name,rank:x.rank,strongest:`${hi} ${R(v(x,hi))}`,weakest:`${lo} ${R(v(x,lo))}`,hiV:v(x,hi),loV:v(x,lo),gap:R(v(x,hi)-v(x,lo))}}).sort((a,b)=>b.gap-a.gap);
>>>>>>> origin/main
   if(!all.length)return none('No institutions have all five parameters.');const t=all.slice(0,p.n);
   return {option:C.dumbbell(`Weakest vs strongest parameter, ${p.year}`,t.map(a=>a.name),t.map(a=>a.loV),t.map(a=>a.hiV),'Parameter score','Weakest','Strongest'),
     alts:[{label:'Dumbbell',option:C.dumbbell(`Weakest vs strongest parameter, ${p.year}`,t.map(a=>a.name),t.map(a=>a.loV),t.map(a=>a.hiV),'Parameter score','Weakest','Strongest')},{label:'Gap (bar)',option:C.bar(`Strongest − weakest parameter, ${p.year}`,t.map(a=>a.name),t.map(a=>a.gap),'Gap (points)','Institution',true)}],
     table:all.map(({hiV,loV,...rest})=>rest),note:`${all[0].name}: ${all[0].strongest} vs ${all[0].weakest}. Assumes the five parameters share a comparable 0–100 scale.`}}),
 q('6.1','How does the score distribution differ between the top 10 and the remaining institutions?',['year','score','rank'],['year'],(r,p)=>{
<<<<<<< HEAD
   const d=at(r,p.year).filter(x=>Number.isFinite(x.score)&&Number.isFinite(x.rank)),a=d.filter(x=>x.rankUpper<=10),b=d.filter(x=>x.rank>10),unknown=d.length-a.length-b.length,g=[{name:'Top 10 (certain)',v:a.map(x=>x.score),labels:a.map(x=>x.name)},{name:'Rank 11+ (certain)',v:b.map(x=>x.score),labels:b.map(x=>x.name)}];
   const t=g.filter(x=>x.v.length).map(x=>({group:x.name,n:x.v.length,median:R(median(x.v)),q1:R(qt(x.v,.25)),q3:R(qt(x.v,.75)),min:R(Math.min(...x.v)),max:R(Math.max(...x.v))}));
   return distAlts(`Score distribution: top 10 vs the rest, ${p.year}`,g,'Score','Group',t.length===2?`Median ${t[0].median} (top 10) vs ${t[1].median} (rank 11+). ${unknown} banded rank(s) crossing the top-10 boundary are excluded. The top-10 group has only ${t[0].n} points, so its shape is indicative only.`:'One group is empty.',t)}),
=======
   const d=at(r,p.year).filter(x=>Number.isFinite(x.score)),a=d.filter(x=>x.rank<=10),b=d.filter(x=>x.rank>10),g=[{name:'Top 10',v:a.map(x=>x.score),labels:a.map(x=>x.name)},{name:'Rank 11+',v:b.map(x=>x.score),labels:b.map(x=>x.name)}];
   const t=g.filter(x=>x.v.length).map(x=>({group:x.name,n:x.v.length,median:R(median(x.v)),q1:R(qt(x.v,.25)),q3:R(qt(x.v,.75)),min:R(Math.min(...x.v)),max:R(Math.max(...x.v))}));
   return distAlts(`Score distribution: top 10 vs the rest, ${p.year}`,g,'Score','Group',t.length===2?`Median ${t[0].median} (top 10) vs ${t[1].median} (rest). The top-10 group has only ${t[0].n} points, so its shape is indicative only.`:'One group is empty.',t)}),
>>>>>>> origin/main
 q('6.2','Are NIRF scores more dispersed in one year than another?',['year','score'],[],r=>{const y=yrs(r),s=stat(sd)(r),i=stat(a=>qt(a,.75)-qt(a,.25))(r);
   return {option:C.line('Score dispersion by year',y,[{name:'Std. deviation',data:s},{name:'IQR',data:i}],'Year','Points'),table:y.map((a,k)=>({year:a,std:s[k],iqr:i[k]})),note:`Most dispersed year: ${y[s.indexOf(Math.max(...s))]} (std ${Math.max(...s)}).`}}),
 q('6.3','Which NIRF parameter exhibits the greatest variability across institutions?',['year','TLR','RPC','GO','OI','PR'],['year'],(r,p)=>{
   const d=at(r,p.year),g=PARAMS.map(f=>{const e=d.filter(x=>Number.isFinite(v(x,f)));return {name:f,v:e.map(x=>v(x,f)),labels:e.map(x=>x.name)}}).filter(x=>x.v.length>1);if(!g.length)return none('No parameter data.');
   const t=g.map(x=>({parameter:x.name,n:x.v.length,mean:R(mean(x.v)),sd:R(sd(x.v)),cv_percent:R(sd(x.v)/mean(x.v)*100),iqr:R(qt(x.v,.75)-qt(x.v,.25))})),s=[...t].sort((a,b)=>b.sd-a.sd)[0],c=[...t].sort((a,b)=>b.cv_percent-a.cv_percent)[0];
   return distAlts(`Distribution of NIRF parameters, ${p.year}`,g,'Parameter score','Parameter',`Largest standard deviation: ${s.parameter} (${s.sd}). Largest relative variation (SD/mean): ${c.parameter} (${c.cv_percent}%).`,t)}),
 q('6.4','How do the median and interquartile range of scores change over time?',['year','score'],[],r=>{const y=yrs(r),a=stat(x=>qt(x,.25))(r),b=stat(x=>qt(x,.5))(r),c=stat(x=>qt(x,.75))(r);
   return {option:C.line('Median and quartiles of score over time',y,[{name:'Q1',data:a},{name:'Median',data:b},{name:'Q3',data:c}],'Year','Score'),table:y.map((t,i)=>({year:t,q1:a[i],median:b[i],q3:c[i],iqr:R(c[i]-a[i])})),note:'IQR = Q3 − Q1.'}}),
 q('6.5','How does the score distribution differ across states?',['year','score','state'],['year','n'],(r,p)=>{
   const d=at(r,p.year).filter(x=>Number.isFinite(x.score)&&x.state!=='Unknown'),m=new Map<string,Row[]>();d.forEach(x=>m.set(x.state,[...(m.get(x.state)||[]),x]));
   const st=[...m].filter(([,a])=>a.length>=5).sort((a,b)=>b[1].length-a[1].length).slice(0,p.n);if(!st.length)return none('No state has at least 5 scored institutions in this year.');
   const g=st.map(([s,a])=>({name:s,v:a.map(x=>x.score),labels:a.map(x=>x.name)})),t=g.map(x=>({state:x.name,n:x.v.length,median:R(median(x.v)),iqr:R(qt(x.v,.75)-qt(x.v,.25)),min:R(Math.min(...x.v)),max:R(Math.max(...x.v))}));
   return distAlts(`Score distribution by state, ${p.year}`,g,'Score','State',`Only states with ≥ 5 scored institutions are shown (top ${st.length} by count). Highest median: ${[...t].sort((a,b)=>b.median-a.median)[0].state}.`,t)}),
 q('7.1','How many institutions moved from the 51–100 band into the top 50 between two selected years?',['year','name','rank'],['y1','y2'],(r,p)=>{
<<<<<<< HEAD
   const entrants=matched(r,p.y1,p.y2).filter(({a,b})=>Number.isFinite(a.rank)&&a.rank>=51&&a.rankUpper<=100&&Number.isFinite(b.rank)&&b.rankUpper<=50)
     .map(({a,b})=>({institution:b.name,state:b.state,rank_in_from_year:a.rankLabel,rank_in_to_year:b.rankLabel,institution_id:a.institutionId??'Not available'}));
   const count=entrants.length;
   return {option:C.bar(`Institutions entering the top 50, ${p.y1} → ${p.y2}`,['Entered Top 50'],[count],'Transition','Institutions'),table:entrants,
     note:`${count} institution(s) moved from a rank wholly within 51–100 in ${p.y1} to a rank wholly within 1–50 in ${p.y2}. Ambiguous rank bands are not counted.`};
 }),
 q('7.2','Which institutions entered or exited the top 10 between consecutive years?',['year','name','rank'],[],r=>{
   const y=yrs(r);if(y.length<2)return none('Need at least two years.');const events:Record<string,any>[]=[],periods:{period:string;entered:number;exited:number}[]=[];
   y.slice(1).forEach((next,i)=>{const prev=y[i],A=new Map(at(r,prev).map(x=>[identityRow(x),x])),B=new Map(at(r,next).map(x=>[identityRow(x),x]));let entered=0,exited=0;
     B.forEach((row,id)=>{const old=A.get(id),nowTop=Number.isFinite(row.rank)&&row.rankUpper<=10,wasTop=!!old&&Number.isFinite(old.rank)&&old.rankUpper<=10;
       if(nowTop&&!wasTop){entered++;events.push({period:`${prev}→${next}`,event:'Entered',institution:row.name,rank_before:old?.rankLabel||'not observed',rank_after:row.rankLabel});}});
     A.forEach((row,id)=>{const now=B.get(id),wasTop=Number.isFinite(row.rank)&&row.rankUpper<=10,nowTop=!!now&&Number.isFinite(now.rank)&&now.rankUpper<=10;
       if(wasTop&&!nowTop){exited++;events.push({period:`${prev}→${next}`,event:'Exited',institution:row.name,rank_before:row.rankLabel,rank_after:now?.rankLabel||'not observed'});}});
     periods.push({period:`${prev}→${next}`,entered,exited});
   });
   return {option:C.grouped('Top-10 entries and exits per year',periods.map(x=>x.period),[{name:'Entered',data:periods.map(x=>x.entered)},{name:'Exited',data:periods.map(x=>x.exited)}],'Period','Institutions'),table:events,
     note:`${events.filter(x=>x.event==='Entered').length} entries and ${events.filter(x=>x.event==='Exited').length} exits. Top-10 membership is counted only when the entire reported rank band is within 1–10. Absence from a year may mean a data gap or a name change.`};
 }),
 q('7.3','What percentage of institutions remained in the same rank band from one year to the next?',['year','name','rank'],['y1','y2'],(r,p)=>{
   const t=matched(r,p.y1,p.y2).map(({a,b})=>({name:a.name,from:bandRow(a),to:bandRow(b)})).filter(x=>x.from>=0&&x.to>=0);if(!t.length)return none('No institutions have rank bands wholly contained in the transition bands in both selected years.');const m=BANDS.map(()=>BANDS.map(()=>0));t.forEach(x=>m[x.from][x.to]++);
   const same=t.filter(x=>x.from===x.to).length,pct=R(same*100/t.length,1),labs=BANDS.map(b=>b[2]),cells:[number,number,number][]=[];labs.forEach((_,i)=>labs.forEach((__,j)=>cells.push([j,i,m[i][j]])));
=======
   const t=trans(r,p.y1,p.y2).filter(x=>x.rankA>=51&&x.rankA<=100),d=[['Top 50',t.filter(x=>x.rankB<=50)],['51–100',t.filter(x=>x.rankB>50&&x.rankB<=100)],['Beyond 100',t.filter(x=>x.rankB>100)]] as const;
   return {option:C.bar(`Where the ${p.y1} 51–100 band ended up in ${p.y2}`,d.map(x=>x[0]),d.map(x=>x[1].length),'Rank band in '+p.y2,'Institutions'),table:d[0][1],note:`${d[0][1].length} institution(s) moved from 51–100 into the top 50 (table). Institutions unranked in ${p.y2} are not counted.`}}),
 q('7.2','Which institutions entered or exited the top 10 between consecutive years?',['year','name','rank'],[],r=>{
   const y=yrs(r);if(y.length<2)return none('Need at least two years.');const t:Record<string,any>[]=[],cntp:{period:string;entered:number;exited:number}[]=[];
   y.slice(1).forEach((b,i)=>{const a=y[i],A=new Map(at(r,a).map(x=>[x.name,x.rank])),B=new Map(at(r,b).map(x=>[x.name,x.rank]));let e=0,x2=0;
     B.forEach((rk,n)=>{if(rk<=10&&!((A.get(n)??999)<=10)){e++;t.push({period:`${a}→${b}`,event:'Entered',institution:n,rank_before:A.get(n)??'unranked',rank_after:rk})}});
     A.forEach((rk,n)=>{if(rk<=10&&!((B.get(n)??999)<=10)){x2++;t.push({period:`${a}→${b}`,event:'Exited',institution:n,rank_before:rk,rank_after:B.get(n)??'unranked'})}});cntp.push({period:`${a}→${b}`,entered:e,exited:x2})});
   return {option:C.grouped('Top-10 entries and exits per year',cntp.map(c=>c.period),[{name:'Entered',data:cntp.map(c=>c.entered)},{name:'Exited',data:cntp.map(c=>c.exited)}],'Period','Institutions'),table:t,
     note:`${t.filter(x=>x.event==='Entered').length} entries and ${t.filter(x=>x.event==='Exited').length} exits in total. "unranked" means the institution is absent from that year's data, which may be a data gap or a name change.`}}),
 q('7.3','What percentage of institutions remained in the same rank band from one year to the next?',['year','name','rank'],['y1','y2'],(r,p)=>{
   const t=trans(r,p.y1,p.y2);if(!t.length)return none('No institution appears in both years.');const m=BANDS.map(()=>BANDS.map(()=>0));t.forEach(x=>m[band(x.rankA)][band(x.rankB)]++);
   const same=t.filter(x=>band(x.rankA)===band(x.rankB)).length,pct=R(same*100/t.length,1),labs=BANDS.map(b=>b[2]),cells:[number,number,number][]=[];labs.forEach((_,i)=>labs.forEach((__,j)=>cells.push([j,i,m[i][j]])));
>>>>>>> origin/main
   const links:{source:string;target:string;value:number}[]=[],nodes=new Set<string>();m.forEach((row,i)=>row.forEach((c,j)=>{if(c){links.push({source:`${p.y1}: ${labs[i]}`,target:`${p.y2}: ${labs[j]}`,value:c});nodes.add(`${p.y1}: ${labs[i]}`);nodes.add(`${p.y2}: ${labs[j]}`)}}));
   const tab=labs.map((l,i)=>({[`${p.y1} band`]:l,...Object.fromEntries(labs.map((q2,j)=>[`→ ${q2}`,m[i][j]]))}));
   return {option:C.heat(`Rank-band transitions, ${p.y1} → ${p.y2}`,labs,labs,cells,`Band in ${p.y2}`,`Band in ${p.y1}`,{sub:'Cell = number of institutions; the diagonal = stayed in the same band'}),
     alts:[{label:'Heatmap',option:C.heat(`Rank-band transitions, ${p.y1} → ${p.y2}`,labs,labs,cells,`Band in ${p.y2}`,`Band in ${p.y1}`,{sub:'Cell = number of institutions; the diagonal = stayed in the same band'})},{label:'Sankey',option:C.sankey(`Rank-band flows, ${p.y1} → ${p.y2}`,[...nodes],links)}],
     table:tab,note:`${pct}% (${same} of ${t.length}) of institutions ranked in both years stayed in the same band (1–10, 11–50, 51–100, 101–200, 201+). Institutions missing from one year are excluded.`}}),
 q('7.4','Which institutions experienced the largest upward and downward rank movements?',['year','name','rank'],['y1','y2','n'],(r,p)=>{
   const m=trans(r,p.y1,p.y2).sort((a,b)=>b.move-a.move),t=[...m.slice(0,p.n),...m.slice(-p.n)];
   return {option:C.bar(`Largest rank movements, ${p.y1} → ${p.y2}`,t.map(a=>a.name),t.map(a=>a.move),'Places gained (negative = lost)','Institution',true),table:t,note:'Top block = biggest gains, bottom block = biggest falls.'}}),
 q('7.5','How many institutions moved up, moved down, or retained their positions each year?',['year','name','rank'],[],r=>{
   const y=yrs(r),t=y.slice(1).map((b,i)=>{const m=trans(r,y[i],b);return {period:`${y[i]}→${b}`,up:m.filter(x=>x.move>0).length,down:m.filter(x=>x.move<0).length,same:m.filter(x=>x.move===0).length}});
   const sr=[{name:'Up',data:t.map(x=>x.up)},{name:'Down',data:t.map(x=>x.down)},{name:'Same',data:t.map(x=>x.same)}];
<<<<<<< HEAD
   return {option:C.stack('Institutions moving up / down / same',t.map(x=>x.period),sr,'Period','Institutions'),alts:[{label:'Stacked',option:C.stack('Institutions moving up / down / same',t.map(x=>x.period),sr,'Period','Institutions')},{label:'Grouped',option:C.grouped('Institutions moving up / down / same',t.map(x=>x.period),sr,'Period','Institutions')},{label:'Stacked area',option:C.line('Institutions moving up / down / same',t.map(x=>x.period),sr,'Period','Institutions',false,true,true)}],table:t,note:'Counts only stable-ID-matched institutions whose rank ranges fit wholly inside one transition band in both years.'}}),
=======
   return {option:C.stack('Institutions moving up / down / same',t.map(x=>x.period),sr,'Period','Institutions'),alts:[{label:'Stacked',option:C.stack('Institutions moving up / down / same',t.map(x=>x.period),sr,'Period','Institutions')},{label:'Grouped',option:C.grouped('Institutions moving up / down / same',t.map(x=>x.period),sr,'Period','Institutions')},{label:'Stacked area',option:C.line('Institutions moving up / down / same',t.map(x=>x.period),sr,'Period','Institutions',false,true,true)}],table:t,note:'Counts only institutions ranked in both years.'}}),
>>>>>>> origin/main
 q('8.1','Which institutions have unusually high research scores relative to their overall scores?',['year','RPC','score'],['year'],(r,p)=>{
   const d=at(r,p.year).filter(x=>Number.isFinite(x.RPC)&&Number.isFinite(x.score));if(d.length<10)return none('Need at least 10 institutions with both RPC and score.');
   const f=linreg(d.map(x=>x.score),d.map(x=>x.RPC)),res=d.map(x=>x.RPC-(f.a+f.b*x.score)),z=zs(res),fl=d.map((x,i)=>({x,z:z[i],e:f.a+f.b*x.score})).filter(a=>a.z>2).sort((a,b)=>b.z-a.z);
   return {option:C.scatter(`RPC vs overall score, ${p.year} (flagged: standardised residual > 2)`,d.map((x,i)=>({name:x.name,x:x.score,y:x.RPC,hi:z[i]>2})),'Overall score','RPC',true,`n = ${d.length}; flagged = RPC more than 2 SD above the value predicted from overall score`),
<<<<<<< HEAD
     table:fl.map(a=>({name:a.x.name,rank:a.x.rankLabel||'Unranked',score:R(a.x.score),RPC:R(a.x.RPC),expected_RPC:R(a.e),z_residual:R(a.z)})),note:`${fl.length} institution(s) flagged. "Expected" RPC comes from a straight-line fit of RPC on overall score; this is a screening rule, not a statistical test.`}}),
=======
     table:fl.map(a=>({name:a.x.name,rank:a.x.rank,score:R(a.x.score),RPC:R(a.x.RPC),expected_RPC:R(a.e),z_residual:R(a.z)})),note:`${fl.length} institution(s) flagged. "Expected" RPC comes from a straight-line fit of RPC on overall score; this is a screening rule, not a statistical test.`}}),
>>>>>>> origin/main
 q('8.2','Which institutions perform substantially better in research than in teaching?',['year','RPC','TLR'],['year'],(r,p)=>{
   const d=at(r,p.year).filter(x=>Number.isFinite(x.RPC)&&Number.isFinite(x.TLR));if(d.length<10)return none('Need at least 10 institutions with both RPC and TLR.');
   const df=d.map(x=>x.RPC-x.TLR),z=zs(df),fl=d.map((x,i)=>({x,d:df[i],z:z[i]})).filter(a=>a.z>2).sort((a,b)=>b.z-a.z);
   return {option:C.scatter(`RPC vs TLR, ${p.year} (flagged: RPC − TLR more than 2 SD above average gap)`,d.map((x,i)=>({name:x.name,x:x.TLR,y:x.RPC,hi:z[i]>2})),'TLR','RPC',false,`n = ${d.length}`),
<<<<<<< HEAD
     table:fl.map(a=>({name:a.x.name,rank:a.x.rankLabel||'Unranked',TLR:R(a.x.TLR),RPC:R(a.x.RPC),gap:R(a.d),z:R(a.z)})),note:`${fl.length} flagged. Mean gap (RPC − TLR) = ${R(mean(df))}, SD ${R(sd(df))}.`}}),
 q('8.3','Which institutions experienced an unusually large year-to-year score change?',['year','name','score'],[],r=>{
   const by=new Map<string,Row[]>();r.forEach(x=>{const id=identityRow(x);by.set(id,[...(by.get(id)||[]),x]);});
   const ch:{name:string;year:number;change:number}[]=[];by.forEach(a=>{a.sort((x,y)=>x.year-y.year);for(let i=1;i<a.length;i++)if(a[i].year!==a[i-1].year&&Number.isFinite(a[i].score)&&Number.isFinite(a[i-1].score))ch.push({name:a[i].name,year:a[i].year,change:R(a[i].score-a[i-1].score)});});
=======
     table:fl.map(a=>({name:a.x.name,rank:a.x.rank,TLR:R(a.x.TLR),RPC:R(a.x.RPC),gap:R(a.d),z:R(a.z)})),note:`${fl.length} flagged. Mean gap (RPC − TLR) = ${R(mean(df))}, SD ${R(sd(df))}.`}}),
 q('8.3','Which institutions experienced an unusually large year-to-year score change?',['year','name','score'],[],r=>{
   const by=new Map<string,Row[]>();r.forEach(x=>by.set(x.name,[...(by.get(x.name)||[]),x]));
   const ch:{name:string;year:number;change:number}[]=[];by.forEach((a,name)=>{a.sort((x,y)=>x.year-y.year);for(let i=1;i<a.length;i++)if(Number.isFinite(a[i].score)&&Number.isFinite(a[i-1].score))ch.push({name,year:a[i].year,change:R(a[i].score-a[i-1].score)})});
>>>>>>> origin/main
   const m=mean(ch.map(x=>x.change)),s=sd(ch.map(x=>x.change)),z=(x:number)=>(x-m)/s,out=ch.filter(x=>Math.abs(z(x.change))>2);
   return {option:C.scatter('Year-to-year score change (outliers: |z| > 2)',ch.map(x=>({name:`${x.name} (${x.year})`,x:x.year,y:x.change,hi:Math.abs(z(x.change))>2})),'Year','Score change',false),
     table:out.sort((a,b)=>Math.abs(b.change)-Math.abs(a.change)),note:`${out.length} of ${ch.length} changes flagged.`}}),
 q('8.4','Which institutions have a strong parameter score but a relatively poor overall rank?',['year','rank','TLR','RPC','GO','OI','PR'],['year','n'],(r,p)=>{
<<<<<<< HEAD
   const d=at(r,p.year).filter(x=>x.rankExact&&Number.isFinite(x.rank));if(d.length<10)return none('Need at least 10 institutions with exact ranks.');const pc=new Map<Field,number[]>(PARAMS.map(f=>[f,fin(d.map(x=>v(x,f))).sort((a,b)=>a-b)]));
   const rows=d.flatMap(x=>{const best=PARAMS.filter(f=>Number.isFinite(v(x,f))).map(f=>{const s=pc.get(f)!;return {f,val:v(x,f),pct:s.filter(k=>k<=v(x,f)).length/s.length*100}}).sort((a,b)=>b.pct-a.pct)[0];return best?[{x,best}]:[]}),mr=median(d.map(x=>x.rank));
   const fl=rows.filter(a=>a.best.pct>=90&&a.x.rank>mr).sort((a,b)=>b.x.rank-a.x.rank);const o=C.scatter(`Best parameter percentile vs overall rank, ${p.year}`,rows.map(a=>({name:a.x.name,x:a.best.pct,y:a.x.rank,hi:a.best.pct>=90&&a.x.rank>mr})),'Percentile of institution’s strongest parameter','Overall rank (1 = best, top)',false,`Flagged: strongest parameter in top 10% AND rank worse than the median rank (${R(mr,0)})`);o.yAxis.inverse=true;
   return {option:o,table:fl.slice(0,Math.max(p.n,10)).map(a=>({name:a.x.name,rank:a.x.rankLabel||'Unranked',strongest_parameter:a.best.f,value:R(a.best.val),percentile:R(a.best.pct,0)})),note:`${fl.length} institution(s) flagged by this definition (strong = top-decile on at least one parameter; poor = rank below the median). Thresholds are my own choice; adjust them if your brief defines them differently.`}}),
 q('8.5','Which institutions have unusually high ranking volatility compared with similar institutions?',['year','name','rank'],['n'],(r,p)=>{
   const by=new Map<string,Row[]>();r.filter(x=>x.rankExact&&Number.isFinite(x.rank)).forEach(x=>{const id=identityRow(x);by.set(id,[...(by.get(id)||[]),x]);});
   const L=[...by.values()].filter(a=>a.length>=3).map(a=>{const k=a.map(x=>x.rank),m=mean(k);return {name:a[0].name,years:a.length,mean_rank:R(m,1),sd_rank:R(sd(k),1),peer:m<=50?'≤50':m<=100?'51–100':m<=200?'101–200':'201+'}});
=======
   const d=at(r,p.year);if(d.length<10)return none('Need at least 10 institutions.');const pc=new Map<Field,number[]>(PARAMS.map(f=>[f,fin(d.map(x=>v(x,f))).sort((a,b)=>a-b)]));
   const rows=d.flatMap(x=>{const best=PARAMS.filter(f=>Number.isFinite(v(x,f))).map(f=>{const s=pc.get(f)!;return {f,val:v(x,f),pct:s.filter(k=>k<=v(x,f)).length/s.length*100}}).sort((a,b)=>b.pct-a.pct)[0];return best?[{x,best}]:[]}),mr=median(d.map(x=>x.rank));
   const fl=rows.filter(a=>a.best.pct>=90&&a.x.rank>mr).sort((a,b)=>b.x.rank-a.x.rank);const o=C.scatter(`Best parameter percentile vs overall rank, ${p.year}`,rows.map(a=>({name:a.x.name,x:a.best.pct,y:a.x.rank,hi:a.best.pct>=90&&a.x.rank>mr})),'Percentile of institution’s strongest parameter','Overall rank (1 = best, top)',false,`Flagged: strongest parameter in top 10% AND rank worse than the median rank (${R(mr,0)})`);o.yAxis.inverse=true;
   return {option:o,table:fl.slice(0,Math.max(p.n,10)).map(a=>({name:a.x.name,rank:a.x.rank,strongest_parameter:a.best.f,value:R(a.best.val),percentile:R(a.best.pct,0)})),note:`${fl.length} institution(s) flagged by this definition (strong = top-decile on at least one parameter; poor = rank below the median). Thresholds are my own choice; adjust them if your brief defines them differently.`}}),
 q('8.5','Which institutions have unusually high ranking volatility compared with similar institutions?',['year','name','rank'],['n'],(r,p)=>{
   const by=new Map<string,Row[]>();r.forEach(x=>by.set(x.name,[...(by.get(x.name)||[]),x]));
   const L=[...by].filter(([,a])=>a.length>=3).map(([name,a])=>{const k=a.map(x=>x.rank),m=mean(k);return {name,years:a.length,mean_rank:R(m,1),sd_rank:R(sd(k),1),peer:m<=50?'≤50':m<=100?'51–100':m<=200?'101–200':'201+'}});
>>>>>>> origin/main
   if(!L.length)return none('No institution appears in at least 3 years.');
   const out=L.map(a=>{const g=L.filter(b=>b.peer===a.peer).map(b=>b.sd_rank);return {...a,z:g.length>=5?R((a.sd_rank-mean(g))/(sd(g)||1)):NaN,peers:g.length}}),fl=out.filter(a=>a.z>=2).sort((a,b)=>b.z-a.z);
   return {option:C.scatter('Rank volatility vs average rank (flagged: z ≥ 2 within peers)',out.map(a=>({name:a.name,x:a.mean_rank,y:a.sd_rank,hi:a.z>=2})),'Mean rank (lower = better)','Std. deviation of rank across years',false,`Peers = institutions with a similar mean rank band; z needs ≥ 5 peers`),
     table:[...out].filter(a=>Number.isFinite(a.z)).sort((a,b)=>b.z-a.z).slice(0,Math.max(p.n,10)),note:`${fl.length} institution(s) flagged. Volatility = standard deviation of rank over the years an institution appears (≥ 3 years).`}}),
];
