import {NavLink,Outlet,useLocation} from 'react-router-dom';
import {LayoutDashboard,TrendingUp,Map,BarChart3,Activity,Layers,Sigma,ArrowUpDown,AlertTriangle,SlidersHorizontal,MessageSquare,Database,PanelLeft,RotateCcw,GraduationCap,X,FileSpreadsheet} from 'lucide-react';
import {useStore} from '../store';
import {yrs} from '../analysis/questions';
export const NAV=[{to:'/',label:'Overview',icon:LayoutDashboard},{to:'/s/0',label:'Time-Series Analysis',icon:TrendingUp},{to:'/s/1',label:'Geographical Analysis',icon:Map},
 {to:'/s/2',label:'Univariate Analysis',icon:BarChart3},{to:'/s/3',label:'Correlation Analysis',icon:Activity},{to:'/s/4',label:'Multivariate Analysis',icon:Layers},
 {to:'/s/5',label:'Statistical Comparisons',icon:Sigma},{to:'/s/6',label:'Ranking Transitions',icon:ArrowUpDown},{to:'/s/7',label:'Outlier Detection',icon:AlertTriangle},
 {to:'/explore',label:'Chart Explorer',icon:SlidersHorizontal},{to:'/ai',label:'AI Query Assistant',icon:MessageSquare},{to:'/data',label:'Dataset Manager',icon:Database}];
export default function Layout(){
  const s=useStore(),loc=useLocation(),title=NAV.find(n=>n.to===loc.pathname)?.label??NAV.find(n=>loc.pathname.startsWith(n.to)&&n.to!=='/')?.label??'';
<<<<<<< HEAD
  const visibleRows=s.rows.filter(r=>s.includeImputed||!r.imputed),years=yrs(visibleRows),cats=[...new Set(visibleRows.map(r=>r.category))].sort(),ds=s.files.map(f=>f.name).join(', ');
=======
  const years=yrs(s.rows),cats=[...new Set(s.rows.map(r=>r.category))].sort(),ds=s.files.map(f=>f.name).join(', ');
>>>>>>> origin/main
  return <div className="flex h-screen">
    <aside className={`${s.collapsed?'w-14':'w-60'} shrink-0 bg-navy text-blue-100 flex flex-col transition-[width] duration-150`}>
      <div className="h-14 flex items-center gap-2 px-3 border-b border-white/10"><GraduationCap size={22} className="text-sky-300 shrink-0"/>{!s.collapsed&&<div className="leading-tight"><div className="font-semibold text-white tracking-tight">NIRF Analytics</div><div className="text-[10px] text-blue-300">Ranking insights 2017–2025</div></div>}</div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" aria-label="Main">{NAV.map(n=><NavLink key={n.to} to={n.to} end={n.to==='/'} title={n.label}
        className={({isActive})=>`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] ${isActive?'bg-white/15 text-white font-medium border-l-2 border-sky-300':'text-blue-200 hover:bg-white/10'}`}>
        <n.icon size={16} className="shrink-0"/>{!s.collapsed&&n.label}</NavLink>)}</nav>
      <div className="p-2 border-t border-white/10 text-xs text-blue-300 flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${s.rows.length?'bg-sky-300':'bg-blue-400/40'}`}/>{!s.collapsed&&(s.rows.length?`${s.rows.length.toLocaleString()} records`:'No dataset')}
        <button className="ml-auto p-1 hover:bg-white/10 rounded" onClick={s.toggle} aria-label="Collapse sidebar"><PanelLeft size={16}/></button></div>
    </aside>
    <div className="flex-1 flex flex-col min-w-0">
      <header className="bg-white border-b border-stone-200 px-5 py-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <div><h1 className="text-base font-semibold text-navy leading-tight">{title}</h1>
          <div className="text-[11px] text-stone-500 flex items-center gap-1"><FileSpreadsheet size={11}/>{ds||'No dataset loaded'}</div></div>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs">
          {s.state&&<button className="inline-flex items-center gap-1 rounded-full bg-accent-soft text-accent px-2.5 py-1 font-medium" onClick={()=>s.setState(null)} title="Clear cross-filter">State: {s.state}<X size={12}/></button>}
          <label className="text-stone-500" htmlFor="yr">Year</label><select id="yr" className="inp" disabled={!years.length} value={s.year??''} onChange={e=>s.setYear(+e.target.value)}>{years.map(y=><option key={y}>{y}</option>)}</select>
          <label className="text-stone-500" htmlFor="ct">Category</label><select id="ct" className="inp" disabled={!cats.length} value={s.category} onChange={e=>s.setCategory(e.target.value)}>{cats.map(c=><option key={c}>{c}</option>)}</select>
<<<<<<< HEAD
          <label className="inline-flex items-center gap-1.5 text-stone-500" title="Rows with values estimated during preprocessing are excluded by default"><input type="checkbox" checked={s.includeImputed} onChange={e=>s.setIncludeImputed(e.target.checked)}/> Include estimated rows</label>
=======
>>>>>>> origin/main
          <button className="btn" onClick={s.reset} disabled={!s.rows.length}><RotateCcw size={13}/>Reset filters</button></div>
      </header>
      <main className="flex-1 overflow-y-auto p-5 bg-paper"><Outlet/></main></div></div>;}
