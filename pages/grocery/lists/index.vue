<script setup lang="ts">

/*=============================================
Imports
=============================================*/

// types
import type { ShoppingListType } from "~/types/types";

// packages
import axios from 'axios';

// auth
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// show/hide things
const showExplanation = ref(false);

const showEditScreen = ref(false);

const currentList = ref(0);

//var list:ShoppingListType[];

// a list ref using the ShoppingListType
const list = ref<ShoppingListType[]>([]);

const displayLists = computed(() => {
   return list.value;
});

// show/hide the list
const showList = computed(() => {
   if (list.value === null || list.value === undefined) return;
   return list.value.length > 0;
});

const links = getBreadcrumbs([
   { name: "Grocery", icon: "i-heroicons-shopping-bag-solid", url: "/grocery" },
   {
      name: "List",
      icon: "i-heroicons-list-bullet",
      url: "/grocery/lists",
   },
]);

/**
 * returns the link with query params to edit a list
 * @param index the list we're editing
 * @return the link to the list with list id
 */
function targetList(index:Number,page:string){
   return "/grocery/lists/" + page + "?listId=" + index;
}

/**
 * returns the link to the shared list
 * @param url the url to the list we've shared
 * @returns the url to the shared list 
 */
function getSharedListURL(url: string) {
   return "/grocery/lists/shop" + url;
}

/**
 * Creates a new list
 */
async function newList() {
   const key = localStorage.getItem("key");
   const isOnline = useOnline();
   let listId;

   // if we're online and have a key and are logged in
   if(isOnline.value && checkUUID(key) && loggedIn.value){
      await axios.post("/api/grocery/createListUUID", {
         value: new Date().toISOString() + key
      }).then(response => {
         listId = response.data;
      }).catch(error => {
         console.log(error);
      });
   } 

   // if we failed to get a decent response or we're offline
   if(listId === null || listId === undefined){
      listId = "guest" + list.value.length;
   }

   let emptyList:ShoppingListType = {
      name: "New list",
      listId: listId,
      userId: "guest",
      createdAt: new Date().toISOString(),
   };

   if (list.value === null || list.value === undefined || list.value.length === 0 || list.value.length === undefined) {
      list.value = [emptyList];
   } else {
      list.value.push(emptyList);
   }

   // set the new list
   setLists(list.value[list.value.length - 1]);
}

/**
 * Deletes a list
 */
function deleteList(index: number) {
   const isOnline = useOnline();

   if (list.value === null || list.value === undefined) return;

   removeListElement(index);

   // if we're offline, we just hide the list.value.
   // when we're back online we'll remove it properly
   if(isOnline.value){
      list.value.splice(index, 1);
   } else {
      list.value[index].name = "Deleted";
   }

   // go through the lists and clean up the deleted ones
   // that were deleted offline.
   if(isOnline.value){   
      cleanUpOfflineLists();
   }

   // set the new list in the cache
   localStorage.setItem("lists", JSON.stringify(list.value));   
}

/**
 * Removes a list element from the list array in the cache
 * and finds the same list in the db and removes it there as well
 */
async function removeListElement(index: number) {
   const key = localStorage.getItem("key");
   const isOnline = useOnline();
   let listId = list.value[index].listId;

   // if we're online and have a key and are logged in
   if(isOnline.value && checkUUID(key) && loggedIn.value){
      await axios.post("/api/grocery/removeList", {
         listId: listId
      }).then(response => {
         console.log(response.data);
      }).catch(error => {
         console.log(error);
      });
   } 
}

function cleanUpOfflineLists(){
   list.value.forEach((item,index2) => {
      if(item.name === "Deleted"){
         list.value.splice(index2, 1);
         removeListElement(index2);
      }
   });
}

/**
 * Retrieves the lists from the cache and db
 */
