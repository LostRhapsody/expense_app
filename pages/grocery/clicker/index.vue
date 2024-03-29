<script setup lang="ts">

/*=============================================
Imports
=============================================*/

// types
import type { ClickerTallyType, UserPrefs } from '~/types/types';

// packages
import axios from 'axios';
import getNewestTimestamp from '~/utils/checkTimestamp';

// config
const config = useRuntimeConfig();

// show/hide things
const showAlert = ref(false);
const showList = ref(false);
const showExplanation = ref(false);
const showEditBudget = ref(false);
const showSettings = ref(false);
const showTaxEstimate = ref(true);
const showTallies = ref(false);

// For notifications
const toast = useToast();

// How much to increase the counter by
const incrementBy = ref(1);

// controls audio
const onPlaying = ref(false);

// color of counter
const color = ref("white");

var clickerTallies: ClickerTallyType[];

// total of all grocery trips
const total = ref(0);
// total of all grocery trips budget
const budgetTotal = ref(0);

// formatted total
const totalDisplay = ref("");
// percentage of budget
const percentageOfBudget = ref(0);
// percentage of TOTAL and all budgets
const percentageOfTotalBudget = ref(0);

// The clicker's val
const count = ref(0);

// Budget for grocery trips
const budget = ref(100);

// approximate tax rate
const taxRate = ref(0.13);

// approximate tax
const taxEstimate = ref(0);

// Grab the date
const currentDate = getCurrentDate("ymd");

const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

const sidebar = [
   {
      label: "settings",
   },
];

/**
 * Used to call setBudget when you can't pass
 * the budget value directly 
 */
function setBudgetOverload(newBudget: number) {
   let userPrefs = getUserPrefsJSON();
   userPrefs.clickerBudget = newBudget;
   setBudget(userPrefs);
}

/**
 * set's the user's budget to the new value in the cache
 */
async function setBudget(userPrefs: UserPrefs) {
   const key = localStorage.getItem("uuid");
   const isOnline  = useOnline();

   // update timestamp
   userPrefs.createdAt = new Date().toISOString();
   // set it back to the cache
   localStorage.setItem("budgie_prefs", JSON.stringify(userPrefs));

   // if our UUID is bad, or we're not online,
   // return because we can't set it in the db
   if(!checkUUID(key) || !isOnline.value){
      return;
   }

   //if uuid is set, update the user's budget in the DB
   if(isOnline.value && checkUUID(key) && loggedIn.value){
      await axios.post("/api/user/setPrefs", {
         key: key,
         prefs: userPrefs
      }).then((response) => {
      });
   }

   showEditBudget.value = false;
}

/**
  * Get's the user's saved budget from the cache
 */
async function getBudget() {
   const key = localStorage.getItem("uuid");
   const isOnline  = useOnline();

   let userPrefsString = localStorage.getItem("budgie_prefs");
   let userPrefs:UserPrefs;

   // make it into an object if there is anything in the cache
   if(userPrefsString !== null && userPrefsString !== undefined){
      userPrefs = JSON.parse(userPrefsString);
   }

   // if online and UUID is good retrieve from DB
   if(isOnline.value && checkUUID(key) && loggedIn.value){
      await axios.post("/api/user/getPrefs", {
         key: key
      }).then((response) => {

         // if response is valid
         if(response.data.prefs !== null && response.data.prefs !== undefined){

            // if cache is empty, set it to the db value
            // there will be nothing to compare, so skip the rest
            if(userPrefs === null || userPrefs === undefined){
               userPrefs = response.data.prefs;
               localStorage.setItem("budgie_prefs", JSON.stringify(userPrefs));
               budget.value = userPrefs.clickerBudget;
               return;
            }
         
            // get latest timestamp
            let newestTimestamp = getNewestTimestamp(
               userPrefs.createdAt, 
               response.data.createdAt
            );

            switch (newestTimestamp) {
               case "cache":
                  // if cache is newer, update the db with the cache
                  setBudget(userPrefs);
                  budget.value = userPrefs.clickerBudget;
                  return;
               case "equal":
                  // if they are the same timestamp, just set budget
                  budget.value = userPrefs.clickerBudget;
                  return;
               case "database":
                  // if db is newer, update the cache with the db value
                  userPrefs = response.data;
                  budget.value = userPrefs.clickerBudget;
                  localStorage.setItem("budgie_prefs", JSON.stringify(userPrefs));
                  return;           
               default:
                  log("error in getNewestTimestamp");
                  break;
            }
         } else {
            // if invalid response

            // if response is invalid just go with whatever is in the cache
            // or set it to the default value
            if(userPrefs === null || userPrefs === undefined){
               // sets to default or whatever is in cache
               userPrefs = getUserPrefsJSON();
            }
         } /* end else if response is invalid */
      });
   } /* end if online and UUID is good */
   
   // because we set this conditionally above, slim change
   // it won't be set when we use it below, so grab from the cache
   // or set defaults
   userPrefs = getUserPrefsJSON();
   
   // if the value is not a number, set it to 100
   if (userPrefs.clickerBudget === null 
   || typeof userPrefs.clickerBudget !== "number") {
      userPrefs.clickerBudget = 100;
   }
   budget.value = userPrefs.clickerBudget;
}

