<script setup>
// auth
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// For notifications
const toast = useToast();

// show/hide things
const showExplanation = ref(false);
const showClicker = ref(false);

// How much to increase the counter by
const incrementBy = ref(1);
// The clicker's val
const count = ref(0);

// toggle focus mode
const focusMode = ref(false);

const currentList = ref(0);
const list = ref([]);
const currentItem = ref(0);
const filteredRows = ref([]);

var userArray;
// Grab the date
const currentDate = getCurrentDate('ymd');
// Budget for grocery trips
const budget = ref(100);
// percentage of budget
const percentageOfBudget = ref(0);

const columns = [
   {
      key: "name",
      label: "Name",
      sortable: true,
      class:'',
   },
   {
      key: "department",
      label: "Dept.",
      sortable: true,
      class:'hidden',
   },
   {
      key: "price",
      label: "Price",
      sortable: true,
      class:'hidden',
   },
   {
      key: "selected",
      label: "Selected",
      sortable: true,
      class:'hidden',
   },
];

const showItems = computed(() => {
   if (list.value === null || list.value === undefined) return;
   let currentListItems = list.value[currentList.value].items;
   return currentListItems.length > 0;
});

const links = getBreadcrumbs([
   { name: "", icon: "i-heroicons-shopping-bag-solid", url: "/grocery" },
   {
      name: "",
      icon: "i-heroicons-list-bullet",
      url: "/grocery/lists",
   },
   {
      name: "",
      icon: "i-heroicons-shopping-cart-solid",
      url: "/grocery/lists/shop",
   },
]);

const selectedItemsAccordion = ref([
   {
      label: "Checked items",
      slot: "checked-items",
   },
]);

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Deletes all of the items from the selectedItems array
 */
function deleteSelectedItems() {
   // verify none of our arrays are undefined
   if (list.value === undefined || list.value === null) return;
   if (
      list.value[currentList.value] === undefined ||
      list.value[currentList.value] === null
   )
      return;
   if (
      list.value[currentList.value].selectedItems === undefined ||
      list.value[currentList.value].selectedItems === null
   )
      return;

   // empty the array
   list.value[currentList.value].selectedItems = [];
   let shallowItemsCopy = [];

   // remove the selected items from the items array
   list.value[currentList.value].items.forEach((item, index) => {
      // all the non-selected items, add to a copy
      if (!item.selected) {
         shallowItemsCopy.push(item);
      }
   });
   // set all items to the copy
   list.value[currentList.value].items = shallowItemsCopy;
   setLists(list.value);
}

/**
 * Select listener to select items in shopping list
 * @param row current row
 */
async function select(row) {
   // empty item in case we have an undefined list?
   let item = [];

   // plz don't be undefined uwu
   if (list.value[currentList.value].selectedItems === undefined) {
      list.value[currentList.value].selectedItems = item;
   }

   // grab selected items array
   let selected = list.value[currentList.value].selectedItems;
   let items = list.value[currentList.value].items;
   let itemShallowCopy = [];

   // if true we add item to array
   let addItem = true;

   selected.forEach((element, index) => {
      // if the selected row is already in the array, remove it.
      if (element.id === row.id) {
         // turn off selected flag
         let selecteditem = items.find((element) => element.id === row.id);
         selecteditem.selected = false;
         selected.splice(index, 1);
         addItem = false;
         filterSelectedItems();
         return;
      }
   });

   // if we did not remove the item from the array, add it.
   if (addItem) {
      selected.push(row);
      // find the item with the matching id
      let selecteditem = items.find((element) => element.id === row.id);
      selecteditem.selected = true;
      await delay(2000);
      filterSelectedItems();
   }
   setLists(list.value);
}

/**
 * Checks for items that have been selected, and hides them
 */
function filterSelectedItems() {
   let filteredItems = [];
   // ... is this necessary? lol idk.
   if(
      list.value === null || 
      list.value === undefined || 
      list.value[currentList.value] === undefined ||
      list.value[currentList.value] === null ||
      list.value[currentList.value].items === undefined ||
      list.value[currentList.value].items === null){
      filteredRows.value = filteredItems;
      return;
   }
   list.value[currentList.value].items.forEach((item) => {
      if(item === undefined || item === null)
         return;
      // filter out any items that don't have a name, we don't need these.
      if (item.name === undefined || item.name === null || item.name === "")
         return;
      if (!item.selected) {
         filteredItems.push(item);
      }
   });

   filteredRows.value = filteredItems;
}

