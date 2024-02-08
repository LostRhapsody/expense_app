// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public:{
    KV_URL: process.env.KV_URL,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
    GITHUB_ID:process.env.GITHUB_ID,
    GITHUB_SECRET:process.env.GITHUB_SECRET,
    GOOGLE_ID:process.env.GITHUB_ID,
    GOOGLE_SECRET:process.env.GITHUB_SECRET,
    AUTH_SECRET:process.env.AUTH_SECRET,
    AUTH_ORIGIN:process.env.AUTH_ORIGIN,
    AUTH_NAMESPACE:process.env.AUTH_NAMESPACE
    }
  },
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@sidebase/nuxt-auth',
  ],
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
  nitro :{
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
