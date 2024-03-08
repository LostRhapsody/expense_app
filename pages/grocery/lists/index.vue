<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";

// auth
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// show/hide things
const showExplanation = ref(false);

const showEditScreen = ref(false);

const currentList = ref(0);

const list = ref([]);

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
 */
function targetList(index:Number,page:string){
   return "/grocery/lists/" + page + "?listId=" + index;
}

/**
 * Creates a new list
 */
function newList() {
   let emptyList = {
      name: "New list",
      items: [],
   };
   if (list.value === null || list.value === undefined || list.value.length === 0 || list.value.length === undefined) {
      list.value = [emptyList];
   } else {
      list.value.push(emptyList);
   }
   setLists(list.value);
}

/**
 * Deletes a list
 */
function deleteList(index: number) {
   let thisList = list.value;
   if (thisList === null || thisList === undefined) return;

   thisList.splice(index, 1);
   setLists(list.value);
}

if (process.client) {
   list.value = getLists();
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

   <!-- The list -->
   <div v-if="showList">
      <div
         v-for="(item, index) in list"
         class="px-4 py-3 my-8 w-full text-center items-center flex-col border border-gray-300/25 dark:border-gray-800/25 rounded-lg text-xl flex bg-gray-300/25 dark:bg-gray-800/50"
      >
         <div class="flex w-full items-center">
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
               @change="setLists(list)"
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
