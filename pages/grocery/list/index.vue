<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";

// auth
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// For notifications
const toast = useToast();

// show/hide things
const showExplanation = ref(false);

const showEditScreen = ref(false);
const showShoppingScreen = ref(false);

const showEditItem = ref(false);

const currentList = ref(0);

const currentItem = ref(0);

const list = ref([]);

const dragList = [
   { name: "John", id: 0 },
   { name: "Joao", id: 1 },
   { name: "Jean", id: 2 }
];

const drag = false;

// show/hide the list
const showList = computed(() => {
   if (list.value === null || list.value === undefined) return;
   return list.value.length > 0;
});

const showItems = computed(() => {
   if (list.value === null || list.value === undefined) return;
   let currentListItems = list.value[currentList.value].items;
   return currentListItems.length > 0;
});


// this arrow function outputs the input to console
const log = (input:any) => console.log(input);

const selectedItemsAccordion = ref([
   {
      label: "Checked items",
      slot: "checked-items",
   },
]);

const links = getBreadcrumbs([
   { name: "Grocery", icon: "i-heroicons-shopping-bag-solid", url: "/grocery" },
   {
      name: "List",
      icon: "i-heroicons-list-bullet",
      url: "/grocery/list",
   },
]);

const filteredRows = ref([]);

const columns = [
   {
      key: "name",
      label: "Name",
      sortable: true,
   },
   {
      key: "department",
      label: "Dept.",
      sortable: true,
   },
   {
      key: "price",
      label: "Price",
      sortable: true,
   },
   {
      key: "selected",
      label: "Selected",
      sortable: false,
   },
];

const departments = [
   "",
   "Produce",
   "Meat",
   "Seafood",
   "Beer and Wine",
   "Health and Beauty",
   "Deli",
   "Bakery",
   "Dairy",
   "Frozen Foods",
   "Canned Goods",
   "Beverages",
   "Snacks",
   "Refrigerated Section",
   "Freezer Section",
   "Checkout",
   "Bulk Food",
   "Pharmacy",
   "Hardware", 
   "Tools", 
   "Toiletries", 
   "Garden", 
   "Home and Kitchen",
   "Condiments"
];

/**
 * Shows the edit screen for the selected list
 * @param index the index of the current list
 */
function showEdit(index: number) {
   showEditScreen.value = true;
   currentList.value = index;

   // update the shopping list
   filterSelectedItems();
}

/**
 * Shows the shop screen for the selected list
 * @param index the index of the current list
 */
function showShop(index: number) {
   showShoppingScreen.value = true;
   currentList.value = index;
   // update the shopping list
   filterSelectedItems();
}

/**
 * Adds a new item to the current list
 */
async function newItem(index: number) {
   let emptyItem = {
      name: "",
      price: 0,
      quantity: 0,
      department: "",
      id: "0",
      selected: false,
   };
   let currentListItems = list.value[currentList.value].items;
   if (currentListItems === null || currentListItems === undefined) {
      currentListItems = [emptyItem];
   } else {
      // if we're editing any field besides the last one
      if (index + 1 !== currentListItems.length && index !== -1) return;
      emptyItem.id = uuidv4();
      currentListItems.push(emptyItem);
   }

   await nextTick();
   document.getElementById(emptyItem.id)?.focus();

   // store in cache
   setLists();
   // update the shopping list
   filterSelectedItems();
}

/**
 * Removes the item from the current list
 */
