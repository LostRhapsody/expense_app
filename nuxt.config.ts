// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public:{
    KV_URL: process.env.KV_URL,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
    }
  },
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
  ],
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
