<script setup lang="ts">
import { _listStyleImage } from '#tailwind-config/theme';

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
const selectedItems = ref([]);

// show/hide the list
const showList = computed(() => {
   if (list.value === null || list.value === undefined) return;
   return list.value.length > 0;
});

const showItems = computed(() => {
   let currentListItems = list.value[currentList.value].items;
   if (list.value === null || list.value === undefined) return;
   return currentListItems.length > 0;
});

const links = getBreadcrumbs([
   { name: "Grocery", icon: "i-heroicons-shopping-bag-solid", url: "/grocery" },
   {
      name: "List",
      icon: "i-heroicons-list-bullet",
      url: "/grocery/list",
   },
]);

const q = ref('')

/**
 * Computed value to sort the shopping list table
 */
const filteredRows = computed(() => {
  if (!q.value) {
    return list.value[currentList.value].items
  }

  return list.value[currentList.value].items.filter((item) => {
    return Object.values(item).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase())
    })
  })
})

const columns = [{
   key:"name", label:"Name", sortable:true
},{
   key:"price",label:"Price", sortable:true
},{
   key:"quantity",label:"Quantity", sortable:true
},{
   key:"department",label:"Dept.", sortable:true
}
];


/**
 * Shows the edit screen for the selected list
 * @param index the index of the current list
 */
function showEdit(index: number) {
   showEditScreen.value = true;
   currentList.value = index;
}

/**
 * Shows the shop screen for the selected list
 * @param index the index of the current list
 */
 function showShop(index: number) {
   showShoppingScreen.value = true;
   currentList.value = index;
}

/**
 * Adds a new item to the current list
 */
async function newItem(index: number) {
   let emptyItem = {
      name: "",
      price: 0,
      quantity: 1,
      department: "",
      id: "0"
   };
   let currentListItems = list.value[currentList.value].items;
   if (currentListItems === null || currentListItems === undefined) {
      currentListItems = [emptyItem];
   } else {
      // if we're editing any field besides the last one
      if (index + 1 !== currentListItems.length && index !== -1) return;
      emptyItem.id = currentListItems.length.toString();
      currentListItems.push(emptyItem);
   }
   await nextTick();
   document.getElementById(emptyItem.id)?.focus();

   // store in cache
   setLists();

}

/**
 * Removes the item from the current list
 */
function deleteItem(index: number) {

   let currentListItems = list.value[currentList.value].items;
   if (currentListItems === null || currentListItems === undefined) return;

   currentListItems.splice(index, 1);
   setLists();
}

/**
 * Opens the edit item modal and set's the current item we're editing
 */

function editItem(index: number) {
   currentItem.value = index;
   showEditItem.value = true;
   setLists();
}

/**
 * Creates a new list
 */
function newList() {
   let emptyList = {
      name: "New list",
      items: [{
         name: "",
         price: 0,
         quantity: 1,
         department: "",
         id: "0"
      }]
   };
   if (list.value === null || list.value === undefined) {
      list.value = [emptyList];
   } else {
      list.value.push(emptyList);
   }
   setLists();
}

/**
 * Deletes a list
 */
function deleteList(index: number) {
   let thisList = list.value;
   if (thisList === null || thisList === undefined) return;

   thisList.splice(index, 1);
   setLists();
}

/**
 * set's a user's lists in cache
 */
