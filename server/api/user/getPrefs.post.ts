import { createSupabaseClient } from "~/utils/supabase";

/**
 * Checks the db for a user with the given email
 * @returns the uuid of the user
 */
export default defineEventHandler(async (event) => {
   const body = await readBody(event);
   const key = body.key;
   const config = useRuntimeConfig();
   const supabase = createSupabaseClient(config);

   let userPrefs = {};

   // error handling
   if(key === null || key === undefined || key.length === 0) {
      throw new Error("No key provided");
   }

   // get the user pref record
   let { data, error } = await supabase
   .from('userPreferences')
   .select('userId, themeName, createdAt')
   .eq('userId', key);   
   if(error){
      throw new Error("Error getting user : " + error);
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