<<<<<<< HEAD
import {post,API} from './api';
import {AIResponse} from '../types';
export const askAI=(question:string,history:{question:string;plan:unknown}[]=[],datasetId='active_dataset')=>post<AIResponse>('/api/ai/query',{question,dataset_id:datasetId,history});
export async function uploadCSV(file:File){const f=new FormData();f.append('file',file);const r=await fetch(`${API}/api/upload`,{method:'POST',body:f});
  if(!r.ok)throw new Error((await r.json().catch(()=>({detail:r.statusText}))).detail??r.statusText);return r.json();}
=======
import {post} from './api';
import {AIResponse} from '../types';
export const askAI=(question:string,datasetId='active_dataset')=>post<AIResponse>('/api/ai/query',{question,dataset_id:datasetId});
>>>>>>> 56e088a4e38f53be52a4a2e05c20d359a98eac80
