import {NavLink,Outlet,useLocation} from 'react-router-dom';
import {LayoutDashboard,TrendingUp,Map,BarChart3,Activity,Layers,Sigma,ArrowUpDown,AlertTriangle,SlidersHorizontal,MessageSquare,Database,PanelLeft,RotateCcw,GraduationCap} from 'lucide-react';
import {useStore} from '../store';
import {yrs} from '../analysis/questions';
export const NAV=[{to:'/',label:'Overview',icon:LayoutDashboard},{to:'/s/0',label:'Time-Series Analysis',icon:TrendingUp},{to:'/s/1',label:'Geographical Analysis',icon:Map},
 {to:'/s/2',label:'Univariate Analysis',icon:BarChart3},{to:'/s/3',label:'Correlation Analysis',icon:Activity},{to:'/s/4',label:'Multivariate Analysis',icon:Layers},
 {to:'/s/5',label:'Statistical Comparisons',icon:Sigma},{to:'/s/6',label:'Ranking Transitions',icon:ArrowUpDown},{to:'/s/7',label:'Outlier Detection',icon:AlertTriangle},
 {to:'/explore',label:'Dynamic Query Explorer',icon:SlidersHorizontal},{to:'/ai',label:'AI Query Assistant',icon:MessageSquare},{to:'/data',label:'Dataset Manager',icon:Database}];
export default function Layout(){
  const s=useStore(),loc=useLocation(),title=NAV.find(n=>n.to===loc.pathname)?.label??NAV.find(n=>loc.pathname.startsWith(n.to)&&n.to!=='/')?.label??'';
  const years=yrs(s.rows),cats=[...new Set(s.rows.map(r=>r.category))].sort();
  return <div className="flex h-screen">
    <aside className={`${s.collapsed?'w-14':'w-60'} shrink-0 bg-white border-r border-stone-200 flex flex-col transition-[width] duration-150`}>
      <div className="h-12 flex items-center gap-2 px-3 border-b border-stone-200"><GraduationCap size={20} className="text-accent shrink-0"/>{!s.collapsed&&<span className="font-semibold tracking-tight">NIRF Analytics</span>}</div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">{NAV.map(n=><NavLink key={n.to} to={n.to} end={n.to==='/'} title={n.label}
        className={({isActive})=>`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-[13px] ${isActive?'bg-accent-soft text-accent font-medium border-l-2 border-accent':'text-stone-600 hover:bg-stone-100'}`}>
        <n.icon size={16} className="shrink-0"/>{!s.collapsed&&n.label}</NavLink>)}</nav>
      <div className="p-2 border-t border-stone-200 text-xs text-stone-500 flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${s.rows.length?'bg-emerald-500':'bg-amber-500'}`}/>{!s.collapsed&&(s.rows.length?`${s.rows.length.toLocaleString()} records`:'No dataset')}
        <button className="ml-auto p-1 hover:bg-stone-100 rounded" onClick={s.toggle} aria-label="Collapse sidebar"><PanelLeft size={16}/></button></div>
    </aside>
    <div className="flex-1 flex flex-col min-w-0">
      <header className="h-12 bg-white border-b border-stone-200 flex items-center gap-3 px-5">
        <div className="text-xs text-stone-500">NIRF <span className="mx-1">/</span><span className="text-ink font-medium text-sm">{title}</span></div>
        <div className="ml-auto flex items-center gap-2 text-xs">
          <label className="text-stone-500">Year</label><select className="inp" disabled={!years.length} value={s.year??''} onChange={e=>s.setYear(+e.target.value)}>{years.map(y=><option key={y}>{y}</option>)}</select>
          <label className="text-stone-500">Category</label><select className="inp" disabled={!cats.length} value={s.category} onChange={e=>s.setCategory(e.target.value)}>{cats.map(c=><option key={c}>{c}</option>)}</select>
          <button className="btn" onClick={s.reset} disabled={!s.rows.length}><RotateCcw size={13}/>Reset</button></div>
      </header>
      <main className="flex-1 overflow-y-auto p-5"><Outlet/></main></div></div>;}