function setLists() {
   console.log("setting lists");

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
function select (row) {
  let selected = selectedItems.value[currentList.value].items;
  if(selected === undefined){
   selected = [];
  }
  const index = selected.findIndex((item) => item === row.id)
  if (index === -1) {
   selected.push(row)
  } else {
   selected.splice(index, 1)
  }
}

getLists();
</script>

<template>
   <BreadcrumbHTML class="bg-primary-100/50 dark:bg-gray-800/50 rounded-full p-1 ">
      <UBreadcrumb :ui="{ li: 'text-black text-xs' }" :links="links" />
   </BreadcrumbHTML>
   <UButton @click="showExplanation = !showExplanation" class="justify-center w-full mx-auto text-xl my-2"
      icon="i-heroicons-information-circle-solid" variant="outline">
      How to use
      <img alt="An icon of a budgie, which is a kind of bird." class="inline-block text-primary" src="/edited_budgie.svg"
         height="25" width="25" />
   </UButton>

   <!-- The list -->
   <div v-if="showList">
      <div v-for="(item, index) in list"
         class="p-2 my-2 w-full text-center items-center flex-col border border-gray-300/25 dark:border-gray-800/25 rounded-lg text-xl flex bg-gray-300/25 dark:bg-gray-800/50">
         <div class="flex">
            <UTextarea :ui="{ size: { xl: 'text-2xl' } }" class="w-full" size="xl" v-model="item.name" variant="none"
               :rows="1" autoresize :maxrows="3" :padded="false" @change="setLists" />
            <UButton icon="i-heroicons-x-mark" variant="ghost" color="red" @click="deleteList(index)" />
         </div>
         <UButton label="Edit list" class="w-full my-2" icon="i-heroicons-pencil-solid" @click="showEdit(index)" />
         <UButton label="Shop this list" class="w-full my-2" icon="i-heroicons-shopping-cart-solid" @click="showShop(index)" />
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
   <div v-if="showEditScreen"
      class="h-full fixed w-full top-0 right-0 left-0 bottom-0 z-10 bg-white dark:bg-black p-4 border border-white dark:border-black rounded-lg overflow-auto">
      <p class="text-xl">{{ list[currentList].name }} List</p>
      <UDivider />
      <p><em>Start typing and hit enter to add a new item.</em></p>
      <p><em>Click
            <UIcon name="i-heroicons-pencil-solid" /> to edit an item and
            <UIcon name="i-heroicons-x-mark" /> to delete it.
         </em></p>
      <!-- Inputs for items -->
      <div v-for="(item, index) in list[currentList].items" v-if="showItems">
         <div class="items-center flex border border-gray-300 dark:border-gray-800 rounded-lg justify-between my-2">
            <UButton class="border-r border-gray-300 dark:border-gray-800 rounded-none inline-block py-3"
               icon="i-heroicons-pencil-solid" name="Edit item" variant="ghost" @click="editItem(index)" />
            <UInput :id="item.id" v-model="item.name" type="text" @change="newItem(index), setLists()"
               class="inline-block">
            </UInput>
            <UButton class="border-l border-gray-300 dark:border-gray-800 rounded-none inline-block py-3"
               icon="i-heroicons-x-mark" name="Delete item" variant="ghost" @click="deleteItem(index)" />
         </div>
      </div>
      <UButton v-else label="Add item" @click="newItem(-1)" class="w-full text-xl justify-center my-4" />

      <UButton label="Close List" @click="showEditScreen = false" class="w-full text-xl justify-center my-4" />
   </div>

   <!-- The shopping screen/overlay -->
   <div v-if="showShoppingScreen"
      class="h-full fixed w-full top-0 right-0 left-0 bottom-0 z-10 bg-white dark:bg-black p-4 border border-white dark:border-black rounded-lg overflow-auto">
      <p class="text-xl">{{ list[currentList].name }} List</p>
      <UDivider />
      
      <!-- <div v-for="(item, index) in list[currentList].items" v-if="showItems">

      </div> -->
      
      <!-- <UButton v-else label="Add item" @click="newItem(-1)" class="w-full text-xl justify-center my-4" /> -->

      <UTable :rows="list[currentList].items"
      :columns="columns"
      v-model="selectedItems[currentList].items"
      @select="select"
      :empty-state="{icon: 'i-heroicons-shopping-cart-solid', label: 'No items added to shopping list.'}"
      >
      </UTable>

      <UButton label="Leave shopping mode" @click="showShoppingScreen = false" class="w-full text-xl justify-center my-4" />
   </div>

   <!-- Edit item modal -->
   <UModal :ui="{ container: 'items-center' }" v-model="showEditItem" prevent-close>
      <UCard>
         <template #header>
            <div class="flex justify-between">Item:
               <UInput v-model="list[currentList].items[currentItem].name" type="text" />
            </div>
         </template>
         <div class="flex justify-between my-2">Price:
            <UInput v-model="list[currentList].items[currentItem].price" type="number" />
         </div>
         <div class="flex justify-between my-2">Quantity:
            <UInput v-model="list[currentList].items[currentItem].quantity" type="number" />
         </div>
         <div class="flex justify-between my-2">Department:
            <UInput v-model="list[currentList].items[currentItem].department" type="text" />
         </div>
         <UButton class="w-full justify-center my-2" type="submit" label="submit"
            @click="showEditItem = false, setLists()" />
      </UCard>
   </UModal>

   <!-- EXPLANATION -->
   <UModal :ui="{ container: 'items-center' }" v-model="showExplanation">
      <UCard>
         <template #header>
            <div class="flex min-w-0 justify-between">
               <p class="text-2xl">Information</p>
               <UButton @click="showExplanation = false" variant="link" color="white" size="xl"
                  icon="i-heroicons-x-mark-solid" class="text-gray-600 hover:text-gray-900" />
            </div>
         </template>
         <p>
            <strong>Create shopping lists for different stores.</strong>
         </p>
         <br />
         <p class="text-sm">
            Click the "+" button to add a new list and "Edit List" to add/remove/edit items on the list.
         </p>
         <br />
         <p class="text-sm">
            Click "Shop this List" to enter "Shopping mode". This screen makes it easier to view, sort, and check off the
            items in your list.
         </p>
      </UCard>
   </UModal>
</template>

<style>
.addItem {
   bottom: -2%;
   left: 89%;
}
</style>