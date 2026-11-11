import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App';
<<<<<<< HEAD
import {readRemoteCsv} from './data';
import {useStore} from './store';

createRoot(document.getElementById('root')!).render(<App/>);

// Ship a ready-to-run demonstration dataset; manual CSV/XLSX uploads can replace it.
readRemoteCsv(`${import.meta.env.BASE_URL}data/nirf_merged.csv`).then(raw=>{
  const size=new TextEncoder().encode(raw.map(row=>Object.values(row).join(',')).join('\n')).length;
  useStore.getState().load(raw,[{name:'nirf_merged.csv (bundled sample)',size}]);
}).catch(error=>{
  console.warn('Bundled dataset could not be loaded. Upload a CSV/XLSX from Dataset Manager.',error);
});
=======
createRoot(document.getElementById('root')!).render(<App/>);
>>>>>>> origin/main
