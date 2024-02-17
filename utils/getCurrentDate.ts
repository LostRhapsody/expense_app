/**
 * @param format the format to return the date in (dmy, or ymd)
 * @returns today's date in the specified format as a string
 */
export default function getCurrentDate(format: string) {
  // Grab the date
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).padStart(2, "0");

  let returnDate;
  switch (format) {
    case "dmy":
      returnDate = `${day}-${month}-${year}`;
      break;
    case "ymd":
      returnDate = `${year}-${month}-${day}`;
    default:
      break;
  }

  return returnDate;
}
