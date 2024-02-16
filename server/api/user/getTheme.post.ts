import { kv } from "@vercel/kv";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  let response;

  // check for invalid key
  if (!checkValidKey(body.key)) {
    response = setApiError(
      "Getting user records failed, try logging out and back in again."
    );
  } else {
    if (!body.key.includes("Theme")) {
      response = setApiError(
        "The key did not include a 'theme' indicator, could not retrieve theme."
      );
    } else {
      response = await kv.get(body.key);
    }
  }

  // check if response is undefined. This means no theme has been set for the user
  if (response === null || response === undefined) {
    // set to default
    response = 'default';
  }

  return response;
});
