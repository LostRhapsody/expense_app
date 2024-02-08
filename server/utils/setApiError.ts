export default function setApiError(msg:string){
  let error = {
    error: true,
    message: msg,
  };
  return error;
}