import {useMemo,useState} from 'react';
import {useParams} from 'react-router-dom';
import {AlertTriangle} from 'lucide-react';
import ChartRenderer,{DataTable} from '../components/ChartRenderer';
import {Card,ChartTypeSelector,EmptyState,useCat} from '../components/ui';
import {P,QUESTIONS,SECTIONS,yrs} from '../analysis/questions';
import {chartViews} from '../analysis/charts';
import {useStore} from '../store';
const LAB:Record<keyof P,string>={year:'Year',y1:'From year',y2:'To year',inst:'Institution',n:'Top N',k:'Min. years',s1:'State A',s2:'State B'};

export default function Section(){
  const sec=+(useParams().i??0),qs=QUESTIONS.filter(q=>q.sec===sec);
  const [sel,setSel]=useState<Record<number,string>>({}),[ov,setOv]=useState<Partial<P>>({}),[views,setViews]=useState<Record<string,string>>({});
  const {year,report,note,rows:allRows,includeImputed}=useStore(),rows=useCat(),ys=yrs(rows),q=qs.find(x=>x.id===sel[sec])??qs[0];
  const visibleAll=allRows.filter(r=>includeImputed||!r.imputed);
  const top=[...rows].filter(r=>r.year===ys.at(-1)&&Number.isFinite(r.rank)).sort((a,b)=>a.rank-b.rank)[0]?.name??'';
  const states=[...new Set(rows.map(r=>r.state))].filter(x=>x!=='Unknown').sort();
  const p:P={year:year??ys.at(-1)??0,y1:sec===6?ys.at(-2)??ys[0]:ys[0],y2:ys.at(-1)??0,inst:top,n:q.id==='5.1'?5:10,k:3,s1:states.includes('Karnataka')?'Karnataka':states[0]??'',s2:states.includes('Tamil Nadu')?'Tamil Nadu':states[1]??'',...ov};
  const data=q.all?visibleAll:rows;
  const missing=q.needs.filter(f=>!report?.avail.includes(f));
  const noYear=q.params.some(k=>['year','y1','y2'].includes(k))&&q.params.some(k=>['year','y1','y2'].includes(k)&&!data.some(r=>r.year===p[k as 'year'|'y1'|'y2']));
  const res=useMemo(()=>{if(!q.run||missing.length||noYear)return null;try{return {r:q.run(data,p)}}catch(e){return {err:String(e)}}},[q,data,JSON.stringify(p),missing.join(','),noYear]);
  const set=(k:keyof P,v:any)=>setOv(o=>({...o,[k]:v}));
  const r=res?.r;
  const mainViews=r?chartViews(r.option,r.alts):[];
  const mainKey=`main:${q.id}`;
  const mainView=mainViews.find(x=>x.id===views[mainKey])??mainViews[0];
  const isIndiaMap=(option:any)=>!!option?.series?.some((series:any)=>series.type==='map'&&series.map==='india-states');
  const mainIsIndiaMap=isIndiaMap(mainView?.option??r?.option);
  const mapExtras=(r?.extra??[]).map((x,i)=>({x,i,views:chartViews(x.option,x.alts),key:`extra:${q.id}:${i}`})).filter(item=>isIndiaMap(item.views.find(v=>v.id===views[item.key])?.option??item.views[0]?.option??item.x.option));
  const otherExtras=(r?.extra??[]).map((x,i)=>({x,i,views:chartViews(x.option,x.alts),key:`extra:${q.id}:${i}`})).filter(item=>!isIndiaMap(item.views.find(v=>v.id===views[item.key])?.option??item.views[0]?.option??item.x.option));
  return <div className="grid lg:grid-cols-[320px_1fr] gap-4 max-w-[1500px]">
    <Card title={SECTIONS[sec]} className="self-start"><ul className="space-y-0.5">{qs.map(x=><li key={x.id}><button onClick={()=>{setSel(s=>({...s,[sec]:x.id}));setOv({});setViews({});note(`Query executed: ${x.id}`)}}
      className={`w-full text-left px-2 py-1.5 rounded-md text-[13px] leading-snug ${x.id===q.id?'bg-accent-soft text-accent font-medium':'hover:bg-stone-100'} ${x.run?'':'opacity-60'}`}><b className="tabular-nums mr-1.5">{x.id}{x.extra&&'*'}</b>{x.text}</button></li>)}</ul>
      {qs.some(x=>x.extra)&&<p className="text-[11px] text-stone-500 mt-2">* extra analysis beyond the 40 sample questions</p>}</Card>
    <div className="space-y-4 min-w-0">
      <Card><div className="text-xs text-stone-500 mb-1">Question {q.id}</div><h2 className="font-semibold text-navy">{q.text}</h2>
        <div className="flex flex-wrap gap-3 mt-3 text-xs">{q.params.map(k=><label key={k} className="flex items-center gap-1.5 text-stone-500">{LAB[k]}
          {k==='inst'?<select className="inp max-w-56" value={p.inst} onChange={e=>set(k,e.target.value)}>{[...new Set(rows.map(r=>r.name))].sort().map(n=><option key={n}>{n}</option>)}</select>
          :k==='s1'||k==='s2'?<select className="inp" value={p[k]} onChange={e=>set(k,e.target.value)}>{states.map(n=><option key={n}>{n}</option>)}</select>
          :k==='n'||k==='k'?<input type="number" min={1} max={50} className="inp w-16" value={p[k]} onChange={e=>set(k,+e.target.value||1)}/>
          :<select className="inp" value={p[k]} onChange={e=>set(k,+e.target.value)}>{ys.map(y=><option key={y}>{y}</option>)}</select>}</label>)}
          {q.all&&<span className="text-stone-500 self-center">Uses all categories</span>}
        </div>
      </Card>
      {!q.run?<Card><EmptyState title="This question is not implemented yet."/></Card>
      :missing.length?<Card><p className="text-sm flex items-start gap-2 text-amber-800"><AlertTriangle size={16} className="mt-0.5 shrink-0"/>Cannot answer: the active dataset has no usable <b>{missing.join(', ')}</b> column. Check the column mapping in Dataset Manager.</p></Card>
      :noYear?<Card><EmptyState title="No records for the selected year(s)">The selected category has no records in one of the chosen years. Pick another year or category.</EmptyState></Card>
      :res?.err?<Card><p className="text-sm text-red-700">Could not compute this question: {res.err}</p></Card>
      :r&&<>
        {((r.table?.length??0)>0||r.extra?.some(x=>(x.table?.length??0)>0))?<Card title="Result data">
          {(r.table?.length??0)>0&&<><div className="text-xs text-stone-500 mb-1">Main result</div><DataTable rows={r.table??[]}/></>}
          {r.extra?.map((x,i)=>x.table?.length?<div key={i} className="mt-5"><h3 className="text-xs text-stone-500 mb-1">{x.title} — supporting data</h3><DataTable rows={x.table}/></div>:null)}
        </Card>:null}
        {sec===1&&<>
          {mainIsIndiaMap&&<Card title="India map">
            <ChartRenderer option={mainView?.option??r.option} height={500} file={`q${q.id}-india-map`}/>
            <p className="text-sm mt-3 border-l-2 border-accent pl-3"><span className="font-medium text-navy">Interpretation. </span>{r.note}</p>
          </Card>}
          {mapExtras.map(({x,i,views:extraViews,key})=>{
            const active=extraViews.find(v=>v.id===views[key])??extraViews[0];
            return <Card key={key} title={x.title} right={extraViews.length>1?<ChartTypeSelector label="Graph type" value={active?.id??'default'} onChange={v=>setViews(s=>({...s,[key]:v}))} options={extraViews.map(v=>({id:v.id,label:v.label}))}/>:undefined}>
              <ChartRenderer option={active?.option??x.option} height={500} file={`q${q.id}-india-map-${i}`}/>
              {x.note&&<p className="text-sm mt-3 border-l-2 border-accent pl-3">{x.note}</p>}
            </Card>;
          })}
        </>}
        {(!mainIsIndiaMap||sec!==1)&&<Card title="Visual analysis" right={mainViews.length>1?<ChartTypeSelector label="Graph type" value={mainView?.id??'default'} onChange={v=>setViews(s=>({...s,[mainKey]:v}))} options={mainViews.map(x=>({id:x.id,label:x.label}))}/>:undefined}>
          <ChartRenderer option={mainView?.option??r.option} height={360} file={`q${q.id}`}/>
          <p className="text-sm mt-3 border-l-2 border-accent pl-3"><span className="font-medium text-navy">Interpretation. </span>{r.note}</p>
        </Card>}
        {(sec===1?otherExtras:(r.extra??[]).map((x,i)=>({x,i,views:chartViews(x.option,x.alts),key:`extra:${q.id}:${i}`}))).map(({x,i,views:extraViews,key})=>{
          const active=extraViews.find(v=>v.id===views[key])??extraViews[0];
          return <Card key={key} title={x.title} right={extraViews.length>1?<ChartTypeSelector label="Graph type" value={active?.id??'default'} onChange={v=>setViews(s=>({...s,[key]:v}))} options={extraViews.map(v=>({id:v.id,label:v.label}))}/>:undefined}>
            <ChartRenderer option={active?.option??x.option} height={360}/>
            {x.note&&<p className="text-sm mt-3 border-l-2 border-accent pl-3">{x.note}</p>}
          </Card>;
        })}
      </>}
      {sec===1&&<p className="text-[11px] text-stone-500 px-1">India boundary source: DataMeet / GeoDataViewer India states GeoJSON. The boundary layer is illustrative (2011-vintage) and is not an authoritative legal boundary; the first map load requires an internet connection.</p>}
    </div>
  </div>;
}
