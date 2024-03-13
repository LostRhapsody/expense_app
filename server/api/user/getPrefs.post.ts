import { createSupabaseClient } from "~/utils/supabase";
import type { UserRef } from "~/types/types"

/**
 * Checks the db for a user with the given email
 * @returns the uuid of the user
 */
export default defineEventHandler(async (event) => {
   const body = await readBody(event);
   const key = body.key;
   const config = useRuntimeConfig();
   const supabase = createSupabaseClient(config);

   let userPrefs:UserRef;

   // error handling
   if (!checkValidKey(key)) {
      throw new Error("Invalid key provided");
   }

   // get the user pref record
   let { data, error } = await supabase
   .from('userPreferences')
   .select('userId, themeName, createdAt, clickerBudget')
   .eq('userId', key);   
   if(error){
      throw new Error("Error getting user : " + JSON.stringify(error));
   }

   // if no user found
   if(data === null || data === undefined || data.length === 0) {      
      // the default value we're returning
      userPrefs = {
         userId: key,
         themeName: 'Default',
         createdAt: new Date().toISOString(),
      }; 
      // set a default user prefs record
      const { data, error } = await supabase
      .from('userPreferences')
      .insert([
         userPrefs,
      ])
      .select();
      if(error){
         throw new Error("Error setting user : " + error);
      }           
   } else {
      // if the user already exists, return the id
      userPrefs = data[0];
   }

   return userPrefs;
});