import { v5 as uuidv5 } from "uuid";

/**
 * Generates a UUID for a tally record
 * @returns the uuid of the user
 */
export default defineEventHandler(async (event) => {
   const body = await readBody(event);
   const key = body.value;
   const config = useRuntimeConfig();
   let uuid = null;

   // generate id
   uuid = uuidv5(key, config.public.AUTH_NAMESPACE);

   return uuid;
});