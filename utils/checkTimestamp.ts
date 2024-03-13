/**
 * Checks the timestamp from the cache and from the database and returns the newest one
 * @param cacheTimestamp timestamp as a string from cache
 * @param databaseTimestamp timestamp as a string from database
 * @returns The name of the newest timestamp
 */
export default function getNewestTimestamp(cacheTimestamp:string, databaseTimestamp:string) {
   // convert timestamps to Date objects
   const cacheDate = new Date(cacheTimestamp);
   const databaseDate = new Date(databaseTimestamp);
   let result = "";

   // compare dates
   if(cacheDate > databaseDate) {
      result = "cache";
   } else if(cacheDate < databaseDate) {
      result = "database";
   } else {
      result = "equal";
   }

   return result;
}