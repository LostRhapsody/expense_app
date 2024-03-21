import checkUUID from "~/utils/checkUUID";
import { createSupabaseClient } from "~/utils/supabase";

/**
 * Updates a user's preferences in the db
 */
export default defineEventHandler(async (event) => {
   const body = await readBody(event);
   const key = body.key;
   const prefs = body.prefs;
   const config = useRuntimeConfig();
   const supabase = createSupabaseClient(config);

   // error handling
   if(!checkUUID(key)) {
      throw new Error("Invalid key provided");
   }
   if(prefs === null || prefs === undefined || prefs.length === 0) {
      throw new Error("No prefs provided");
   }

   // update the user prefs record
   const { error } = await supabase
   .from('userPreferences')
   .update([
      prefs,
   ])
   .eq('userId', key);
   if(error){
      throw new Error("Error setting user : " + error);
   }           
});