/**
 * Creates a new query record and saves it to the cache/db
 */
async function createTally(tally:ClickerTallyType){
   const key = localStorage.getItem("uuid");
   const isOnline = useOnline();   

   // if we're not online or the key is invalid, return
   if(!checkUUID(key) || !isOnline.value) return;

   // send the current clicker tally to the db
   await axios.post("/api/grocery/createClickerTally", {
      tally: tally
   }).then((response) => {
   });
}


/**
 * Get's the key-value pair containing the
 * array of the user's expenses, updates total
 * @param key the key used to retrive the value
 */
async function getTallies() {
   const key = localStorage.getItem("uuid");
   const isOnline = useOnline();
   let clickerTalliesString = localStorage.getItem("clickerTallies");

   // first retrieve from cache
   if (clickerTalliesString !== null && clickerTalliesString !== undefined) {
      clickerTallies = JSON.parse(clickerTalliesString);
   } else {
      // if nothing in cache, set to empty array
      clickerTallies = [];
   }

   // if key is not set, we'll just stick with whatever is in cache.
   if(key === null || key === undefined) return;

   // if we're online, get the latest from the db
   if(isOnline.value && checkUUID(key) && loggedIn.value){
      await axios.post("/api/grocery/getClickerTallies", {
         key: key
      }).then((response) => {
         if(response.data === null || response.data === undefined){
            log("error getting clicker tallies");
            return;
         }
         // if we have more entries in the cache than the db, 
         //set the db to the cache
         if(clickerTallies.length > response.data.length){
            clickerTallies.forEach((element,index) => {

               // if not set at all for some reason, skip
               if(element.tallieId === null || element.tallieId === undefined){
                  return;
               }

               // if this record needs to be reset (created offline)
               // don't send to DB. Won't fit the UUID data type.
               if(element.tallieId.includes("reset")){
                  return;
               }

               // only create the tally record if it's not in the db
               if(index >= response.data.length){
                  createTally(element);
               }
            });
            return;
         }
         // otherwise, set clicker tallies and cache to response
         clickerTallies = response.data;
         localStorage.setItem("clickerTallies", JSON.stringify(clickerTallies));
      });
   }   
}

/**
 * Updates the total value of past tallies
 * Also formats the display value and the ratio
 */
function updateTotal() {
   total.value = 0;
   budgetTotal.value = 0;

   // if empty, set everything to zero.
   if (clickerTallies === undefined || clickerTallies.length == 0) {
      totalDisplay.value = formatCurrency(total.value);
      percentageOfTotalBudget.value = 0;
      return;
   }

   clickerTallies.forEach((element) => {
      total.value += element.amount;
      budgetTotal.value += element.budget;
   });
   totalDisplay.value = formatCurrency(total.value);
   if (budgetTotal.value > 0) {
      percentageOfTotalBudget.value = Math.round(
         (total.value / budgetTotal.value) * 100
      );
   } else {
      percentageOfTotalBudget.value = 0;
   }
}

/**
 * Updates the clickerTally array with the current counter
 * @param mode add mode: resets counter and pushes to array
 */
