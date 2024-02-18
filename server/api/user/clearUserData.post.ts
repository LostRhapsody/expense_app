import { kv } from "@vercel/kv";

const endpointKeys = [
  "Favorites",
  "Theme",
  "groceryBudget",
  "groceryRecords",
  "Envelope",
  "envelopeBudget",
  "goal",
  "IOU"
]

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  let response;

  // if there is no error in the response, continue
  if (!checkValidKey(body.key)) {
    response = setApiError(
      "Setting user records failed, try logging out and back in again."
    );
  } else {
    // check if key includes "clearRecords", if not this is a bad call
    if (!body.key.includes("clearRecords")) {
      response = setApiError(
        "The key did not include a 'clearRecords' indicator, could not clear user data."
      );
    } else {
      // the body will contain the UUID with no additional key
      let key = body.value;

      for (let index = 0; index < endpointKeys.length; index++) {
        const endpoint = endpointKeys[index];
        await kv.set(key + endpoint , null);                
      }

      response = { error: false, message: "Cleared data successfully" };
    }
  }
  return response;
});
