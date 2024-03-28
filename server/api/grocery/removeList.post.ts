import checkUUID from "~/utils/checkUUID";
import { createSupabaseClient } from "~/utils/supabase";

/**
 * Inserts a new grocery list into the db
 */
export default defineEventHandler(async (event) => {
   const body = await readBody(event);
   const key = body.key;
   const listId= body.listId;
   const config = useRuntimeConfig();
   const supabase = createSupabaseClient(config);

   // error handling
   if(!checkUUID(key)) {
      throw new Error("Invalid key provided");
   }
   if(listId === null || listId === undefined || listId.length === 0) {
      throw new Error("No listId provided");
   }

   // find a list with a matching ID, if not found, insert a new list
   let { data, error } = await supabase
   .from('shoppingList')
   .delete()
   .eq('listId', listId);
   if(error){
      throw new Error("Error deleting list: " + error);
   }

});