async function updateUserArray(mode: string) {
   let key = localStorage.getItem("uuid");
   let tallieId = "1";
   let index = 0;
   const isOnline = useOnline();
   if (key === null || key === undefined) {
      // if it's guest we won't store this in the DB till it's updated
      // TODO - a function that, when the UUID is finally set, takes
      // all the guest records IN THE CACHE (should never be in db)
      // and updates them with the UUID
      key = "guest";
   }

   // if you're logged in and online, create a list UUID
   if(checkUUID(key) && isOnline.value && loggedIn.value){
      await axios.post("/api/grocery/createTallyUUID", {
         value: new Date().toISOString() + key
      }).then((response) => {
         if(response.data === null || response.data === undefined){
            log("error creating tally UUID");
            return;
         }
         tallieId = response.data;
      });
   } else {
      
      // TODO replace reset tallieId's with real UUIDs.
      // Otherwise don't bother with the db.
      if(clickerTallies !== undefined && clickerTallies.length > 0){
         tallieId = "reset: " + clickerTallies.length.toString();
      } else {
         tallieId = "reset: 1";
      }

   }

   if (mode === "add") {
      if (count.value <= 0) return;

      // if array is undefined, create the first element, else push new element
      if (clickerTallies === undefined || clickerTallies === null) {
         clickerTallies = [
            {
               userId: key,
               tallieId: tallieId,
               amount: count.value,
               budget: budget.value,
               budgetUsed: Math.round(percentageOfBudget.value),
               dateCreated: new Date().toISOString(),
            },
         ];
      } else {
         clickerTallies.push({
            userId: key,
            tallieId: tallieId,
            amount: count.value,
            budget: budget.value,
            budgetUsed: Math.round(percentageOfBudget.value),
            dateCreated: new Date().toISOString(),
         });
      }

      resetCounter();
   }

   index = clickerTallies.length - 1;

   // always update total, have to catch undefined array errors inside
   updateTotal();

   // if array is empty, don't show tallies
   if (clickerTallies !== undefined && clickerTallies.length != 0) {
      showTallies.value = true;
   } else {
      showTallies.value = false;
   }

   // set record in DB if logged in
   if (loggedIn.value) {
      createTally(clickerTallies[index]);
   }

   // update the clicker tallies in the cache
   localStorage.setItem("clickerTallies", JSON.stringify(clickerTallies));
}

/**
 * Deletes an item from the userArray
 * @param index the index of the item to delete from the array
 */
function deleteItem(index: number) {
   // TODO - This needs to remove the item from the DB as well!
   clickerTallies.splice(index, 1);
   updateUserArray("delete");
}

/**
 * increments the $ counter and chimes
 * audio must finish before we increment the counter again
 */
function increment() {
   // Really ugly implementation.
   // Should play one of the three sounds...
   const audio = document.getElementById("clicker");
   const audio2 = document.getElementById("clicker2");
   const audio3 = document.getElementById("clicker3");
   if (audio === null || audio2 === null || audio3 === null) return;
   if (!audio.paused && !audio2.paused && !audio3.paused) return;

   if (audio.paused) {
      audio.play();
      incrementCountOperations();
      return;
   }
   if (audio2.paused) {
      audio2.play();
      incrementCountOperations();
      return;
   }

   if (audio3.paused) {
      audio3.play();
      incrementCountOperations();
      return;
   }
}

function adjustIncrement() {
   switch (incrementBy.value) {
      case 1:
         incrementBy.value = 3;
         break;
      case 3:
         incrementBy.value = 5;
         break;
      case 5:
         incrementBy.value = 1;
         break;
      default:
         break;
   }
}

/**
 * The repetative actions performed when incrementing the count
 */
function incrementCountOperations() {
   count.value += incrementBy.value;
   taxEstimate.value = Math.round(count.value * taxRate.value);
   updatePercentOfBudget();
   // here to switch to warning/regular color when increasing counter
   setCounterColor();
}

/**
 * decrements the increment by value, keeping it at least 1
 */
function decrement() {
   if (count.value > 0) {
      if (count.value - incrementBy.value < 0) {
         count.value = 0;
      } else {
         count.value -= incrementBy.value;
      }
   }
   taxEstimate.value = Math.round(count.value * taxRate.value);
   updatePercentOfBudget();
   // here to set warning/regular color when decreasing counter
   setCounterColor();
}

function updatePercentOfBudget() {
   percentageOfBudget.value = (count.value / budget.value) * 100;
}

/**
 * Adjusts the color of the counter based on budget
 */
function setCounterColor() {
   updatePercentOfBudget();
   if (percentageOfBudget.value >= 75 && percentageOfBudget.value <= 99) {
      color.value = "orange";
   } else if (percentageOfBudget.value >= 99) {
      color.value = "red";
   } else {
      if (isDark.value) {
         color.value = "white";
      } else {
         color.value = "black";
      }
   }
}

