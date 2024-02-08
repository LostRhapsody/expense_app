import { kv } from "@vercel/kv";
import { v5 as uuidv5 } from "uuid";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();
  
  // generate id
  const uuid = uuidv5(body.value, config.public.AUTH_NAMESPACE)
  // use ID to get user record
  const response = await kv.get(uuid);

  // if no record (returns null), set one
  if(response === null){
    // set record with id and email
    await kv.set(uuid,body.value)
  }

  return (uuid);
});
