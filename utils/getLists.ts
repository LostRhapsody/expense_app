/**
 * @returns {Array} - The array of lists
 */
export default function getLists() {
   const storedList = localStorage.getItem("lists");
   // if the stored list was not empty, set it
   if (storedList !== null && storedList !== undefined && storedList !== "undefined") {
      return JSON.parse(storedList);
   } else {
      return [];
   }
}