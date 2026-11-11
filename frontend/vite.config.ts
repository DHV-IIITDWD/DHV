<<<<<<< HEAD
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins:[react()],
  server:{
    proxy:{
      // Same-origin proxy avoids the upstream GeoJSON host's missing CORS headers.
      '/map-assets':{
        target:'https://static.geodataviewer.com',
        changeOrigin:true,
        secure:true,
        rewrite:path=>path.replace(/^\/map-assets/,'/datasets')
      }
    }
  }
});
=======
import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()]});
>>>>>>> origin/main