/**
 * Toggles focus mode
 */
function toggleFocus() {
   focusMode.value = !focusMode.value;
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

/**
 * The repetative actions performed when incrementing the count
 */
function incrementCountOperations() {
   count.value += incrementBy.value;
   updatePercentOfBudget();
}

/**
 * Resets the counter to 0 and hides the alert and sets tax estimate to 0
 */
function resetCounter() {
   count.value = 0;
}

/**
 * Updates the userArray with the current counter
 * @param mode add mode: resets counter and pushes to array
 */
function updateUserArray(mode) {
   if(!loggedIn.value){
      toast.add({ title: "Please log in to save your count." });
      return;
   }
   if (mode === "add") {
      if (count.value <= 0) return;

      // if array is undefined, create the first element, else push new element
      if (userArray === undefined || userArray === null) {
         userArray = [
            {
               count: count.value,
               id: 1,
               date: currentDate,
               budget: budget.value,
               usedBudget: Math.round(percentageOfBudget.value),
            },
         ];
      } else {
         userArray.push({
            count: count.value,
            id: userArray.length + 1,
            date: currentDate,
            budget: budget.value,
            usedBudget: Math.round(percentageOfBudget.value),
         });
      }

      resetCounter();

      // set record in DB if logged in
      if (loggedIn.value) {
         setRecord();
      }
   }
}

/**
 * Stores the user's array of data (previous history and current count)
 * @param key the key used to store this value
 */
async function setRecord() {
   const key = localStorage.getItem("uuid");

   if (key === null || key === undefined) {
      toast.add({ title: "Could not save count; Try logging in." });
      return;
   }

   const setRecordResponse = await $fetch("/api/grocery/setRecord", {
      method: "post",
      body: {
         key: key + "groceryRecords",
         value: {
            list: userArray,
         },
      },
   });
   if (setRecordResponse === null || setRecordResponse === undefined) {
      toast.add({ title: "Error: invalid response from server" });
   } else if (setRecordResponse.error) {
      toast.add({ title: "Error: " + setRecordResponse.message });
   }
}


/**
 * Get's the user's saved budget
 * @param key the key used to retrieve this value
 */
 async function getUserBudget() {
  const key = localStorage.getItem("uuid");
  if(key === null || key === undefined){
    toast.add({ title: "Could not get budget; Try logging in." });
    return;
  }
  const records = await $fetch("/api/grocery/getBudget", {
    method: "post",
    body: { key: key + "groceryBudget" },
  });
  if (records === null || records === undefined) {
    toast.add({ title: "Error: invalid response from server" });
  } else if (records.error) {
    toast.add({ title: "Error: " + records.message });
  } else {
    if (records !== null && records !== undefined) {
      if (records.budget !== null && typeof records.budget === "number") {
        budget.value = records.budget;
      }
    }
  }
}

function updatePercentOfBudget() {
  percentageOfBudget.value = (count.value / budget.value) * 100;
}

onMounted(async () => {
   await nextTick();
   /**
    * keybind listeners
    */
   // window.addEventListener("keydown", (event) => {
   // });

   // find the name column and apply the colspan="4" attribute
   let nameColumn = document.querySelector(
      "table > thead > tr > th:nth-child(1)"
   );
   nameColumn.setAttribute("colspan", "4");
});

if (process.client) {
   list.value = getLists();
   // grab the list id from the URL
   let params = new URLSearchParams(window.location.search);
   currentList.value = params.get("listId");
   filterSelectedItems();

   if(loggedIn.value){
    getUserBudget();
   }
}
</script>

<template>
   <BreadcrumbHTML
      v-if="!focusMode"
      class="bg-primary-100/50 dark:bg-gray-800/50 rounded-full p-1 max-w-full"
   >
      <UBreadcrumb :ui="{ li: 'text-black text-xs' }" :links="links" />
   </BreadcrumbHTML>
   <div class="grid grid-cols-5 gap-4">
      <div v-if="!focusMode" class="col-span-3">
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
      </div>
      <div v-if="!focusMode" class="col-span-2">
         <UButton
            @click="toggleFocus"
            class="justify-center w-full mx-auto text-xl my-2 pr-1"
            icon="i-heroicons-eye-solid"
            variant="outline"
            >&nbsp;</UButton
         >
      </div>
   </div>
   <div v-if="list[currentList] !== undefined">
      <p class="text-2xl my-4">{{ list[currentList].name }}</p>
      <!-- Table of items on list -->
      <UTable
         :rows="filteredRows"
         :columns="columns"
         @select="select"         
         :empty-state="{
            icon: 'i-heroicons-shopping-cart-solid',
            label: 'No items added to shopping list.',
         }"
         :ui="{
            table:{
               base: 'w-full',
            },
            th: {
               base: '',
            },
            td: {
               base: 'w-full py-8 !text-lg text-wrap overflow-hidden',
            },
            tr: {
               base: 'w-full',
            },
            tbody: 'divide-y-0',
         }"
      >
         <template #name-header>
            <div class="">

               <UButton v-for="column in columns" :key="column.key" :ui="{base: 'inline-block'}">
                  {{ column.label }}
            </UButton>
               </div>
         </template>
         
         <template #name-data="row">
            <span
               v-if="row.row.quantity > 0"
               :class="{ linethrough: row.row.selected }"
            >
               {{ row.row.quantity }}x
            </span>
            <span v-else>&nbsp;&nbsp;</span>
            <span
               :class="{ linethrough: row.row.selected }"
               class="text-black dark:text-white"
               >{{ row.row.name }}</span
            >
         </template>
         <template #price-data="row">
            <span
               v-if="row.row.price > 0"
               :class="{ linethrough: row.row.selected }"
            >
               $<span v-if="row.row.quantity > 0">{{
                  row.row.price * row.row.quantity
               }}</span>
               <span v-else>{{ row.row.price }}</span>
            </span>
            <span v-else>&nbsp;</span>
         </template>
         <template #selected-data="row">
            <span v-if="row.row.selected">
               <svg height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                  <circle r="10" cx="10" cy="10" fill="rgb(74, 222, 128)" />
               </svg>
            </span>
            <span v-else class="bg-primary h-full w-full">
               <svg height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                  <circle r="10" cx="10" cy="10" fill="gray" />
               </svg>
            </span>
         </template>
         <template #department-data="row">
            <span :class="{ linethrough: row.row.selected }">{{
               row.row.department
            }}</span>
         </template>
      </UTable>

      <UDivider v-if="!focusMode" class="my-8" />

      <!-- Accordion, hides the list of selected items -->
      <UAccordion
         v-if="!focusMode"
         :items="selectedItemsAccordion"
         variant="solid"
      >
         <template #checked-items>
            <UTable
               :rows="list[currentList].selectedItems"
               :columns="columns"
               @select="select"
               :empty-state="{
                  icon: 'i-heroicons-shopping-cart-solid',
                  label: 'Checked off items show up here',
               }"
               :ui="{
                  th: {
                     base: 'hidden',
                  },
                  td: {
                     base: 'w-full py-8 !text-lg',
                  },
                  tr: {
                     base: 'w-full',
                  },
                  tbody: 'divide-y-0',
               }"
            >
               <template #name-data="row">
                  <span
                     v-if="row.row.quantity > 0"
                     :class="{ linethrough: row.row.selected }"
                  >
                     {{ row.row.quantity }}x
                  </span>
                  <span v-else>&nbsp;&nbsp;</span>
                  <span
                     class="text-black dark:text-white"
                     :class="{ linethrough: row.row.selected }"
                     >{{ row.row.name }}</span
                  >
               </template>
               <template #price-data="row">
                  <span
                     v-if="row.row.price > 0"
                     :class="{ linethrough: row.row.selected }"
                  >
                     $<span v-if="row.row.quantity > 0">{{
                        row.row.price * row.row.quantity
                     }}</span>
                     <span v-else>{{ row.row.price }}</span>
                  </span>
                  <span v-else>&nbsp;</span>
               </template>
               <template #selected-data="row">
                  <span v-if="row.row.selected">
                     <svg
                        height="20"
                        width="20"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <circle
                           r="10"
                           cx="10"
                           cy="10"
                           fill="rgb(74, 222, 128)"
                        />
                     </svg>
                  </span>
                  <span v-else class="bg-primary h-full w-full">
                     <svg
                        height="20"
                        width="20"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <circle r="10" cx="10" cy="10" fill="gray" />
                     </svg>
                  </span>
               </template>
               <template #department-data="row">
                  <span :class="{ linethrough: row.row.selected }">{{
                     row.row.department
                  }}</span>
               </template>
            </UTable>
            <UButton
               label="Clear checked items"
               @click="deleteSelectedItems"
               variant="outline"
               color="red"
               class="w-full"
            />
         </template>
      </UAccordion>

      <UDivider class="my-8" />
   </div>

   <div class="flex w-full justify-around">
      <UButton
         icon="i-heroicons-arrow-left"
         color="red"
         label="Exit Shop Mode"
         to="/grocery/lists"
         class="justify-center px-4"
         :class="focusMode ? 'w-2/5' : 'w-full'"
      />
      <UButton
         v-if="focusMode"
         @click="toggleFocus"
         icon="i-heroicons-eye-slash-solid"
         variant="outline"
         class="justify-center w-2/5 p-4"
      />
   </div>

   <div
      v-if="!showClicker"
      class="fabs"
      role="group"
      aria-label="floating action buttons"
   >
      <UButton
         class="rounded-full"
         icon="i-heroicons-chevron-up"
         @click="showClicker = true"
      />
   </div>

   <div
      v-if="showClicker"
      class="clicker-fabs p-2 clickerBackground"
      role="group"
      aria-label="floating action buttons"
   >
      <UButton
         @click="increment"
         class="rounded-full justify-center text-2xl py-6 px-7"
         size="xl"
         >+{{ incrementBy }}
      </UButton>
      <span class="text-center text-2xl">${{ count }}</span>
      <!-- reset counter -->
      <UButton
         @click="resetCounter"
         icon="i-heroicons-arrow-path-solid"
         class="rounded-full mb-2 w-full"
         color="red"
         ><em>Reset counter</em></UButton
      >
      <UButton
         @click="updateUserArray('add')"
         class="rounded-full mb-2 w-full justify-center"
         ><em>Submit Count</em></UButton
      >
      <UButton
         class="rounded-full w-full justify-center"
         icon="i-heroicons-chevron-down"
         @click="showClicker = false"
      />
   </div>

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
            <strong>Distraction free shopping mode.</strong>
         </p>
         <br />
         <p>
            Click <UIcon name="i-heroicons-eye-solid" /> to enter focus mode.
         </p>
         <br />
         <p>
            Tap an item to cross it off. There is a delay before it's removed so
            you can uncheck it, if it was by accident.
         </p>
         <br />
         <p>
            Checked items will be in the "checked items" list hidden below. Tap
            items there to re-add them to your list.
         </p>
         <br />
         <p>
            "Clear checked items" will remove all checked items from the checked
            items list.
         </p>
         <br />
         <p>
            Click <UIcon name="i-heroicons-chevron-up" /> to show the clicker.
            This is a simplified version of the clicker tool.
         </p>
         <br />
         <p>
            Note: Checked items will remain in your list and can be seen in the
            Edit list menu. They are deleted when you clear your checked items.
         </p>
      </UCard>
   </UModal>
</template>
<style>
.clickerBackground {
   background: rgba(255, 255, 255, 0.19);
   border-radius: 16px;
   box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
   backdrop-filter: blur(6.4px);
   -webkit-backdrop-filter: blur(6.4px);
}
.fabs {
   --_viewport-margin: 17.5vmin;

   position: fixed;
   z-index: var(--layer-1);

   inset-block: auto var(--_viewport-margin);
   inset-inline: auto var(--_viewport-margin);
   display: flex;
   flex-direction: column-reverse;
   place-items: center;
   gap: var(--_viewport-margin);
}
/* 
  inset-block: auto var(--_viewport-margin);
  inset-inline: auto var(--_viewport-margin); 
  --_viewport-margin: 17.5vmin;
*/
.clicker-fabs {
   position: fixed;
   z-index: var(--layer-1);
   inset-block: auto 5rem;
   inset-inline: auto 1rem;

   display: flex;
   flex-direction: column;
   place-items: center;
   gap: 3.5vmin;
}
</style>
