export default function checkValidKey(key: string) {
  let result;
  if (
    key === "" ||
    key === null ||
    key === undefined ||
    key.includes("guest")
  ) {
    result = false;
  } else {
    result = true;
  }
  return result;
}
