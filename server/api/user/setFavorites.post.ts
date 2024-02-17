import { kv } from "@vercel/kv";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  let response;

  // if there is no error in the response, continue
  if (!checkValidKey(body.key)) {
    response = setApiError(
      "Setting user records failed, try logging out and back in again."
    );
  } else {
    if (!body.key.includes("Favorite")) {
      response = setApiError(
        "The key did not include a 'Favorite' indicator, could not set Favorites."
      );
    } else {
      await kv.set(body.key, body.value);
      response = { error: false, message: "Saved successfully" };
    }
  }

  return response;
});
