<script setup>
// auth
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// For notifications
const toast = useToast();

// show/hide things
const showExplanation = ref(false);

const currentList = ref(0);
const list = ref([]);
const currentItem = ref(0);
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
   if (list.value === null || list.value === undefined) return;
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
   filterSelectedItems();
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
                     <circle r="10" cx="10" cy="10" fill="rgb(74, 222, 128)" />
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
      icon="i-heroicons-arrow-left"
      color="red"
      label="Leave shopping mode"
      to="/grocery/lists"
      class="w-full text-xl justify-center my-4"
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
            <strong>Distraction free shopping mode.</strong>
         </p>
         <br />
         <p>
            Tap an item to cross it off. There is a delay before it's removed so
            you can uncheck it, if it was by accident.
         </p>
         <br />
         <p>
            Checked items will be in the "checked items" list hidden
            below. Tap items there to re-add them to your list.
         </p>
         <br />
         <p>
            "Clear checked items" will remove all checked items from the
            checked items list.
         </p>
         <br />
         <p>
            Note: Checked items will remain in your list and can be seen in the Edit list menu.
            They are deleted when you clear your checked items.
         </p>
      </UCard>
   </UModal>
</template>
