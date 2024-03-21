import type { UserPrefs } from "../types/types";
/**
 * Checks the client cache for user preferences and validates it
 * @returns the user preferences as a JSON object
 */
export default function getUserPrefsJSON() {
   // grab prefs from cache
   const userPrefsFromCache = localStorage.getItem("budgie_prefs");

   // default userPrefs and theme name
   // IMPORTANT! Update this anytime user prefs object/schema is updated
   let userPrefs:UserPrefs = {
      userId: "guest",
      themeName: "Default",
      clickerBudget: 100,
      createdAt: new Date().toISOString()
   };

   // parse cache into JSON object
   if(userPrefsFromCache !== null && userPrefsFromCache !== undefined) {
      userPrefs = JSON.parse(userPrefsFromCache);
   }

   // we either return the userPrefs from the cache or the default
   return userPrefs;
}