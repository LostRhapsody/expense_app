// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
   runtimeConfig: {
      public: {
         KV_URL: process.env.KV_URL,
         KV_REST_API_URL: process.env.KV_REST_API_URL,
         KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
         KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
         GITHUB_ID: process.env.GITHUB_ID,
         GITHUB_SECRET: process.env.GITHUB_SECRET,
         GOOGLE_ID: process.env.GITHUB_ID,
         GOOGLE_SECRET: process.env.GITHUB_SECRET,
         AUTH_SECRET: process.env.AUTH_SECRET,
         AUTH_ORIGIN: process.env.AUTH_ORIGIN,
         AUTH_NAMESPACE: process.env.AUTH_NAMESPACE
      },

   },
   devtools: { enabled: true },
   modules: [
      '@nuxt/ui',
      '@sidebase/nuxt-auth',
      '@vite-pwa/nuxt',
   ],
   pwa: {
      manifest: {
         name: "Budgie",
         short_name: "BE",
         start_url: "/",
         description:"Simple tools to help your budget",
         theme_color:"green",
         background_color:"black",
         screenshots:[{
               src:"/screenshot-wide.png",
               sizes:"617x674",
               type:"image/png",
               form_factor:"wide",
               label:"Budgie's homescreen on desktop"
            },
            {
               src:"/screenshot-narrow.png",
               sizes:"364x706",
               type:"image/png",
               form_factor:"narrow",
               label:"Budgie's homescreen on mobile"
            },
         ],
         icons: [
            {
               src: 'pwa-64x64.png',
               sizes: '64x64',
               type: 'image/png'
            },
            {
               src: 'pwa-192x192.png',
               sizes: '192x192',
               type: 'image/png'
            },
            {
               src: 'pwa-512x512.png',
               sizes: '512x512',
               type: 'image/png',
               purpose: 'any'
            },
            {
               src: 'maskable-icon-512x512.png',
               sizes: '512x512',
               type: 'image/png',
               purpose: 'maskable'
            }
         ],
      },
      workbox:{
         navigateFallback: '/',
      },
      devOptions: {
         enabled: true,
         type: 'module',
      }
   },
   auth: {
      isEnabled: true,
      provider: {
         type: 'authjs',
         defaultProvider: 'auth0',
      },
   },
   ui: {
      global: true,
      icons: ['heroicons']
   },
   nitro: {
      storage: {
         db: {
            driver: 'vercelKV',
            base: "test",
            env: "KV",
            ttl: 60,
         }
      }
   }
})
