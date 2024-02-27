<script setup lang="ts">
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
    emptyItem.id = currentListItems.length.toString();
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
function deleteItem(index: number) {
  let currentListItems = list.value[currentList.value].items;
  if (currentListItems === null || currentListItems === undefined) return;

  currentListItems.splice(index, 1);
  setLists();
  // update the shopping list
  filterSelectedItems();
}

/**
 * Opens the edit item modal and set's the current item we're editing
 */

function editItem(index: number) {
  currentItem.value = index;
  showEditItem.value = true;
  setLists();
  // update the shopping list
  filterSelectedItems();
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
      items[row.id].selected = false;
      selected.splice(index, 1);
      addItem = false;
      filterSelectedItems();
      return;
    }
  });

  // if we did not remove the item from the array, add it.
  if (addItem) {
    selected.push(row);
    // remove it from the item list
    items[row.id].selected = true;
    await delay(2000);
    filterSelectedItems();
  }
  setLists();
}

/**
 * Runs on loop, checking for items that have been selected, and hiding them
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
   if(item.name === "" || item.name === undefined || item.name === null) return;
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
      <div class="flex">
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
    <p class="text-xl">{{ list[currentList].name }} List</p>
    <UDivider />
    <p><em>Start typing and hit enter to add a new item.</em></p>
    <p>
      <em
        >Click <UIcon name="i-heroicons-pencil-solid" /> to edit an item and
        <UIcon name="i-heroicons-x-mark" /> to delete it.
      </em>
    </p>
    <!-- Inputs for items -->
    <div v-for="(item, index) in list[currentList].items" v-if="showItems">
      <div
        class="items-center flex border border-gray-300 dark:border-gray-800 rounded-lg justify-between my-2"
      >
        <UButton
          class="border-r border-gray-300 dark:border-gray-800 rounded-none inline-block py-3"
          icon="i-heroicons-pencil-solid"
          name="Edit item"
          variant="ghost"
          @click="editItem(index)"
        />
        <UInput
          :id="item.id"
          v-model="item.name"
          type="text"
          @change="newItem(index), setLists()"
          class="inline-block"
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
        <span class="text-white" :class="{ linethrough: row.row.selected }">{{
          row.row.name
        }}</span>
      </template>
      <template #price-data="row">
        <span v-if="row.row.price > 0" :class="{ linethrough: row.row.selected }"
          >${{ row.row.price }}</span
        >
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
            <span :class="{ linethrough: row.row.selected }"
              >${{ row.row.price }}</span
            >
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
        </UTable>
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
        <div class="flex justify-between">
          Item:
          <UInput
            v-model="list[currentList].items[currentItem].name"
            type="text"
          />
        </div>
      </template>
      <div class="flex justify-between my-2">
        Price:
        <UInput
          v-model="list[currentList].items[currentItem].price"
          type="number"
        />
      </div>
      <div class="flex justify-between my-2">
        Quantity:
        <UInput
          v-model="list[currentList].items[currentItem].quantity"
          type="number"
        />
      </div>
      <div class="flex justify-between my-2">
        Department:
        <UInput
          v-model="list[currentList].items[currentItem].department"
          type="text"
        />
      </div>
      <UButton
        class="w-full justify-center my-2"
        type="submit"
        label="submit"
        @click="(showEditItem = false), setLists()"
      />
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
        Click "Shop this List" to enter "Shopping mode". This screen makes it
        easier to view, sort, and check off the items in your list.
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