/** A listener function.
 *  When the value of isDark updates, this function is called
 *  Really, just handles updating the color.
 */
function colorUpdate() {
   setCounterColor();
}

/**
 * Used to ensure the number a user is unputting is a valid number
 */
function verifyNumber(value: number, taxRate: boolean) {
   // basically, we can set tax to 0, incrementBy should be at least 1 though
   if (taxRate) {
      if (value <= 0 || value === null || value === "" || value === undefined)
         return 0;
   } else {
      if (value <= 0 || value === null || value === "" || value === undefined)
         return 1;
   }

   return value;
}

/**
 * Hides the 'confirm reset' alert
 */
function hideAlert() {
   showAlert.value = false;
}

/**
 * Resets the counter to 0 and hides the alert and sets tax estimate to 0
 */
function resetCounter() {
   hideAlert();
   count.value = 0;
   taxEstimate.value = 0;
   // here to set after a submit or reset back to regular color
   setCounterColor();
}

const colorMode = useColorMode();
const isDark = computed({
   get() {
      return colorMode.value === "dark";
   },
   set() {
      colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
   },
});

/**
 * onMounted functions
 * Anything that needs to run AFTER the component has been mounted
 * Currently... not used. Here for reference.
 */
// onMounted(async () => {
//   await nextTick();
// });

/**
 * Initialize
 */
if (process.client) {
   // removed check for UUID, we're cache first here.  
   getTallies();
   getBudget();
}

const links = getBreadcrumbs([
   { name: "Grocery", icon: "i-heroicons-shopping-bag-solid", url: "/grocery" },
   {
      name: "Clicker",
      icon: "i-heroicons-cursor-arrow-rays-solid",
      url: "/grocery/clicker",
   },
]);
</script>

