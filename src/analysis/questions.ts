import {Field,Row} from '../types';
import * as C from './charts';
const {R}=C;
export interface P{year:number;y1:number;y2:number;inst:string;n:number;k:number}
export interface Res{option:any;table?:Record<string,any>[];note:string}
export interface Q{id:string;sec:number;text:string;needs:Field[];params:(keyof P)[];run?:(r:Row[],p:P)=>Res}
export const SECTIONS=['Time-series and trend analysis','Geospatial and regional analysis','Univariate analysis','Bivariate analysis and correlation','Multivariate analysis','Distribution and statistical comparison','Ranking transitions and institutional mobility','Outlier detection and performance gaps'];
const mean=(a:number[])=>a.reduce((s,x)=>s+x,0)/a.length;
const qt=(a:number[],p:number)=>{const s=[...a].sort((x,y)=>x-y),i=(s.length-1)*p,l=Math.floor(i);return s[l]+(s[Math.ceil(i)]-s[l])*(i-l)};
const sd=(a:number[])=>{const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))};
export const yrs=(r:Row[])=>[...new Set(r.map(x=>x.year))].sort((a,b)=>a-b);
const at=(r:Row[],y:number)=>r.filter(x=>x.year===y);
const v=(x:Row,f:Field)=>x[f] as unknown as number;
const ok=(a:number[])=>a.filter(Number.isFinite);
const sc=(r:Row[],y:number)=>ok(at(r,y).map(x=>x.score));
const trans=(r:Row[],a:number,b:number)=>{const B=new Map(at(r,b).map(x=>[x.name,x]));
  return at(r,a).filter(x=>B.has(x.name)).map(x=>({name:x.name,state:x.state,rankA:x.rank,rankB:B.get(x.name)!.rank,move:x.rank-B.get(x.name)!.rank}))};
const movers=(up:boolean)=>(r:Row[],p:P):Res=>{
  const t=trans(r,p.y1,p.y2).sort((a,b)=>up?b.move-a.move:a.move-b.move).slice(0,p.n);
  return {option:C.bar(`${up?'Greatest improvement':'Largest decline'} in rank, ${p.y1} → ${p.y2}`,t.map(a=>a.name),t.map(a=>a.move),'Places gained (negative = lost)','Institution',true),table:t,
    note:t.length?`${t[0].name} moved ${t[0].move>=0?'up':'down'} ${Math.abs(t[0].move)} places.`:'No institution appears in both years.'}};
const cnt=(r:Row[],y:number)=>{const m=new Map<string,number>();at(r,y).filter(x=>x.rank<=100).forEach(x=>m.set(x.state,(m.get(x.state)||0)+1));return m};
const pair=(a:Field,b:Field)=>(r:Row[],p:P):Res=>{
  const d=at(r,p.year).filter(x=>Number.isFinite(v(x,a))&&Number.isFinite(v(x,b)));const c=C.corr(d.map(x=>v(x,a)),d.map(x=>v(x,b)));
  return {option:C.scatter(`${a} vs ${b}, ${p.year} (r = ${R(c)})`,d.map(x=>({name:x.name,x:v(x,a),y:v(x,b)})),a,b),
    note:`Pearson r = ${R(c)} over ${d.length} institutions (${Math.abs(c)>.7?'strong':Math.abs(c)>.4?'moderate':'weak'} association).`,table:[{variable_x:a,variable_y:b,r:R(c),n:d.length}]}};
const gap=(a:Field,b:Field)=>(r:Row[],p:P):Res=>{
  const t=at(r,p.year).filter(x=>Number.isFinite(v(x,a))&&Number.isFinite(v(x,b))).map(x=>({name:x.name,rank:x.rank,[a]:v(x,a),[b]:v(x,b),gap:R(v(x,a)-v(x,b))})).sort((s,u)=>u.gap-s.gap).slice(0,p.n);
  return {option:C.bar(`Largest ${a} − ${b} gaps, ${p.year}`,t.map(x=>x.name),t.map(x=>x.gap),`${a} − ${b} (points)`,'Institution',true),table:t,note:t.length?`${t[0].name} has the largest gap (${t[0].gap}).`:'No data.'}};
