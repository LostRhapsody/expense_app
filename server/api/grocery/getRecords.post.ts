import { kv } from "@vercel/kv";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  let response;

  // ensure key is valid
  if (!checkValidKey(body.key)){
    response = setApiError("Getting user records failed, try logging out and back in again.");
  }
  else {
    // check if key includes "groceryRecords", if not this is a bad call
    if (!body.key.includes("groceryRecords")) {
      response = setApiError("The key did not include a 'grocery records' indicator, could not retrieve past records.");
    } else {      
      response = await kv.get(body.key);
    }
  }

  // check if response is undefined. This means nothing has been set yet.
  if(response === null || response === undefined) {
    // default empty array and object
    response = [{}];
  }

  return response
});
