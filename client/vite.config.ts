import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  
  //this was originally not needed, but now that I'm seperating docker files
  //I need to tell my frontend where to route requests to I guess?
  //this is because in docker my actual webapp is in a seperate container from my backend
  //prviously for local development localhost could talk to 3003 and 5173 in the same browser
  //with this servce change I'm essentially telling my frontend this
  //that means with seperate containers when the frontend requested an api and it will LOOK IN ITS OWN CONTAINER! not the backend container where my db is
  //"“Hey, if you see a request to /api, don’t handle it yourself — forward it to http://localhost:3003.”"
  //but we dont need this!!!!!!! we are done with our webapp and want to deploy, so we want ot use nginx to serve static files

  //
server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
    },
  },


  plugins: [react(), tsconfigPaths()],
})