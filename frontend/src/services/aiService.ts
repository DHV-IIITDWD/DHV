import {post} from './api';
import {AIResponse} from '../types';
export const askAI=(question:string,datasetId='active_dataset')=>post<AIResponse>('/api/ai/query',{question,dataset_id:datasetId});
