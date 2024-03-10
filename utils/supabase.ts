import { createClient } from "@supabase/supabase-js";

export function createSupabaseClient(config:any){
   const supabaseUrl = config.public.SUPABASE_URL;
   const supabaseKey = config.public.SUPABASE_KEY;

   if(!supabaseUrl || !supabaseKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_KEY");   
   }
   
   return createClient(supabaseUrl, supabaseKey);
}