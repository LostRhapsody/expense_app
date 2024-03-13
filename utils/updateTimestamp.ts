import axios from 'axios';

/**
 * IMPORTANT NOTE!!!!!
 * Whenever we're using this, check to see if you're updating
 * any other fields in userPrefs. If you're already making a request,
 * just update the timestamp there, instead of using this
 * and making a second call.
 * This is STRICTLY for updating the timestamp when we update
 * the cache or something.
 */


/**
 * Updates the timestamp in the database
 * @param userPrefs a userPrefs object
 */
export default async function updateTimestamp(userPrefs:any, uuid:string) {
   try {
      // update timestamp
      userPrefs.createdAt = new Date().toISOString();

      // send updated timestamp to the server
      const response = await axios.post('/setPrefs', {
         body: {
            key: uuid,
            prefs: userPrefs
         }
      });

      // check response
      if (response.status === 200) {
         console.log('Timestamp updated successfully');
      } else {
         console.log('Failed to update timestamp');
      }
   } catch (error) {
      console.error('An error occurred while updating timestamp:', error);
   }
}