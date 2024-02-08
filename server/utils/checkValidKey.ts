export default function checkValidKey(key: string) {
  let result;
  if (key === "" || key === null || key === undefined) {
    result = false;
  } else {
    result = true;
  }
  return result;
}
