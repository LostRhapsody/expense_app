import { kv } from "@vercel/kv";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  let response;

  // check for invalid key
  if (!checkValidKey(body.key)) {
    response = setApiError("Getting user records failed, try logging out and back in again.");
  } else {

    // check if the key includes "checkbook", if not this is a bad call
    if (!body.key.includes("checkbook")) {
      response = setApiError("The key did not include a 'checkbook' indicator, could not retrieve data.");
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

