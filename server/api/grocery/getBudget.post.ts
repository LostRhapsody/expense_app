import { kv } from "@vercel/kv";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  let response;

  // check for invalid key
  if (!checkValidKey(body.key)) {
    response = setApiError("Getting user records failed, try logging out and back in again.");
  } else {

    // check if the key includes "budget", if not this is a bad call
    if (!body.key.includes("groceryBudget")) {
      response = setApiError("The key did not include a 'budget' indicator, could not retrieve budget.");
    } else {
      response = await kv.get(body.key);
    }
  }

  // check if response is undefined. This means no budget has been set for the user
  if(response === null || response === undefined) {
    // default of 100
    response = "100";
  }
  
  return response;
});

