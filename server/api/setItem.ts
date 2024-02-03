import { kv } from '@vercel/kv';

export default defineEventHandler(async (event) => {

  const body = await readBody(event)
  await kv.set(body.key,body.value)
  
})
