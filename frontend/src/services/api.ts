export const API=import.meta.env.VITE_API_URL??'http://localhost:8000';
export async function post<T>(path:string,body:unknown):Promise<T>{
  const r=await fetch(`${API}${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok)throw new Error(`${r.status} ${r.statusText}${await r.text().then(t=>t?': '+t.slice(0,200):'').catch(()=>'')}`);
  return r.json() as Promise<T>;}
export const health=()=>fetch(`${API}/api/health`).then(r=>r.ok).catch(()=>false);
