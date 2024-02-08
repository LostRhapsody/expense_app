export default defineEventHandler(async (event) => {
  console.log('New request: ' + getRequestURL(event))
  console.log(event.method)
  // readBody throws 405 error if this is a GET request
  if(event.method === "POST"){
    const body = await readBody(event)
    console.log(JSON.stringify(body, null, 2));
  }
})
