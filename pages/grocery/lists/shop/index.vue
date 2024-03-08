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
var sharedList = false;

var userArray;
// Grab the date
const currentDate = getCurrentDate("ymd");
// Budget for grocery trips
const budget = ref(100);
// percentage of budget
const percentageOfBudget = ref(0);

const columns = [
   [
      {
         key: "name",
         label: "Name",
         sortable: true,
         sorted: false,
         click: () => onSort("name"),
      },
      {
         key: "department",
         label: "Deptartment",
         sortable: true,
         sorted: false,
         click: () => onSort("department"),
      },
      {
         key: "price",
         label: "Price",
         sortable: true,
         sorted: false,
         click: () => onSort("price"),
      },
      {
         key: "quantity",
         label: "Quantity",
         sortable: true,
         sorted: false,
         click: () => onSort("quantity"),
      },
      {
         key: "selected",
         label: "Selected",
         class: "hidden",
      },
   ],
];

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
   if(!sharedList) setLists(list.value);
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
   if(!sharedList) setLists(list.value);
}

/**
 * Checks for items that have been selected, and hides them
 */
function filterSelectedItems() {
   let filteredItems = [];
   // ... is this necessary? lol idk.
   if (
      list.value === null ||
      list.value === undefined ||
      list.value[currentList.value] === undefined ||
      list.value[currentList.value] === null ||
      list.value[currentList.value].items === undefined ||
      list.value[currentList.value].items === null
   ) {
      filteredRows.value = filteredItems;
      return;
   }
   list.value[currentList.value].items.forEach((item) => {
      if (item === undefined || item === null) return;
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
   // find the element with id "bottom-nav" and hide it
   let bottomNav = document.getElementsByClassName("bottom-nav");
   bottomNav[0].style.display = focusMode.value ? "none" : "flex";
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
   if (!loggedIn.value) {
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
   if (key === null || key === undefined) {
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

/**
 * Updates the user's budget percent
 * only used to set the percentOfBudget value when storing the click total
 */
function updatePercentOfBudget() {
   percentageOfBudget.value = (count.value / budget.value) * 100;
}

/**
 * Sort's the list by the column
 * @param column the column to sort by
 */
function onSort(columnKey) {
   // find the column element with the key that matches columnKey
   let column = columns[0].find((element) => element.key === columnKey);

   let direction = column.sorted ? "asc" : "desc";
   column.sorted = !column.sorted;

   switch (column.key) {
      case "name":
         sortByLetter(direction);
         break;
      case "department":
         sortByLetter(direction);
         break;
      case "price":
         sortByNumber(direction);
      case "quantity":
         sortByNumber(direction);
         break;
      default:
         break;
   }

   filterSelectedItems();
}

/**
 * Sorts the list in alphebetical order
 * @param direction the direction to sort
 */
function sortByLetter(direction) {
   switch (direction) {
      case "asc":
         list.value[currentList.value].items.sort((a, b) => {
            if (a.name < b.name) {
               return -1;
            }
            if (a.name > b.name) {
               return 1;
            }
            return 0;
         });
         break;

      case "desc":
         list.value[currentList.value].items.sort((a, b) => {
            if (a.name < b.name) {
               return 1;
            }
            if (a.name > b.name) {
               return -1;
            }
            return 0;
         });
         break;

      default:
         log("Invalid sort direction");
         break;
   }
}

/**
 * Sorts the list by numerical value
 * @param direction the direction to sort
 */
function sortByNumber(direction) {
   switch (direction) {
      case "asc":
         list.value[currentList.value].items.sort((a, b) => {
            return a.price - b.price;
         });
         break;

      case "desc":
         list.value[currentList.value].items.sort((a, b) => {
            return b.price - a.price;
         });
         break;

      default:
         log("Invalid sort direction");
         break;
   }
}

/**
 * Serialize's the current list's item array, encodes 
 * them in url params, and then copies that are a 
 * shareable link to the user's clipboard
 */
function serializeItemList() {
   const items = list.value[currentList.value].items;
   const encodedItems = encodeURIComponent(JSON.stringify(items));
   const urlParams = new URLSearchParams();
   urlParams.append("items", encodedItems);
   const shareableLink = `${window.location.origin}/grocery/lists/shop?${urlParams.toString()}`;
   log(shareableLink);
   navigator.clipboard.writeText(shareableLink);
   toast.add({ title: "Link copied to clipboard" });
}

/**
 * un-serializes the items from the url params and 
 * sets the list to the items
 */
function unserializeItemList() {
   let params = new URLSearchParams(window.location.search);
   let items = params.get("items");
   if (items === null || items === undefined) return;
   items = JSON.parse(decodeURIComponent(items));
   if(items === null || items === undefined) return;
   list.value[currentList.value] = {
      name:"Shared List",
      items: items,
      selectedItems: [],
   }
   filterSelectedItems();
}

onMounted(async () => {
   await nextTick();
   /**
    * keybind listeners
    */
   // window.addEventListener("keydown", (event) => {
   // });
});

if (process.client) {
   list.value = getLists();
   // grab the list id from the URL
   let params = new URLSearchParams(window.location.search);
   currentList.value = params.get("listId");

   // if no list id was passed, we're in a shared list, probably.
   if(currentList.value === null || currentList.value === undefined){
      currentList.value = 0;
      sharedList = true;
   }

   // if the list[currentList].selectedItems array is null
   if (
      list.value[currentList.value].selectedItems === null ||
      list.value[currentList.value].selectedItems === undefined
   ) {
      list.value[currentList.value].selectedItems = [];
   }

   filterSelectedItems();

   if (loggedIn.value) {
      getUserBudget();
   }
   unserializeItemList();
}
</script>

<template>
   <BreadcrumbHTML
      v-if="!focusMode"
      class="bg-primary-100/50 dark:bg-gray-800/50 rounded-full p-1 max-w-full"
   >
      <UBreadcrumb :ui="{ li: 'text-black text-xs' }" :links="links" />
   </BreadcrumbHTML>
   <div>
      <div v-if="!focusMode">
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
   </div>
   <div v-if="list[currentList] !== undefined">
      <p class="text-2xl my-4">{{ list[currentList].name }}</p>

      <div v-if="!focusMode" class="overflow-x-scroll flex pb-4">
         <UButton
            class="mx-1 rounded-full"
            size="lg"
            variant="outline"
            icon="i-heroicons-share-solid"
            @click="serializeItemList"
         >
            Share
         </UButton>
         <UButton
            class="mx-1 rounded-full"
            size="lg"
            variant="outline"
            icon="i-heroicons-user-plus-solid"
         >
            Invite
         </UButton>
         <UDropdown :items="columns">
            <UButton class="mx-1 rounded-full" size="lg" variant="outline">
               Sort
               <UIcon name="i-heroicons-chevron-down-solid" />
            </UButton>
         </UDropdown>
      </div>
      <!-- shopping grid -->
      <div
         v-for="item in filteredRows"
         :key="item.id"
         class="grid grid-cols-12 my-8"
         :class="item.selected ? 'relative' : ''"
         @click="select(item)"
      >
         <!-- Checkbox -->
         <div class="col-span-1 text-end row-span-2 my-auto">
            <UCheckbox v-model="item.selected" :ui="{base:'w-6 h-6'}"/>
         </div>

         <!-- quantity -->
         <div class="col-span-1 text-end row-span-2">
            <span v-if="item.quantity > 0" class="text-xl text-gray-400">
               x{{ item.quantity }}&nbsp;
            </span>
            <span v-else> &nbsp; </span>
         </div>

         <!-- Name -->
         <div class="col-span-8 overflow-clip">
            <span class="text-3xl">{{ item.name }}</span>
         </div>

         <!-- price with no quantity -->
         <div
            v-if="item.price > 0 && item.quantity <= 0"
            class="col-span-2 text-start row-span-2"
         >
            <span class="text-xl text-gray-400"> ${{ item.price }} </span>
         </div>

         <!-- price with quantity -->
         <div
            v-else-if="item.price > 0 && item.quantity > 0"
            class="row-span-1 text-start"
         >
            <span class="text-xl text-gray-400">
               ${{ item.price * item.quantity }}
            </span>
         </div>

         <!-- no price -->
         <div class="col-span-2 row-span-2" v-else>&nbsp;</div>

         <!-- Row 2 -->

         <!-- department -->
         <div class="col-span-8 text-gray-400 text-sm">
            {{ item.department }}
         </div>
         <!-- price with quantity, row 2 -->
         <div
            v-if="item.price > 0 && item.quantity > 0"
            class="col-span-2 text-start row-span-1"
         >
            <span class="text-sm text-gray-400"> ${{ item.price }}/ea </span>
         </div>

         <!-- Cross out item -->
         <div v-if="item.selected">
            <!-- when item is selected, make a divider cross through the center of the row -->
            <div class="absolute inset-3 px-4">
               <UDivider
                  size="md"
                  :ui="{
                     icon: {
                        base: 'text-primary-500 dark:text-primary-400 w-8 h-8',
                     },
                     border: {
                        base: 'border-primary-500 dark:border-primary-400',
                     },
                  }"
                  icon="i-heroicons-check-circle-solid"
               />
            </div>
         </div>
      </div>
      <div v-if="filteredRows.length === 0">
         <p class="text-center text-2xl text-gray-400 py-4">No items in list</p>
      </div>

      <!-- Selected items list -->
      <!-- Accordion, hides the list of selected items -->
      <UAccordion
         v-if="!focusMode"
         :items="selectedItemsAccordion"
         variant="solid"
      >
         <template #checked-items>
            <div
               v-for="item in list[currentList].selectedItems"
               :key="item.id"
               class="grid grid-cols-12 my-8"
               :class="item.selected ? 'relative' : ''"
               @click="select(item)"
            >

               <!-- Checkbox -->
               <div class="col-span-1 text-end row-span-2 my-auto">
                  <UCheckbox v-model="item.selected" :ui="{base:'w-6 h-6'}"/>
               </div>

               <!-- quantity -->
               <div class="col-span-1 text-end row-span-2">
                  <span v-if="item.quantity > 0" class="text-xl text-gray-400">
                     x{{ item.quantity }}&nbsp;
                  </span>
                  <span v-else> &nbsp; </span>
               </div>

               <!-- Name -->
               <div class="col-span-8 overflow-clip">
                  <span class="text-3xl">{{ item.name }}</span>
               </div>

               <!-- price with no quantity -->
               <div
                  v-if="item.price > 0 && item.quantity <= 0"
                  class="col-span-2 text-start row-span-2"
               >
                  <span class="text-xl text-gray-400"> ${{ item.price }} </span>
               </div>

               <!-- price with quantity -->
               <div
                  v-else-if="item.price > 0 && item.quantity > 0"
                  class="col-span-2 row-span-1 text-start"
               >
                  <span class="text-xl text-gray-400">
                     ${{ item.price * item.quantity }}
                  </span>
               </div>

               <!-- no price -->
               <div class="col-span-2 row-span-2" v-else>&nbsp;</div>

               <!-- Row 2 -->

               <!-- department -->
               <div class="col-span-8 text-gray-400 text-sm">
                  {{ item.department }}
               </div>
               <!-- price with quantity, row 2 -->
               <div
                  v-if="item.price > 0 && item.quantity > 0"
                  class="col-span-2 text-start row-span-1"
               >
                  <span class="text-sm text-gray-400">
                     ${{ item.price }}/ea
                  </span>
               </div>

               <!-- Cross out item -->
               <div v-if="item.selected">
                  <!-- when item is selected, make a divider cross through the center of the row -->
                  <div class="absolute inset-3 px-4">
                     <UDivider
                        size="md"
                        :ui="{
                           icon: {
                              base: 'text-primary-500 dark:text-primary-400 w-8 h-8',
                           },
                           border: {
                              base: 'border-primary-500 dark:border-primary-400',
                           },
                        }"
                        icon="i-heroicons-check-circle-solid"
                     />
                  </div>
               </div>
            </div>
            <div v-if="list[currentList].selectedItems.length === 0">
               <p class="text-center text-2xl text-gray-400 py-4">No items in list</p>
            </div>
         </template>
      </UAccordion>
      <UButton
         label="Clear checked items"
         @click="deleteSelectedItems"
         variant="outline"
         color="red"
         class="w-full mt-10"
      />
      <UDivider class="my-8" />
   </div>

   <div class="flex w-full justify-around">
      <UButton
         icon="i-heroicons-arrow-left"
         color="red"
         label="Exit Shop Mode"
         to="/grocery/lists"
         class="justify-center px-4 w-2/5"
      />
      <UButton
         @click="toggleFocus"
         :icon="
            focusMode ? 'i-heroicons-eye-slash-solid' : 'i-heroicons-eye-solid'
         "
         variant="outline"
         class="justify-center w-2/5 p-4"
      />
   </div>

   <div
      v-if="!showClicker"
      class="fabs"
      :class="focusMode ? '' : 'fabs-above-nav'"
      role="group"
      aria-label="floating action buttons"
   >
      <UButton
         size="xl"
         icon="i-heroicons-chevron-up"
         @click="showClicker = true"
      />
   </div>

   <div
      v-if="showClicker"
      class="fabs p-2 clickerBackground !flex-col"
      :class="focusMode ? '' : 'fabs-above-nav'"
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
</style>
