import { createSupabaseClient } from "~/utils/supabase";

export default defineEventHandler(async (event) => {  
  try {
    const body = await readBody(event);
    const tally = body.data;
    const config = useRuntimeConfig();
    const supabase = createSupabaseClient(config);

    // Insert the new record into the clickerTallies table
    const { data, error } = await supabase
      .from("clickerTallies")
      .insert(tally);

    if (error) {
      throw new Error("Failed to create clicker tally record");
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
});