function deleteItem(itemIndex: number) {
   let currentListItems = list.value[currentList.value].items;
   if (currentListItems === null || currentListItems === undefined) return;

   // if it was selected, remove it from the selected array as well
   if (currentListItems[itemIndex].selected) {
      list.value[currentList.value].selectedItems.forEach((item, index) => {
         // if the ids match
         if (item.id === currentListItems[itemIndex].id) {
            list.value[currentList.value].selectedItems.splice(index, 1);
         }
      });
   }

   // remove from items array
   currentListItems.splice(itemIndex, 1);

   setLists();
   // update the shopping list
   filterSelectedItems();
}

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
   let shallowItemsCopy: any[] = [];

   // remove the selected items from the items array
   list.value[currentList.value].items.forEach((item, index) => {
      // all the non-selected items, add to a copy
      if (!item.selected) {
         shallowItemsCopy.push(item);
      }
   });
   // set all items to the copy
   list.value[currentList.value].items = shallowItemsCopy;
   setLists();
}
/**
 * Opens the edit item modal and set's the current item we're editing
 */

async function editItem(index: number) {
   currentItem.value = index;
   showEditItem.value = true;
   setLists();
   // update the shopping list
   filterSelectedItems();
   // wait for modal to show up then focus on submit button
   // this is just to preven the keyboard from popping up
   await nextTick();
   document.getElementById("submitEditItem")?.focus();
}

/**
 * Creates a new list
 */
function newList() {
   let emptyList = {
      name: "New list",
      items: [],
   };
   if (list.value === null || list.value === undefined) {
      list.value = [emptyList];
   } else {
      list.value.push(emptyList);
   }
   setLists();
   // update the shopping list
   filterSelectedItems();
}

/**
 * Deletes a list
 */
function deleteList(index: number) {
   let thisList = list.value;
   if (thisList === null || thisList === undefined) return;

   thisList.splice(index, 1);
   setLists();
   // update the shopping list
   filterSelectedItems();
}

/**
 * set's a user's lists in cache
 */
function setLists() {
   localStorage.setItem("lists", JSON.stringify(list.value));
}

/**
 * get the user's shopping lists
 */
function getLists() {
   const storedList = JSON.parse(localStorage.getItem("lists"));

   // if the stored list was not empty, set it
   if (storedList !== null && storedList !== undefined) {
      list.value = storedList;
   }
}

/**
 * Select listener to select items in shopping list
 * @param row current row
 */
async function select(row) {
   // empty item in case we have an undefined list?
   let item: any[] = [];

   // plz don't be undefined uwu
   if (list.value[currentList.value].selectedItems === undefined) {
      list.value[currentList.value].selectedItems = item;
   }

   // grab selected items array
   let selected = list.value[currentList.value].selectedItems;
   let items = list.value[currentList.value].items;
   let itemShallowCopy: any[] = [];

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
   setLists();
}

/**
 * Checks for items that have been selected, and hides them
 */