<template>
   <input class="hidden" :value="isDark" :change="colorUpdate()" />
   <BreadcrumbHTML
      class="bg-primary-100/50 dark:bg-gray-800/50 rounded-full p-1"
   >
      <UBreadcrumb :ui="{ li: 'text-black' }" :links="links" />
   </BreadcrumbHTML>
   <UButton
      @click="showExplanation = !showExplanation"
      class="justify-center w-full mx-auto text-xl my-2"
      icon="i-heroicons-information-circle-solid"
      variant="outline"
   >
      How to use
      <img
         alt="An icon of a budgie, which is a kind of bird."
         class="inline-block text-primary"
         src="/edited_budgie.svg"
         height="25"
         width="25"
      />
   </UButton>
   <div class="flex flex-col mx-auto justify-center">
      <!--  audio for clicker -->
      <audio
         pause
         id="clicker"
         src="/click_short.mp3"
         ref="audioPlayer"
         @timeupdate="onPlaying"
      >
         Your browser does not support the <code>audio</code> element.
      </audio>
      <audio
         pause
         id="clicker2"
         src="/click_short.mp3"
         ref="audioPlayer"
         @timeupdate="onPlaying"
      >
         Your browser does not support the <code>audio</code> element.
      </audio>
      <audio
         pause
         id="clicker3"
         src="/click_short.mp3"
         ref="audioPlayer"
         @timeupdate="onPlaying"
      >
         Your browser does not support the <code>audio</code> element.
      </audio>

      <!-- Left slideout for list of counters -->
      <USlideover
         v-model="showList"
         :overlay="true"
         :side="'left'"
         class="overflow-auto"
      >
         <UCard
            class="flex flex-col flex-1"
            :ui="{
               body: { base: 'flex-1' },
               ring: '',
               divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
         >
            <template #header>
               <div class="flex items-center justify-between">
                  <h3
                     class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                  >
                     Past Tallies
                  </h3>
                  <UButton
                     color="gray"
                     variant="ghost"
                     icon="i-heroicons-x-mark-20-solid"
                     class="-my-1"
                     @click="showList = false"
                  />
               </div>
            </template>

            <p class="text-xl flex items-center">
               Current budget: ${{ budget }}
               <UButton
                  @click="(showEditBudget = true), (showList = false)"
                  color="white"
                  :padded="false"
                  icon="i-heroicons-cog-6-tooth-solid"
                  class="ml-2 hover:bg-gray-300 dark:hover:bg-gray-700"
                  size="xl"
               />
            </p>
            <hr class="my-2" />
            <!-- Past tallies list -->
            <ol>
               <li
                  v-if="clickerTallies.length > 0"
                  v-for="(item, index) in clickerTallies"
                  :key="item.tallieId"
                  class="text-lg my-4 flex justify-around w-full dark:border-gray-800 border-gray-200 border-solid border-2 py-1 rounded-lg dark:hover:bg-gray-700 hover:bg-gray-100"
               >
                  <div class="flex flex-col w-full">
                     <div class="flex flex-row justify-between mx-8 text-xl">
                        <p>
                           <strong>${{ item.amount }}</strong>
                        </p>
                        <em class="text-neutral-500">{{
                           item.dateCreated ? item.dateCreated.substring(0,10) : "No date"
                        }}</em>
                        <UButton
                           @click="deleteItem(index)"
                           icon="i-heroicons-x-circle-solid"
                        >
                        </UButton>
                     </div>
                     <div class="flex flex-row mx-8 my-2">
                        <UProgress :value="item.budgetUsed" />
                     </div>
                     <em class="text-neutral-500 text-sm text-center">{{
                        item.budget ? "budget: $" + item.budget : "No budget"
                     }}</em>
                  </div>
               </li>
               <li
                  v-else
                  class="text-lg my-4 flex justify-around w-full border-gray-800 border-solid border-2 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700"
               >
                  No past tallies
               </li> 
            </ol>
            <hr class="my-2" />
            <p class="text-xl">TOTAL: {{ totalDisplay }}</p>
            <p class="text-xl">
               Average budget used:<br />
               <UProgress :value="percentageOfTotalBudget" indicator />
            </p>
         </UCard>
      </USlideover>

      <!-- clicker -->
      <div class="grid grid-cols-5">
         <div>
            <UAccordion
               :items="sidebar"
               class="border border-gray-200 dark:border-gray-800 rounded-full p-3"
            >
               <template #default="{ item, index, open }">
                  <UButton
                     icon="i-heroicons-bars-3"
                     class="rounded-full justify-center"
                  />
               </template>
               <template #item="{ item }">
                  <div class="flex flex-col">
                     <!-- show list -->
                     <UButton
                        @click="showList = true"
                        icon="i-heroicons-banknotes-solid"
                        class="rounded-full my-3 justify-center"
                     />
                     <!-- show settings -->
                     <UButton
                        @click="showSettings = true"
                        icon="i-heroicons-cog-6-tooth-solid"
                        class="rounded-full my-3 justify-center"
                     />
                     <!-- reset counter -->
                     <UButton
                        @click="showAlert = true"
                        icon="i-heroicons-arrow-path-solid"
                        class="rounded-full mt-3 justify-center"
                     />
                  </div>
               </template>
            </UAccordion>
         </div>
         <UButton
            @click="increment"
            class="col-span-3 mx-auto my-12 rounded-full h-28 w-28 justify-center text-3xl"
            >+{{ incrementBy }}
         </UButton>
         <div class="flex flex-col p-3">
            <!-- quick switch clicker -->
            <UButton
               @click="adjustIncrement"
               variant="outline"
               icon="i-heroicons-arrows-up-down"
               class="justify-center rounded-full mb-4"
            />
            <!-- decrement -->
            <UButton
               @click="decrement"
               variant="outline"
               class="justify-center rounded-full my-7"
               >-{{ incrementBy }}</UButton
            >
         </div>
      </div>

      <!-- Total Tracker -->
      <div class="my-4">
         <!-- Reset alert -->
         <UAlert
            v-if="showAlert"
            :actions="[
               { variant: 'solid', label: 'Cancel', click: hideAlert },
               {
                  variant: 'outline',
                  color: 'primary',
                  label: 'Reset',
                  click: resetCounter,
               },
            ]"
            title="Confirm Reset"
            class="my-4"
         />
         <p class="text-center text-3xl counterText">${{ count }}</p>
         <p
            v-if="showTaxEstimate"
            class="text-center dark:text-gray-400 text-gray-600"
         >
            After tax: ${{ taxEstimate + count }}
         </p>
      </div>

      <!-- submit count -->
      <UButton
         label="Save grocery trip"
         class="justify-center my-8"
         @click="updateUserArray('add')"
      />

      <!-- EXPLANATION -->
      <UModal :ui="{ container: 'items-center' }" v-model="showExplanation">
         <UCard>
            <template #header>
               <div class="flex min-w-0 justify-between">
                  <p class="text-2xl">Information</p>
                  <UButton
                     @click="showExplanation = false"
                     variant="link"
                     color="white"
                     size="xl"
                     icon="i-heroicons-x-mark-solid"
                     class="text-gray-600 hover:text-gray-900"
                  />
               </div>
            </template>
            <p>
               <strong
                  >Easily keep track of your spending and budget while grocery
                  shopping.</strong
               >
            </p>
            <br />
            <p class="text-sm">
               While shopping, track the cost of every item you place in your
               cart with this clicker tool.
            </p>
            <br />
            <p class="text-sm">
               Click <span class="text-primary">Submit</span> to keep track of
               all your grocery trips. Be sure to sign in
               <em
                  >(secured with
                  <ULink class="text-primary" to="https://oauth.net/2/"
                     >0Auth</ULink
                  >)
               </em>
               to save your submissions.
            </p>
            <br />
            <p
               class="text-sm grid grid-cols-3 gap-x-4 border-gray-700 border-2 rounded-lg p-2"
            >
               <span class="col-span-2">View past submissions</span>
               <UIcon class="text-primary" name="i-heroicons-banknotes-solid" />
               <span class="col-span-2">Change the counter with</span>
               <UIcon class="text-primary" name="i-heroicons-arrows-up-down" />
               <span class="col-span-2">Reset the counter</span>
               <UIcon
                  class="text-primary"
                  name="i-heroicons-arrow-path-solid"
               />
               <span class="col-span-2">Decrease the counter</span>
               <span class="text-primary">-{{ incrementBy }}</span>
               <span class="col-span-2">Adjust settings with</span>
               <UIcon
                  class="text-primary"
                  name="i-heroicons-cog-6-tooth-solid"
               />
            </p>
         </UCard>
      </UModal>
      <!-- BUDGET MODAL -->
      <UModal :ui="{ container: 'items-center' }" v-model="showEditBudget">
         <UCard>
            <template #header>
               <div class="flex min-w-0 justify-between">
                  <p class="text-2xl my-4">Current Budget: ${{ budget }}</p>
                  <UButton
                     @click="showEditBudget = false"
                     variant="link"
                     color="white"
                     size="xl"
                     icon="i-heroicons-x-mark-solid"
                     class="text-gray-600 hover:text-gray-900"
                  />
               </div>
            </template>
            <URange v-model="budget" name="range" :max="500" />
            <UInput
               type="number"
               v-model="budget"
               class="my-4"
               :ui="{ base: 'text-center flex justify-center' }"
            >
            </UInput>
            <template #footer>
               <UButton block label="Submit" @click="setBudgetOverload(budget)" />
            </template>
         </UCard>
      </UModal>

      <!-- Settings MODAL -->
      <UModal :ui="{ container: 'items-center' }" v-model="showSettings">
         <UCard>
            <template #header>
               <div class="flex min-w-0 justify-between">
                  <p class="text-2xl">Settings</p>
                  <UButton
                     @click="showSettings = false"
                     variant="link"
                     color="white"
                     size="xl"
                     icon="i-heroicons-x-mark-solid"
                     class="text-gray-600 hover:text-gray-900"
                  />
               </div>
            </template>

            <div class="p-4">
               <!-- INCREMENT COUNT BY -->
               <div class="grid grid-cols-3 gap-4">
                  <p class="col-span-2">Increment the count by:</p>
                  <UInput
                     type="number"
                     v-model="incrementBy"
                     v-on:blur="incrementBy = verifyNumber(incrementBy, false)"
                  />
               </div>

               <!-- TAX RATE -->
               <div class="grid grid-cols-3 gap-4 my-2">
                  <p class="col-span-2">Tax rate:</p>
                  <UInput
                     type="number"
                     v-model="taxRate"
                     v-on:blur="taxRate = verifyNumber(taxRate, true)"
                  >
                     <template #trailing
                        ><span class="text-xs text-gray-500"
                           >%{{ taxRate * 100 }}</span
                        ></template
                     >
                  </UInput>
               </div>

               <!-- SHOW TAX -->
               <div class="grid grid-cols-3 gap-4">
                  <p class="col-span-2">Show tax estimate:</p>
                  <UCheckbox v-model="showTaxEstimate" />
               </div>
            </div>
         </UCard>
      </UModal>
   </div>
</template>

<style>
li {
   list-style-type: none;
}

.counterText {
   color: v-bind(color);
}

.quickswitch {
   left: 81%;
   bottom: 41%;
}

.rightsidebar {
   left: 80%;
   bottom: 5%;
}

.leftsidebar {
   bottom: 5%;
}
</style>
