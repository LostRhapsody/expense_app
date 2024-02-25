<script setup>
// For notifications
const toast = useToast();

// show things
const showExplanation = ref(false);
const editOpen = ref(false);
const showEntriesList = ref(true);
const showEditCheckbook = ref(false);

// user data
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// an array of all checkbooks
// each checkbook is an array of entry objects
const allCheckbooks = ref([]);

// the current book opened (controlled via input box)
const currentBook = ref(0);

// the current entry of the current book opened
const currentEntry = ref({});

// entries in the checkbook select input
const checkbookOptions = computed(() => {
  let newCheckbooks = [];
  if(allCheckbooks.value === null || allCheckbooks.value === undefined) return;
  allCheckbooks.value.forEach((book, index) => {
    newCheckbooks.push({
      label: book.name,
      id: index,
    });
  });
  return newCheckbooks;
});

const selectedCheckbook = ref(allCheckbooks[0]);

//checkbook table
const columns = [
  {
    key: "label",
    label: "Charge",
  },
  {
    key: "amount",
    label: "Amount",
    sortable: true,
  },
  {
    key: "date",
    label: "Date",
    sortable: true,
    direction: "desc",
  },
];

const links = getBreadcrumbs([
  {
    name: "Budgeting",
    icon: "i-heroicons-currency-dollar-solid",
    url: "/budgeting",
  },
  {
    name: "Checkbook",
    icon: "i-heroicons-rectangle-stack-solid",
    url: "/budgeting/checkbook",
  },
]);

const transactionTypes = ["Credit", "Deposit"];

/**
 * save's the checkbook to the DB
 * @param key the key used to retrieve this value
 */
async function setCheckbookArray() {
  const key = localStorage.getItem("uuid");
  if(key === null) return;
  const setCheckbookResponse = await $fetch("/api/budgeting/setCheckbook", {
    method: "post",
    body: {
      key: key + "checkbook",
      value: {
        checkbookResponseArray: allCheckbooks.value,
      },
    },
  });

  if (setCheckbookResponse === null || setCheckbookResponse === undefined) {
    toast.add({ title: "Error: invalid response from server" });
  } else if (setCheckbookResponse.error) {
    toast.add({ title: "Error: " + setCheckbookResponse.message });
  }
}

/**
 * Get's the user's saved checkbook entries
 * @param key the key used to retrieve this value
 */
async function getCheckbookArray() {
  const key = localStorage.getItem("uuid");
  if(key === null) return;
  const getCheckbookResponse = await $fetch("/api/budgeting/getCheckbook", {
    method: "post",
    body: { key: key + "checkbook" },
  });

  if (
    getCheckbookResponse === null ||
    getCheckbookResponse === undefined ||
    getCheckbookResponse.length > 0
  ) {
    toast.add({ title: "Error: invalid response from server" });
  } else if (getCheckbookResponse.error) {
    toast.add({ title: "Error: " + getCheckbookResponse.message });
  } else {
    allCheckbooks.value = getCheckbookResponse.checkbookResponseArray;
    currentBook.value = allCheckbooks.value.length - 1;
    selectedCheckbook.value = allCheckbooks.value[currentBook.value].name;
    if (
      allCheckbooks.value !== null &&
      allCheckbooks.value !== undefined &&
      allCheckbooks.value.length > 0
    )
      showEntriesList.value = true;
  }
}

/**
 * Edit entry modal open
 * @param row the row of the entry clicked on
 */
function editEntry(row) {
  editOpen.value = true;

  let thisEntry = allCheckbooks.value[currentBook.value].data[row.id];

  currentEntry.value.label = thisEntry.label;
  currentEntry.value.amount = thisEntry.amount;
  currentEntry.value.date = thisEntry.date;
  currentEntry.value.transaction = thisEntry.transaction;
  currentEntry.value.id = row.id;
}

/**
 * Save the current checkbook entry back to the array
 */
function saveEntry() {
  if (!validateEntry()) return;
  editOpen.value = false;

  let thisEntry =
    allCheckbooks.value[currentBook.value].data[currentEntry.value.id];

  thisEntry.label = currentEntry.value.label;
  thisEntry.amount = currentEntry.value.amount;
  thisEntry.date = currentEntry.value.date;
  thisEntry.transaction = currentEntry.value.transaction;
  thisEntry.id = currentEntry.value.id;

  calcEndAmount();

  // empty current entry
  currentEntry.value = {};
  if(loggedIn.value){
    setCheckbookArray();
  }
}

/**
 * Calculate the end amount for the current checkbook
 */

function calcEndAmount(){
  let thisBook = allCheckbooks.value[currentBook.value];
  let thisBookData = allCheckbooks.value[currentBook.value].data;
  let totalAmount = 0;

  thisBookData.forEach(element => {
    if(element.transaction === "Credit"){
      totalAmount += element.amount;
    } else {
      totalAmount -= element.amount;
    }
  });

  thisBook.endAmount = thisBook.startAmount - totalAmount;

}

/**
 * Delete the current entry from the array
 */
