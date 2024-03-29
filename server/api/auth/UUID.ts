import { v5 as uuidv5 } from "uuid";
import { createSupabaseClient } from "~/utils/supabase";

/**
 * Checks the db for a user with the given email
 * @returns the uuid of the user
 */
export default defineEventHandler(async (event) => {
   const body = await readBody(event);
   const config = useRuntimeConfig();
   const supabase = createSupabaseClient(config);
   let uuid = null;

   // generate id
   uuid = uuidv5(body.value, config.public.AUTH_NAMESPACE);

   // first confirm if we have a user with the given uuid
   let { data, error } = await supabase
   .from('user')
   .select('id, email')
   .eq('id', uuid);   
   if(error){
      throw new Error("Error getting user : " + error);
   }

   // if no user found
   if(data === null || data === undefined || data.length === 0) {      
      // set the record
      const { data, error } = await supabase
      .from('user')
      .insert([
         { id: uuid, email: body.value },
      ])
      .select();
      if(error){
         throw new Error("Error setting user : " + error);
      }
   } else {
      // if the user already exists, return the id
      uuid = data[0].id;
   }

   return uuid;
});