function filterSelectedItems() {
   let filteredItems: any[] = [];
   if (
      list.value[currentList.value] === undefined ||
      list.value[currentList.value] === null
   ) {
      filteredRows.value = filteredItems;
      return;
   }
   list.value[currentList.value].items.forEach((item) => {
      
      // filter out any items that don't have a name, we don't need these.
      if (item.name === "" || item.name === undefined || item.name === null)
         return;
      if (!item.selected) {
         filteredItems.push(item);
      }
   });

   filteredRows.value = filteredItems;
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

if (process.client) {
   getLists();
   filterSelectedItems();
}

onMounted(async () => {
   await nextTick();
   /**
    * keybind listeners
    */
   window.addEventListener("keydown", (event) => {
      switch (event.code) {
         case "Enter":
            // if we're editing an input field, it's likely going to be one of our
            // list items. We add a new one when we're hitting enter on the last item
            // in the list.
            if (event.target.localName === "input") {
               // using the ID from the event target, we can find the index of the item in the list
               let index = list.value[currentList.value].items.findIndex(
                  (item) => item.id === event.target.id                  
               );
               // if the index is not the last item in the list, we don't want to add a new item
               if (index + 1 === list.value[currentList.value].items.length){
                  newItem(-1);
               }
            }

            // if our target is a text area, we want to prevent new lines from being
            // added so prevent the default action.

            // NOTE for future Evan: this means all "enter" key presses will have to be
            // controlled manually, more or less.

            if (event.target.localName === "textarea") {
               event.preventDefault();
            }
            // if the target id is "editItemName" we want to focus on the next field
            if (event.target.id === "editItemName") {
               document.getElementById("editItemPrice")?.focus();
            }
            // if the target id is "editItemPrice" we want to focus on the next field
            if (event.target.id === "editItemPrice") {
               document.getElementById("editItemQuantity")?.focus();
            }
            // if the target id is "editItemQuantity" we want to focus on the next field
            if (event.target.id === "editItemQuantity") {
               document.getElementById("editItemDepartment")?.focus();
            }
            // if the target id is "editItemDepartment" we want to focus on the submit button
            if (event.target.id === "editItemDepartment") {
               document.getElementById("submitEditItem")?.focus();
            }
            break;
         default:
            break;
      }
   });
});
</script>

<template>
   <BreadcrumbHTML
      class="bg-primary-100/50 dark:bg-gray-800/50 rounded-full p-1"
   >
      <UBreadcrumb :ui="{ li: 'text-black text-xs' }" :links="links" />
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

   <!-- The list -->
   <div v-if="showList">
      <div
         v-for="(item, index) in list"
         class="p-2 my-2 w-full text-center items-center flex-col border border-gray-300/25 dark:border-gray-800/25 rounded-lg text-xl flex bg-gray-300/25 dark:bg-gray-800/50"
      >
         <div class="flex w-full">
            <UTextarea
               :ui="{ size: { xl: 'text-2xl' } }"
               class="w-full"
               size="xl"
               v-model="item.name"
               variant="none"
               :rows="1"
               autoresize
               :maxrows="3"
               :padded="false"
               @change="setLists"
            />
            <UButton
               icon="i-heroicons-x-mark"
               variant="ghost"
               color="red"
               @click="deleteList(index)"
            />
         </div>
         <UButton
            label="Edit list"
            class="w-full my-2"
            icon="i-heroicons-pencil-solid"
            @click="showEdit(index)"
         />
         <UButton
            label="Shop this list"
            class="w-full my-2"
            icon="i-heroicons-shopping-cart-solid"
            @click="showShop(index)"
         >
            <template #trailing>
               <UIcon name="i-heroicons-arrow-right" />
            </template>
         </UButton>
      </div>
   </div>
   <div v-else>
      <p>Add an item to your list using the button below!</p>
   </div>

   <!-- The add list item floating button -->
   <div class="relative py-8">
      <div class="absolute addItem">
         <UButton icon="i-heroicons-plus" @click="newList" />
      </div>
   </div>

   <!-- The edit screen/overlay -->
   <div
      v-if="showEditScreen"
      class="h-full fixed w-full top-0 right-0 left-0 bottom-0 z-10 bg-white dark:bg-black p-4 border border-white dark:border-black rounded-lg overflow-auto"
   >
      <p class="text-xl">{{ list[currentList].name }}</p>
      <UDivider />
      <p><em>Start typing and hit enter to add a new item.</em></p>
      <p>
         <em
            >Drag <UIcon name="i-heroicons-chevron-up-down" /> to re-order an
            item.<br />Click <UIcon name="i-heroicons-pencil-solid" /> to edit
            an item and <UIcon name="i-heroicons-x-mark" /> to delete it.
         </em>
      </p>

         <div v-for="(item, index) in list[currentList].items" v-if="showItems" :key="item.id"
         class="grid grid-cols-8 items-center border border-gray-300 dark:border-gray-800 rounded-lg my-2">
            <UButton
               class="border-r border-gray-300 dark:border-gray-800 rounded-none inline-block py-3"
               icon="i-heroicons-chevron-up-down"
               name="Reorder item"
               variant="ghost"
            />
            <UButton
               class="border-r border-gray-300 dark:border-gray-800 rounded-none inline-block py-3"
               icon="i-heroicons-pencil-solid"
               name="Edit item"
               variant="ghost"
               @click="editItem(index)"
            />
            <UInput
               v-model="item.name"
               type="text"
               @change="setLists(),filterSelectedItems()"
               class="inline-block col-span-5 mx-2"
               :class="{ linethrough: item.selected }"
               :id="item.id"
            >
            </UInput>
            <UButton
               class="border-l border-gray-300 dark:border-gray-800 rounded-none inline-block py-3"
               icon="i-heroicons-x-mark"
               color="red"
               name="Delete item"
               variant="ghost"
               @click="deleteItem(index)"
            />
            </div>
      <UButton
         label="Add item"
         @click="newItem(-1)"
         class="w-full text-xl justify-center my-4"
      />

      <UButton
         label="Close List"
         color="red"
         @click="showEditScreen = false"
         class="w-full text-xl justify-center my-4"
      />
   </div>

   <!-- The shopping screen/overlay -->
   <div
      v-if="showShoppingScreen"
      class="h-full fixed w-full top-0 right-0 left-0 bottom-0 z-10 bg-white dark:bg-black p-4 border border-white dark:border-black rounded-lg overflow-auto"
   >
      <p class="text-xl">{{ list[currentList].name }}</p>
      <UDivider />

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
            th: {
               base: 'hidden',
            },
            td: {
               base: 'border-0 w-full',
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

      <UDivider class="my-8" />

      <!-- Accordion, hides the list of selected items -->
      <UAccordion :items="selectedItemsAccordion" variant="solid">
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
                     base: 'border-0 w-full',
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
                     class="text-white"
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

      <UButton
         label="Leave shopping mode"
         @click="showShoppingScreen = false"
         class="w-full text-xl justify-center my-4"
      />
   </div>

   <!-- Edit item modal -->
   <UModal
      :ui="{ container: 'items-center' }"
      v-model="showEditItem"
      prevent-close
   >
      <UCard>
         <template #header>
            <UFormGroup label="Item">
               <!-- <UInput
                  v-model="list[currentList].items[currentItem].name"
                  type="text"
                  /> -->
               <UTextarea
                  :ui="{ size: { xl: 'text-2xl' } }"
                  class="w-full"
                  size="xl"
                  v-model="list[currentList].items[currentItem].name"
                  variant="none"
                  :rows="1"
                  autoresize
                  :maxrows="3"
                  :padded="false"
                  @change="setLists"
                  id="editItemName"
               />
            </UFormGroup>
         </template>
         <div class="grid grid-cols-1 gap-4">
            <UFormGroup label="Price">
               <UInput
                  v-model="list[currentList].items[currentItem].price"
                  type="number"
                  id="editItemPrice"
               >
                  <template #leading>$</template>
                  <template #trailing>ea</template>
               </UInput>
            </UFormGroup>
            <UFormGroup label="Quantity">
               <UInput
                  v-model="list[currentList].items[currentItem].quantity"
                  type="number"
                  id="editItemQuantity"
               />
            </UFormGroup>
            <UFormGroup label="Department">
               <USelect
                  v-model="list[currentList].items[currentItem].department"
                  :options="departments"
                  id="editItemDepartment"
               />
            </UFormGroup>
         </div>
         <template #footer>
            <UButton
               class="w-full justify-center my-2"
               type="submit"
               label="submit"
               @click="(showEditItem = false), setLists(),filterSelectedItems()"
               id="submitEditItem"
            />
         </template>
      </UCard>
   </UModal>

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
            <strong>Create shopping lists for different stores.</strong>
         </p>
         <br />
         <p class="text-sm">
            Click the "+" button to add a new list and "Edit List" to
            add/remove/edit items on the list.
         </p>
         <br />
         <p class="text-sm">
            Click "Shop this List" to enter "Shopping mode". This screen makes
            it easier to view, sort, and check off the items in your list.
         </p>
      </UCard>
   </UModal>
</template>

<style>
.addItem {
   bottom: -2%;
   left: 89%;
}
.linethrough {
   text-decoration: line-through;
}
</style>
