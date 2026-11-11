import {BrowserRouter,Route,Routes} from 'react-router-dom';
import Layout from './components/Layout';
import {Gate} from './components/ui';
import Overview from './pages/Overview';
import Section from './pages/Section';
import Explorer from './pages/Explorer';
import AIQuery from './pages/AIQuery';
import DatasetManager from './pages/DatasetManager';
const G=(c:React.ReactNode)=><Gate>{c}</Gate>;
export default function App(){return <BrowserRouter><Routes><Route element={<Layout/>}>
  <Route index element={G(<Overview/>)}/><Route path="s/:i" element={G(<Section/>)}/><Route path="explore" element={G(<Explorer/>)}/>
  <Route path="ai" element={<AIQuery/>}/><Route path="data" element={<DatasetManager/>}/></Route></Routes></BrowserRouter>;}