function deleteEntry() {
  editOpen.value = false;

  // if array is zero, there's nothing to delete
  if (allCheckbooks.value[currentBook.value].data.length === 0) return;

  allCheckbooks.value[currentBook.value].data.splice(currentEntry.value.id, 1);

  // because we're removing a random entry, we need to
  // reset all the id's so they are in the correct order
  let entryId = 0;
  allCheckbooks.value[currentBook.value].data.forEach((entry) => {
    entry.id = entryId;
    entryId++;
  });

  if(loggedIn.value){
    setCheckbookArray();
  }

}

/**
 * Validate the current entry before saving
 */
function validateEntry() {
  if (
    typeof currentEntry.value.label !== "string" ||
    currentEntry.value.label.length < 1
  ) {
    alert("Please give this entry a name before saving");
    return false;
  }
  if (
    typeof currentEntry.value.amount !== "number" ||
    currentEntry.value.amount < 1
  ) {
    alert("Please give this entry an amount before saving");
    return false;
  }
  return true;
}

/**
 * Creates a blank Entry object and opens the edit modal
 */
function createEntry() {
  if(allCheckbooks.value.length < 1){
    alert("Please create a checkbook before recording a transaction.");
    return;
  }
  let thisCheckbook = allCheckbooks.value[currentBook.value].data;
  currentEntry.value = {
    label: "",
    amount: 0,
    transaction: "Credit",
    date: getCurrentDate("ymd"),
  };
  // if array doesn't exist, create it
  if (thisCheckbook === undefined || thisCheckbook === null) {
    currentEntry.value.id = 0;
    thisCheckbook = [currentEntry.value];
  } else {
    // if array exists just push it
    currentEntry.value.id = thisCheckbook.length;
    thisCheckbook.push(currentEntry.value);
  }
  editOpen.value = true;
}

/**
 * creates a new checkbook object
 */
function createCheckbook() {
  // if all checkbooks array doesn't exist, create it with a new object
  if (allCheckbooks.value === null || allCheckbooks.value === undefined) {
    allCheckbooks.value = [
      {
        // empty checkbook array
        data: [],
        name: "New Book",
        startAmount: 0,
        endAmount: 0,
      },
    ];
  } else {
    allCheckbooks.value.push({
      // empty checkbook array
      data: [],
      name: "New Book",
      startAmount: 0,
      endAmount: 0,
    });
  }
  currentBook.value = allCheckbooks.value.length - 1;
  showEditCheckbook.value = true;
}

/**
 * saves the current checkbook
 */
function saveCheckbook(){
  // close edit
  showEditCheckbook.value = false;

  // clear the input then re-select the current book.
  // This ensures the input get's the updated name.
  document.getElementById("checkbookInput").value = "";
  document.getElementById("checkbookInput").value = allCheckbooks.value[currentBook.value].name;

  calcEndAmount();

  if(loggedIn.value){
    setCheckbookArray();
  }

}

/**
 * Delete the current checkbook from the array
 */
function deleteCheckbook() {
  showEditCheckbook.value = false;

  // if array is zero, there's nothing to delete
  if (allCheckbooks.value.length === 0) return;

  allCheckbooks.value.splice(currentBook.value, 1);

  // clear the input
  document.getElementById("checkbookInput").value = "";
  
  currentBook.value = 0;

  if(loggedIn.value){
    setCheckbookArray();
  }

}

/**
 * When a book is selected from the inupt menu
 */
function changeBook(book) {
  currentBook.value = book.id;
}

