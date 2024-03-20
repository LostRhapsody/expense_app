import { createSupabaseClient } from "~/utils/supabase";
import { ClickerTallyType } from '~/types/types';

/**
 * Retrieves the clicker tallies for the given user
 * @returns Array of ClickerTallyType records
 */
export default defineEventHandler(async (event) => {
   const body = await readBody(event);
   const key = body.key;
   const config = useRuntimeConfig();
   const supabase = createSupabaseClient(config);

   // retrieve the clicker tally records for the given user
   // using an axios request to the serverless function
   // and store them in an array
   let { data, error } = await supabase 
   .from('clickerTallies')
   .select('*')
   .eq('userId', key);

   if(error){
      throw new Error("Error getting clicker tallies : " + JSON.stringify(error));
   }

   console.log(data);

   return data;

});