const q=(id:string,text:string,needs:Field[],params:(keyof P)[]=[],run?:Q['run']):Q=>({id,sec:+id[0]-1,text,needs,params,run});
const stat=(f:(a:number[])=>number)=>(r:Row[])=>yrs(r).map(y=>R(f(sc(r,y))));
export const QUESTIONS:Q[]=[
 q('1.1','How has the overall NIRF ranking of a selected institution changed from 2017 to 2025?',['year','name','rank'],['inst'],(r,p)=>{
   const x=r.filter(a=>a.name===p.inst).sort((a,b)=>a.year-b.year);
   return {option:C.line(`Rank of ${p.inst}`,x.map(a=>a.year),[{name:'Rank',data:x.map(a=>a.rank)}],'Year','Rank (1 = best)',true),table:x.map(a=>({year:a.year,rank:a.rank,score:a.score})),
     note:x.length?`Ranked in ${x.length} year(s); best rank ${Math.min(...x.map(a=>a.rank))}, latest ${x.at(-1)!.rank} (${x.at(-1)!.year}).`:'Institution not found in this category.'}}),
 q('1.2','Which institutions have shown the greatest improvement in rank over the nine years?',['year','name','rank'],['y1','y2','n'],movers(true)),
 q('1.3','Which institutions have experienced the largest decline in ranking?',['year','name','rank'],['y1','y2','n'],movers(false)),
 q('1.4','How has the average score of institutions changed over time?',['year','score'],[],r=>{const y=yrs(r),d=stat(mean)(r);
   return {option:C.line('Average score by year',y,[{name:'Average score',data:d}],'Year','Average score'),table:y.map((a,i)=>({year:a,avg_score:d[i]})),note:`Average score moved from ${d[0]} (${y[0]}) to ${d.at(-1)} (${y.at(-1)}).`}}),
 q('1.5','Which institutions have remained consistently in the top 10 across multiple years?',['year','name','rank'],['k'],(r,p)=>{
   const m=new Map<string,number>();r.filter(x=>x.rank<=10).forEach(x=>m.set(x.name,(m.get(x.name)||0)+1));
   const t=[...m].filter(([,c])=>c>=p.k).sort((a,b)=>b[1]-a[1]).map(([name,years])=>({name,years_in_top10:years}));
   return {option:C.bar(`Institutions with ≥ ${p.k} years in the top 10`,t.map(a=>a.name),t.map(a=>a.years_in_top10),'Years in top 10','Institution',true),table:t,note:`${t.length} institution(s) qualify.`}}),
 q('2.1','Which states have the highest number of institutions in the top 100?',['year','state','rank'],['year'],(r,p)=>{
   const t=[...cnt(r,p.year)].sort((a,b)=>b[1]-a[1]);return {option:C.bar(`Institutions in the top 100 by state, ${p.year}`,t.map(a=>a[0]),t.map(a=>a[1]),'State','Institutions'),table:t.map(([state,institutions])=>({state,institutions})),note:t.length?`${t[0][0]} leads with ${t[0][1]}.`:'No data.'}}),
 q('2.2','How is the geographical distribution of top-ranked institutions changing from 2017 to 2025?',['year','state','rank']),
 q('2.3','Which states have improved their representation in the top 100 over time?',['year','state','rank'],['y1','y2'],(r,p)=>{
   const a=cnt(r,p.y1),b=cnt(r,p.y2),t=[...new Set([...a.keys(),...b.keys()])].map(s=>({state:s,[`n_${p.y1}`]:a.get(s)||0,[`n_${p.y2}`]:b.get(s)||0,change:(b.get(s)||0)-(a.get(s)||0)})).sort((x,y)=>y.change-x.change);
   return {option:C.bar(`Change in top-100 representation, ${p.y1} → ${p.y2}`,t.map(x=>x.state),t.map(x=>x.change),'Change in institutions','State',true),table:t,note:t.length?`${t[0].state} gained the most (${t[0].change>=0?'+':''}${t[0].change}).`:'No data.'}}),
 q('2.4','How do the rankings of institutions in Karnataka compare with those in Tamil Nadu?',['year','state','rank']),
 q('2.5','Which states have produced the largest number of newly appearing institutions in the rankings?',['year','state','rank']),
 q('3.1','What is the distribution of NIRF scores for a selected year?',['year','score'],['year'],(r,p)=>{const s=sc(r,p.year);return {option:C.hist(`Score distribution, ${p.year}`,s,'Score'),note:`${s.length} institutions; mean ${R(mean(s))}.`}}),
 q('3.2','What is the distribution of overall ranks across all institutions?',['year','rank']),
 q('3.3','What is the average, median, minimum, and maximum score in a given year?',['year','score'],['year'],(r,p)=>{
   const s=sc(r,p.year),t=[{statistic:'Mean',value:R(mean(s))},{statistic:'Median',value:R(qt(s,.5))},{statistic:'Min',value:R(Math.min(...s))},{statistic:'Max',value:R(Math.max(...s))}];
   return {option:C.bar(`Score summary, ${p.year}`,t.map(x=>x.statistic),t.map(x=>x.value),'Statistic','Score'),table:t,note:`Range ${t[2].value}–${t[3].value}.`}}),
 q('3.4','What percentage of ranked institutions fall into each score quartile?',['year','score'],['year'],(r,p)=>{
   const s=sc(r,p.year),[a,b,c]=[.25,.5,.75].map(x=>qt(s,x)),n=[0,0,0,0];s.forEach(x=>n[x<=a?0:x<=b?1:x<=c?2:3]++);
   const t=['Q1 (lowest)','Q2','Q3','Q4 (highest)'].map((name,i)=>({quartile:name,institutions:n[i],percent:R(n[i]*100/s.length)}));
   return {option:C.pie(`Score quartiles, ${p.year}`,t.map(x=>({name:x.quartile,value:x.institutions}))),table:t,note:'Quartile cut-offs: '+[a,b,c].map(R).join(' / ')}}),
 q('3.5','How does the spread of scores differ across NIRF categories?',['year','score','category']),
 q('4.1','How strongly are Research and Professional Practice (RPC) scores associated with overall scores?',['year','RPC','score'],['year'],pair('RPC','score')),
 q('4.2','How does Perception (PR) relate to overall scores?',['year','PR','score'],['year'],pair('PR','score')),
 q('4.3','Which NIRF parameter has the strongest correlation with the overall score?',['year','score','TLR','RPC','GO','OI','PR'],['year'],(r,p)=>{
   const d=at(r,p.year),t=(['TLR','RPC','GO','OI','PR'] as Field[]).map(f=>{const e=d.filter(x=>Number.isFinite(v(x,f))&&Number.isFinite(x.score));return {parameter:f,r:R(C.corr(e.map(x=>v(x,f)),e.map(x=>x.score)))}}).sort((a,b)=>b.r-a.r);
   return {option:C.bar(`Correlation of each parameter with score, ${p.year}`,t.map(x=>x.parameter),t.map(x=>x.r),'Parameter','Pearson r'),table:t,note:`${t[0].parameter} has the strongest correlation (r = ${t[0].r}).`}}),
 q('4.4','How are TLR and RPC scores related across institutions?',['year','TLR','RPC'],['year'],pair('TLR','RPC')),
 q('4.5','Has the correlation between research scores and overall scores changed from 2017 to 2025?',['year','RPC','score'],[],r=>{
   const y=yrs(r),d=y.map(a=>{const e=at(r,a).filter(x=>Number.isFinite(x.RPC)&&Number.isFinite(x.score));return R(C.corr(e.map(x=>x.RPC),e.map(x=>x.score)))});
   return {option:C.line('Correlation of RPC with overall score, by year',y,[{name:'Pearson r',data:d}],'Year','Pearson r'),table:y.map((a,i)=>({year:a,r:d[i]})),note:'Years with fewer than 3 valid rows show NaN.'}}),
 q('5.1','How do the top five institutions compare across all five NIRF parameters?',['year','TLR','RPC','GO','OI','PR']),
 q('5.2','Which institutions have high research scores but relatively low teaching scores?',['year','RPC','TLR'],['year','n'],gap('RPC','TLR')),
 q('5.3','Which institutions have high teaching scores but relatively low perception scores?',['year','TLR','PR'],['year','n'],gap('TLR','PR')),
 q('5.4','Which institutions have improved their overall scores despite declining scores in one or more parameters?',['year','score','TLR','RPC','GO','OI','PR']),
 q('5.5','Which institutions have the largest difference between their strongest and weakest parameters?',['year','TLR','RPC','GO','OI','PR']),
 q('6.1','How does the score distribution differ between the top 10 and the remaining institutions?',['year','score','rank']),
 q('6.2','Are NIRF scores more dispersed in one year than another?',['year','score'],[],r=>{const y=yrs(r),s=stat(sd)(r),i=stat(a=>qt(a,.75)-qt(a,.25))(r);
   return {option:C.line('Score dispersion by year',y,[{name:'Std. deviation',data:s},{name:'IQR',data:i}],'Year','Points'),table:y.map((a,k)=>({year:a,std:s[k],iqr:i[k]})),note:`Most dispersed year: ${y[s.indexOf(Math.max(...s))]} (std ${Math.max(...s)}).`}}),
 q('6.3','Which NIRF parameter exhibits the greatest variability across institutions?',['year','TLR','RPC','GO','OI','PR']),
 q('6.4','How do the median and interquartile range of scores change over time?',['year','score'],[],r=>{const y=yrs(r),a=stat(x=>qt(x,.25))(r),b=stat(x=>qt(x,.5))(r),c=stat(x=>qt(x,.75))(r);
   return {option:C.line('Median and quartiles of score over time',y,[{name:'Q1',data:a},{name:'Median',data:b},{name:'Q3',data:c}],'Year','Score'),table:y.map((t,i)=>({year:t,q1:a[i],median:b[i],q3:c[i],iqr:R(c[i]-a[i])})),note:'IQR = Q3 − Q1.'}}),
 q('6.5','How does the score distribution differ across states?',['year','score','state']),
 q('7.1','How many institutions moved from the 51–100 band into the top 50 between two selected years?',['year','name','rank'],['y1','y2'],(r,p)=>{
   const t=trans(r,p.y1,p.y2).filter(x=>x.rankA>=51&&x.rankA<=100),d=[['Top 50',t.filter(x=>x.rankB<=50)],['51–100',t.filter(x=>x.rankB>50&&x.rankB<=100)],['Beyond 100',t.filter(x=>x.rankB>100)]] as const;
   return {option:C.bar(`Where the ${p.y1} 51–100 band ended up in ${p.y2}`,d.map(x=>x[0]),d.map(x=>x[1].length),'Rank band in '+p.y2,'Institutions'),table:d[0][1],note:`${d[0][1].length} institution(s) moved from 51–100 into the top 50 (table). Institutions unranked in ${p.y2} are not counted.`}}),
 q('7.2','Which institutions entered or exited the top 10 between consecutive years?',['year','name','rank']),
 q('7.3','What percentage of institutions remained in the same rank band from one year to the next?',['year','name','rank']),
 q('7.4','Which institutions experienced the largest upward and downward rank movements?',['year','name','rank'],['y1','y2','n'],(r,p)=>{
   const m=trans(r,p.y1,p.y2).sort((a,b)=>b.move-a.move),t=[...m.slice(0,p.n),...m.slice(-p.n)];
   return {option:C.bar(`Largest rank movements, ${p.y1} → ${p.y2}`,t.map(a=>a.name),t.map(a=>a.move),'Places gained (negative = lost)','Institution',true),table:t,note:'Top block = biggest gains, bottom block = biggest falls.'}}),
 q('7.5','How many institutions moved up, moved down, or retained their positions each year?',['year','name','rank'],[],r=>{
   const y=yrs(r),t=y.slice(1).map((b,i)=>{const m=trans(r,y[i],b);return {period:`${y[i]}→${b}`,up:m.filter(x=>x.move>0).length,down:m.filter(x=>x.move<0).length,same:m.filter(x=>x.move===0).length}});
   return {option:C.stack('Institutions moving up / down / same',t.map(x=>x.period),[{name:'Up',data:t.map(x=>x.up)},{name:'Down',data:t.map(x=>x.down)},{name:'Same',data:t.map(x=>x.same)}],'Period','Institutions'),table:t,note:'Counts only institutions ranked in both years.'}}),
 q('8.1','Which institutions have unusually high research scores relative to their overall scores?',['year','RPC','score']),
 q('8.2','Which institutions perform substantially better in research than in teaching?',['year','RPC','TLR']),
 q('8.3','Which institutions experienced an unusually large year-to-year score change?',['year','name','score'],[],r=>{
   const by=new Map<string,Row[]>();r.forEach(x=>by.set(x.name,[...(by.get(x.name)||[]),x]));
   const ch:{name:string;year:number;change:number}[]=[];by.forEach((a,name)=>{a.sort((x,y)=>x.year-y.year);for(let i=1;i<a.length;i++)if(Number.isFinite(a[i].score)&&Number.isFinite(a[i-1].score))ch.push({name,year:a[i].year,change:R(a[i].score-a[i-1].score)})});
   const m=mean(ch.map(x=>x.change)),s=sd(ch.map(x=>x.change)),z=(x:number)=>(x-m)/s,out=ch.filter(x=>Math.abs(z(x.change))>2);
   return {option:C.scatter('Year-to-year score change (outliers: |z| > 2)',ch.map(x=>({name:`${x.name} (${x.year})`,x:x.year,y:x.change,hi:Math.abs(z(x.change))>2})),'Year','Score change',false),
     table:out.sort((a,b)=>Math.abs(b.change)-Math.abs(a.change)),note:`${out.length} of ${ch.length} changes flagged.`}}),
 q('8.4','Which institutions have a strong parameter score but a relatively poor overall rank?',['year','rank','TLR','RPC','GO','OI','PR']),
 q('8.5','Which institutions have unusually high ranking volatility compared with similar institutions?',['year','name','rank']),
];
