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
    // check if key includes "groceryRecords", if not this is a bad call
    if (!body.key.includes("groceryRecords")) {
      response = setApiError(
        "The key did not include a 'grocery records' indicator, could not set record."
      );
    } else {
      await kv.set(body.key, body.value);
      response = { error: false, message: "Saved successfully" };
    }
  }
  return response;
});
