export default defineEventHandler(async (event) => {
  const body = await readBody(event);
   const key = body.key;
   if (key === "guest") {
      throw new Error("Guests are not allowed to access this endpoint");
   }
})
