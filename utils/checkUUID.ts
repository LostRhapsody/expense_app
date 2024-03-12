/**
 * utility function to verify a UUID is valid
 * @param uuid uuid to verify
 * @returns true if the uuid is valid
 */
export default function checkUUID(uuid: string|null|undefined) {
  let valid = true;
  if (
  uuid === null || 
  uuid === undefined || 
  uuid.length < 1) {
    valid = false;
  }
  return valid;
}