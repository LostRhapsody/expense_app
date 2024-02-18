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
    if (!body.key.includes("Favorites")) {
      response = setApiError(
        "The key did not include a 'Favorites' indicator, could not retrieve Favorites."
      );
    } else {
      response = await kv.get(body.key);
    }
  }

  // check if response is undefined. This means no Favorites have been set for the user
  if (response === undefined || response === null) {
    // set to null, nothing to be done.
    response = "No favorites";
  }

  return response;
});
