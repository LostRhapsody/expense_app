<script setup>
import { v4 as uuidv4 } from "uuid";
import { SlickList, SlickItem, DragHandle } from "vue-slicksort";

// auth
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// For notifications
const toast = useToast();

// show/hide things
const showExplanation = ref(false);
const showEditItem = ref(false);

const currentList = ref(0);
const list = ref([]);

const currentItem = ref(0);

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
      icon: "i-heroicons-pencil-solid",
      url: "/grocery/lists/edit",
   },
]);

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
   "Condiments",
];

/**
 * Adds a new item to the current list
 */
async function newItem(index) {
   let emptyItem = {
      name: "",
      price: 0,
      quantity: 0,
      department: "",
      id: uuidv4(),
      selected: false,
   };
   let currentListItems = list.value[currentList.value].items;
   if (currentListItems === null || currentListItems === undefined) {
      currentListItems = [emptyItem];
   } else {
      // if we're editing any field besides the last one
      if (index + 1 !== currentListItems.length && index !== -1) return;
      currentListItems.push(emptyItem);
   }

   await nextTick();
   document.getElementById(emptyItem.id)?.focus();

   // store in cache
   setLists(list.value);
}

/**
 * Removes the item from the current list
 */
function deleteItem(itemIndex) {
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

   setLists(list.value);
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
 * Opens the edit item modal and set's the current item we're editing
 */

async function editItem(index) {
   currentItem.value = index;
   showEditItem.value = true;
   // wait for modal to show up then focus on submit button
   // this is just to preven the keyboard from popping up
   await nextTick();
   document.getElementById("submitEditItem")?.focus();
}

/**
 * Set's the list to the new order.
 * @param event contains the re-ordered list
 */
function sortTheList(event) {
   list.value[currentList.value].items = event;
   setLists(list.value);
   // update the shopping list
}

onMounted(async () => {
   await nextTick();
   /**
    * keybind listeners
    */
   window.addEventListener("keydown", (event) => {
      let key;
      // I hate this, but on mobile it's key, and on desktop it's both, but
      // code is the recommended way to get the key code. So we have to check both.
      if(event.code === "" || event.code === undefined){
         key = event.key
      } else {
         key = event.code;
      }
      switch (key) {
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
               if (index + 1 === list.value[currentList.value].items.length) {
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

if (process.client) {
   list.value = getLists();
   // grab the list id from the URL
   let params = new URLSearchParams(window.location.search);
   currentList.value = params.get('listId');
}
</script>
<template>
   <BreadcrumbHTML
      class="bg-primary-100/50 dark:bg-gray-800/50 rounded-full p-1 max-w-full"
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
   <p class="text-2xl my-4">{{ list[currentList].name }}</p>
   <SlickList
      @update:list="sortTheList($event)"
      axis="y"
      v-model:list="list[currentList].items"
      useDragHandle
   >
      <template #item="{ item, index }">
         <div
            v-if="showItems"
            class="grid grid-cols-8 items-center border border-gray-300 dark:border-gray-800 rounded-lg my-2"
         >
            <DragHandle
               class="border-r border-gray-300 dark:border-gray-800 rounded-none inline-block py-3"
            >
               <UButton
                  icon="i-heroicons-chevron-up-down"
                  name="Reorder item"
                  variant="ghost"
               />
            </DragHandle>
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
               @change="setLists(list)"
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
      </template>
   </SlickList>
   <UButton
      label="Add item"
      icon="i-heroicons-plus-solid"
      @click="newItem(-1)"
      class="w-full text-xl justify-center my-4"
   />
   <UButton
      label="Finished editing"
      icon="i-heroicons-arrow-left"
      color="red"
      to="/grocery/lists"
      class="w-full text-xl justify-center my-4"
   />
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
                  @change="setLists(list)"
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
               @click="
                  (showEditItem = false), setLists(list)
               "
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
            <strong>Edit shopping list items.</strong>
         </p>
         <br />
         <p>Start typing and hit enter to add a new item.</p>
         <br />
         <p>
            Drag <UIcon name="i-heroicons-chevron-up-down" /> to re-order an
            item.
         </p>
         <br />
         <p>
            Click <UIcon name="i-heroicons-pencil-solid" /> to edit an item and
            <UIcon name="i-heroicons-x-mark" /> to delete it.
         </p>
         <br />
         <p>
            When editing an item, you can set the quantity, price, 
            and department of the store the item is from. These are all optional.
         </p>
      </UCard>
   </UModal>
</template>
