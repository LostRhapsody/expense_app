import { kv } from "@vercel/kv";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  let response;

  // check for invalid key
  if (!checkValidKey(body.key)) {
    response = setApiError("Getting user records failed, try logging out and back in again.");
  } else {

    // check if the key includes "Envelope", if not this is a bad call
    if (!body.key.includes("goal")) {
      response = setApiError("The key did not include a 'goal' indicator, could not retrieve data.");
    } else {
      response = await kv.get(body.key);
    }
  }

  // check if response is undefined. This means no ious have been saved yet. Default to empty array.
  if(response === null || response === undefined) {
    response = [];
  }
  
  return response;
});

