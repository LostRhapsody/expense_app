import convert from 'convert';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  let response = null;

  if(typeof body.value !== "number") {
    response = setApiError("Input value must be a number!")
  }
  if(typeof body.firstUnit !== "string" 
  || typeof body.secondUnit !== "string") {
    response = setApiError("Both units of conversions must be strings!")
  }

  // if no error, convert
  if(response === null)
    response = convert(body.value, body.firstUnit).to(body.secondUnit); 

  // round up!
  if(typeof response === "number")
    response = response.toFixed(2);

  return response;
});