async function getLists(){
   const key = localStorage.getItem("key");
   const isOnline = useOnline();
   
   let listsString = localStorage.getItem("lists");
   let responseLists:ShoppingListType[] = [];
if(list.value === null || list.value === undefined){
      list.value = [];
   }

   // make it into an object if there is anything in the cache
   if(listsString !== null && listsString !== undefined){
      list.value = JSON.parse(listsString);
      // cleanup deleted lists
      cleanUpOfflineLists();
   }

   // if we're online and have a key and are logged in
   if(isOnline.value && checkUUID(key) && loggedIn.value){
      await axios.post("/api/grocery/getLists", {
         value: key
      }).then(response => {
         // if response is valid
         if(response.data !== null && response.data !== undefined){
            responseLists = response.data;
            // if cache is empty, or length of cache is less than db
            if(list.value === null || list.value === undefined || 
            list.value.length < responseLists.length){
               list.value = responseLists;
               localStorage.setItem("lists", JSON.stringify(list.value));
               return;
            }             
         }
      }).catch(error => {
         console.log(error);
      });
   } else {
      // this will either be cache or empty array, we just need to set it
      localStorage.setItem("lists", JSON.stringify(list.value));      
   }
}

if (process.client) {
   getLists();
}

onMounted(async () => {
   await nextTick();
   /**
    * keybind listeners
    */
   window.addEventListener("keydown", (event) => {      
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
   <!-- Just used for testing since manually pasting a URL
      in DEV mode just refreshes the whole app... and is annoying
      <UButton
      :to="getSharedListURL('?sharedList=%257B%2522name%2522%253A%2522Test%2520List%2522%252C%2522items%2522%253A%255B%257B%2522name%2522%253A%2522Just%2520an%2520Onion%2522%252C%2522price%2522%253A0%252C%2522quantity%2522%253A0%252C%2522department%2522%253A%2522%2522%252C%2522id%2522%253A%2522e159754d-fef5-4ea4-9e8e-ba993cb52a8b%2522%252C%2522selected%2522%253Afalse%257D%255D%252C%2522selectedItems%2522%253A%255B%255D%257D')"
      class="justify-center w-full mx-auto text-xl my-2"
      icon="i-heroicons-share-solid"
      variant="outline"
      label="Shared list"
   /> -->

   <!-- The list -->
   <div v-if="showList">
      <div
         v-for="(item, index) in list"
         class="px-4 py-3 my-8 w-full text-center items-center flex-col border border-gray-300/25 dark:border-gray-800/25 rounded-lg text-xl flex bg-gray-300/25 dark:bg-gray-800/50"
      >
         <div v-if="item.name !== 'Deleted'" class="flex w-full items-center">
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
               @change="setLists(item)"
            />
            <UButton
               icon="i-heroicons-x-mark"
               variant="outline"
               color="red"
               @click="deleteList(index)"
               size="lg"
            />
         </div>
         <UDivider class="mt-2 mb-4 "/>
         <div class="grid grid-cols-2 gap-8 pb-2">
            <UButton
               label="Edit list"
               size="lg"
               class="py-4"
               icon="i-heroicons-pencil-solid"
               :to="targetList(index,'edit')"
               />               
            <UButton
               label="Shop list"
               size="lg"
               class="py-4"
               icon="i-heroicons-shopping-cart-solid"
               :to="targetList(index,'shop')"
            />
         </div>
      </div>
   </div>
   <div v-else>
      <p>Add an item to your list using the button below!</p>
   </div>

   <!-- The add list item floating button -->
   <div class="fabs fabs-above-nav">
      <UButton icon="i-heroicons-plus" @click="newList" size="xl" />
   </div>

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
.fabs {
   --_viewport-margin: 3vmin;

   position: fixed;
   z-index: var(--layer-1);

   inset-block: auto var(--_viewport-margin);
   inset-inline: auto var(--_viewport-margin);
   display: flex;
   flex-direction: column-reverse;
   place-items: center;
   gap: var(--_viewport-margin);
}
.fabs-above-nav {
   bottom: 100px !important;
}
</style>