if (loggedIn.value && process.client) {
  getCheckbookArray();
}
</script>
<template>
  <BreadcrumbHTML
    class="bg-primary-100/50 dark:bg-gray-800/50 rounded-full p-1"
  >
    <UBreadcrumb :ui="{ li: 'text-black text-xs' }" :links="links"
  /></BreadcrumbHTML>
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
  <div class="text-center my-4">
    <h1 class="text-3xl">Checkbook</h1>
  </div>
  <div class="grid grid-cols-1 gap-2">
    <div class="grid grid-cols-2 gap-2">
      <UButton class="justify-center h-full text-xl" @click="createCheckbook"
      >+<UIcon name="i-heroicons-book-open-solid" />
    </UButton>
    <UButton class="justify-center h-full text-xl" @click="showEditCheckbook = true"
      ><UIcon name="i-heroicons-pencil-solid" />
    </UButton>
    </div>
    <UInputMenu id="checkbookInput" v-model="selectedCheckbook" :options="checkbookOptions" @change="changeBook" />
  </div>
  <div v-for="(book, index) in allCheckbooks">
    <div
    class="text-center my-2 text-xl"
    v-if="currentBook === index"
    >
    Start amount: {{ formatCurrency(book.startAmount) }}</div>
    <UTable
      v-if="currentBook === index"
      :rows="book.data"
      :columns="columns"
      @select="editEntry"
    >
      <template #label-data="row">
        <span
          :class="[
            (row.row.transaction == 'Credit' && 'text-red-500') ||
              'text-primary',
          ]"
          >{{ row.row.label }}</span
        >
      </template>
      <template #amount-data="row">
        <span
          :class="[
            (row.row.transaction == 'Credit' && 'text-red-500') ||
              'text-primary',
          ]"
          >{{ formatCurrency(row.row.amount) }}</span
        >
      </template>
      <template #date-data="row">
        <span
          :class="[
            (row.row.transaction == 'Credit' && 'text-red-500') ||
              'text-primary',
          ]"
          >{{ row.row.date }}</span
        >
      </template>
    </UTable>
    <div
    class="text-center my-2 text-xl"
    v-if="currentBook === index"
    >End amount: {{ formatCurrency(book.endAmount) }}</div>
  </div>
  <div class="text-center">
    <UButton
      class="mx-auto my-4 rounded-full h-28 w-28 justify-center text-3xl"
      @click="createEntry"
      >+<UIcon name="i-heroicons-rectangle-stack-solid"
    /></UButton>
  </div>
  <!-- Entry Edit Modal -->
  <UModal v-model="editOpen" :ui="{ container: 'items-center' }" prevent-close>
    <UCard>
      <template #header>
        <div class="flex min-w-0 justify-between">
          <p v-if="currentEntry.label" class="text-2xl">
            {{ currentEntry.label }}
          </p>
          <p class="text-2xl" v-else>New Entry</p>
        </div>
      </template>
      <div class="grid grid-cols-3 items-center">
        <p>Label:</p>
        <UInput
          type="text"
          v-model="currentEntry.label"
          class="text-xl col-span-2"
          input-class="text-xl"
          placeholder="Dinner"
        >
        </UInput>
        <p>Amount:</p>
        <UInput
          type="number"
          v-model="currentEntry.amount"
          class="my-4 text-xl col-span-2"
          input-class="text-xl"
        >
          <template #leading> $ </template>
        </UInput>
        <p>Transaction:</p>
        <USelect
          class="col-span-2"
          v-model="currentEntry.transaction"
          :options="transactionTypes"
        />
      </div>
      <template #footer>
        <UButton block label="Save Entry" @click="saveEntry" />
        <UButton
          block
          label="Delete Entry"
          @click="deleteEntry"
          color="red"
          class="mt-4"
        />
      </template>
    </UCard>
  </UModal>
  <!-- Checkbook Edit Modal -->
  <UModal
    v-model="showEditCheckbook"
    :ui="{ container: 'items-center' }"
    prevent-close
  >
    <UCard v-if="allCheckbooks !== null && allCheckbooks !== undefined && allCheckbooks.length > 0">
      <template #header>
        <div class="flex min-w-0 justify-between">
          <p v-if="allCheckbooks[currentBook].name" class="text-2xl">
            {{ allCheckbooks[currentBook].name }}
          </p>
          <p class="text-2xl" v-else>New Checkbook</p>
        </div>
      </template>
      <div class="grid grid-cols-3 items-center gap-3">
        <p>Name:</p>
        <UInput
          type="text"
          v-model="allCheckbooks[currentBook].name"
          class="text-xl col-span-2"
          input-class="text-xl"
          placeholder="Dinner"
        >
        </UInput>
        <p>Start Amount:</p>
        <UInput
          type="number"
          v-model="allCheckbooks[currentBook].startAmount"
          class="text-xl col-span-2"
          input-class="text-xl"
          placeholder="Dinner"
        >
        <template #leading>
          $
        </template>
        </UInput>
      </div>
      <template #footer>
        <UButton
          block
          label="Save Checkbook"
          @click="saveCheckbook"
        />
        <UButton
          block
          label="Delete Checkbook"
          @click="deleteCheckbook"
          color="red"
          class="mt-4"
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
      <p class="font-bold text-lg text-primary">How to setup Checkbooks</p>
      <p>
        Checkbooks are an easy way to keep an eye on all your transactions.
      </p>
      <br />
      <p>
        Start by creating a new checkbook by using the <span class="text-primary">+<UIcon name="i-heroicons-book-open-solid" /></span> button. This creates a new checkbook.
      </p>
      <br />
      <p>
        Give the book a name ("June spending, Grocery trips, Dining out") and set a <span class="text-primary">starting amount</span>. This starting amount should be whatever you have in your account and/or budgeted.
      </p>
      <br />
      <p>
        After creating multiple checkbooks, you can swap between them using the dropdown menu. Use the <span class="text-primary"><UIcon name="i-heroicons-pencil-solid" /></span> button to edit the name and starting amount of a checkbook.
      </p>
      <br />
      <p>
        Next click the <span class="text-primary">+<UIcon name="i-heroicons-rectangle-stack-solid" /></span> button to add an entry to your checkbook.
      </p>
      <br />
      <p>
        You can specify the amount, what it's for, and whether it was a deposit
        (you got <span class="text-primary">$$$</span>) or a credit (you spent <span class="text-red-500">$$$</span>). The date is automatically set to the day you created it.
      </p>
      <br />
      <p>
        To update your <span class="text-primary">entries</span>, just tap on
        one of them.
      </p>
      <br />
      <p>
        Lastly, you can use
        <span class="text-red-500">the "Delete" button</span> when editing an
        entry to delete it.
      </p>
    </UCard>
  </UModal>
</template>
