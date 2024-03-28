import checkUUID from "~/utils/checkUUID";
import { createSupabaseClient } from "~/utils/supabase";

/**
 * Inserts a new grocery list into the db
 */
export default defineEventHandler(async (event) => {
   const body = await readBody(event);
   const key = body.key;
   const list = body.list;
   const config = useRuntimeConfig();
   const supabase = createSupabaseClient(config);

   // error handling
   if(!checkUUID(key)) {
      throw new Error("Invalid key provided");
   }
   if(list === null || list === undefined || list.length === 0) {
      throw new Error("No list provided");
   }
   if(list.name === "Deleted") {
      throw new Error("The name 'Deleted' is reserved and cannot be used as a list name.");
   }

   // find a list with a matching ID, if not found, insert a new list
   let { data, error } = await supabase
   .from('shoppingList')
   .select('listId,name')
   .eq('listId', list.listId);
   if(error){
      throw new Error("Error checking for list: " + error);
   }

   // if no list found with the given ID, insert a new list
   if(data === null || data === undefined || data.length === 0) {
      let { data, error } = await supabase
      .from('shoppingList')
      .insert([
         list,
      ])
      .select();
      if(error){
         throw new Error("Error setting list : " + error);
      }           
   } else {
      // if the list already exists, compare the name fields
      // and update the list if the names are different (names are the only thing that can change)      
      if (data[0].name !== list.name) {
         let { data, error } = await supabase
         .from('shoppingList')
         .update([
            list,
         ])
         .eq('listId', list.listId);
         if(error){
            throw new Error("Error setting list : " + error);
         }  
      }
   }
});