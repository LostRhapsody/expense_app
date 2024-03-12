export default function checkValidKey(key: string) {
  let result;
  if (
    key === "" ||
    key === null ||
    key === undefined ||
    key.length === 0
  ) {
    result = false;
  } else {
    result = true;
  }
  return result;
}
