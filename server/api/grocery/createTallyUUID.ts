import { v5 as uuidv5 } from "uuid";
import { createSupabaseClient } from "~/utils/supabase";

/**
 * Generates a UUID for a tally record
 * @returns the uuid of the user
 */
export default defineEventHandler(async (event) => {
   const body = await readBody(event);
   const config = useRuntimeConfig();
   const supabase = createSupabaseClient(config);
   let uuid = null;

   // generate id
   uuid = uuidv5(body.value, config.public.AUTH_NAMESPACE);

   return uuid;
});