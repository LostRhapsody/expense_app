import { kv } from "@vercel/kv";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const response = await kv.get(body.key);
  return response
});
