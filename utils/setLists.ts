/**
 * set's a user's lists in cache
 */

export default function setLists(list) {
   log(list);
   localStorage.setItem("lists", JSON.stringify(list));
}