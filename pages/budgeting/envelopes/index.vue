<script setup lang="ts">
import getCurrentDate from "~/utils/getCurrentDate";

// For notifications
const toast = useToast();

// show things
const showExplanation = ref(false);
const editOpen = ref(false);
const showEditBudget = ref(false);
const waitingForResponse = ref(true);

// user data
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// array of envelopes, init as empty array of objects
const envelopeArray = ref([]);

// stores the envelope that is currently open
let openEnvelope = {};

// total budget
const totalBudget = ref(0);

const totalComputedBudget = computed(() => {
  if (
    totalBudget.value < 0 ||
    totalBudget.value === null ||
    totalBudget.value === undefined ||
    totalBudget.value === ""
  ) {
    totalBudget.value = 0;
  }
  return totalBudget.value;
});

// used budget
const usedBudget = computed(() => {
  let budgetUsed = 0;

  if(envelopeArray.value === null ||
  envelopeArray.value === undefined) return 0;

  envelopeArray.value.forEach((envelope) => {
    budgetUsed += envelope.budget;
  });
  return budgetUsed;
});

// returns the percentage of the budget remaining out of 100%
const usedBudgetPercent = computed(() => {
  if (usedBudget.value === 0 || totalBudget.value === 0) {
    return 0;
  }
  return (usedBudget.value / totalBudget.value) * 100;
});

const links = getBreadcrumbs([
  {
    name: "Budgeting",
    icon: "i-heroicons-currency-dollar-solid",
    url: "/budgeting",
  },
  {
    name: "Envelopes",
    icon: "i-heroicons-envelope-solid",
    url: "/budgeting/envelopes",
  },
]);

/**
 * Updates the user's saved budget
 * @param key the key used to store this value
 */
async function setBudget() {
  const key = localStorage.getItem("uuid");
  showEditBudget.value = false;
  const setBudgetResponse = await $fetch("/api/budgeting/setEnvelopeBudget", {
    method: "post",
    body: {
      key: key + "envelopeBudget",
      value: {
        budget: totalBudget.value,
      },
    },
  });

  if (setBudgetResponse === null || setBudgetResponse === undefined) {
    toast.add({ title: "Error: invalid response from server" });
  } else if (setBudgetResponse.error) {
    toast.add({ title: "Error: " + setBudgetResponse.message });
  }
}

/**
 * Get's the user's saved budget
 * @param key the key used to retrieve this value
 */
async function getBudget() {
  const key = localStorage.getItem("uuid");
  const records = await $fetch("/api/budgeting/getEnvelopeBudget", {
    method: "post",
    body: { key: key + "envelopeBudget" },
  });

  if (records === null || records === undefined) {
    toast.add({ title: "Error: invalid response from server" });
  } else if (records.error) {
    toast.add({ title: "Error: " + records.message });
  } else {
    if (records !== null && records !== undefined) {
      if (records.budget !== null && typeof records.budget === "number") {
        totalBudget.value = records.budget;
      }
    }
  }
}

/**
 * Ensures the budget is a valid number
 * note: we use a computed property to ensure the budget is always 0 or greater
 * so this is a redundant, backup method
 */
function validateBudget() {
  if (
    totalBudget.value < 0 ||
    totalBudget.value === null ||
    totalBudget.value === undefined ||
    totalBudget.value === ""
  ) {
    totalBudget.value = 0;
  }
}

/**
 * save's an envelope to the DB
 * @param key the key used to retrieve this value
 */
async function setEnvelopeArray() {
  const key = localStorage.getItem("uuid");
  const setEnvelopeResponse = await $fetch("/api/budgeting/setEnvelope", {
    method: "post",
    body: {
      key: key + "Envelope",
      value: {
        envelopeArray: envelopeArray.value,
      },
    },
  });

  if (setEnvelopeResponse === null || setEnvelopeResponse === undefined) {
    toast.add({ title: "Error: invalid response from server" });
  } else if (setEnvelopeResponse.error) {
    toast.add({ title: "Error: " + setEnvelopeResponse.message });
  }
}

/**
 * Get's the user's saved envelopes
 * @param key the key used to retrieve this value
 */
async function getEnvelopeArray() {
  const key = localStorage.getItem("uuid");

  const getEnvelopeResponse = await $fetch("/api/budgeting/getEnvelope", {
    method: "post",
    body: { key: key + "Envelope" },
    onResponse(){
      waitingForResponse.value = false;
    }
  });
  if (
    getEnvelopeResponse === null ||
    getEnvelopeResponse === undefined ||
    getEnvelopeResponse.length > 0
  ) {
    toast.add({ title: "Error: invalid response from server" });
  } else if (getEnvelopeResponse.error) {
    toast.add({ title: "Error: " + getEnvelopeResponse.message });
  } else {
    envelopeArray.value = getEnvelopeResponse.envelopeArray;        
  }
}

/**
 * displays a modal to edit the envelope's properties
 * @param index the envelope to open
 */
function openAnEnvelope(index: number) {
  // change the envelope icon to open
  envelopeArray.value[index].open = true;

  // set the openEnvelope object to the one in the array
  openEnvelope = envelopeArray.value[index];

  // save the index
  openEnvelope.index = index;

  // show the edit modal
  editOpen.value = true;
}

/**
 * saves the currently open envelope to the envelope array
 */
function saveEnvelope() {
  // validate envelope
  if (!validateEnvelope()) {
    return;
  }

  // grab the index
  let index = openEnvelope.index;

  // set all the values to the array
  envelopeArray.value[index].name = openEnvelope.name;
  envelopeArray.value[index].budget = openEnvelope.budget;
  envelopeArray.value[index].date = openEnvelope.date;
  // close the envelope icon
  envelopeArray.value[index].open = false;

  // set to blank
  openEnvelope = {};

  // hide modal
  editOpen.value = false;
  setEnvelopeArray();
}

/**
 * close the currently opened envelope, don't save it
 */
function cancelEdit() {
  // grab the index
  let index = openEnvelope.index;
  // close the envelope icon
  envelopeArray.value[index].open = false;
  // set to blank
  openEnvelope = {};
  // hide modal
  editOpen.value = false;
}

/**
 * Creates a new envelope object
 */
function createEnvelope() {
  let envelope = {
    name: "",
    budget: 0,
    date: getCurrentDate("ymd"),
    open: true,
  };
  // if array is empty, set element 0
  if (envelopeArray.value === null || envelopeArray.value === undefined) {
    envelopeArray.value = [envelope];
  } else {
    envelopeArray.value.push(envelope);
  }
  openAnEnvelope(envelopeArray.value.length - 1);
  setEnvelopeArray();
}

/**
 * removes an envelope from the array
 */
function deleteEnvelope() {
  envelopeArray.value.splice(openEnvelope.index, 1);
  editOpen.value = false;
  setEnvelopeArray();
}

/**
 * Validates that the 'envelope' object is valid and can be saved
 */
function validateEnvelope() {
  let validIOU = true;
  if (openEnvelope.name.length <= 0) {
    alert("Please enter a name for the envelope.");
    validIOU = false;
  }
  if (openEnvelope.budget <= 0 && validIOU) {
    alert("Please enter a positive budget for the envelope.");
    validIOU = false;
  }

  return validIOU;
}

function getEnvelopeRatio(amount: number, total: number) {
  if (amount === 0 || total === 0) return 0;
  if (amount === null || total === null) return 0;
  if (amount === undefined || total === undefined) return 0;
  let ratio = (amount / total) * 100;
  return ratio.toFixed();
}

/**
 * Logged In INIT logic
 */
if (loggedIn.value && process.client) {
  getEnvelopeArray();
  getBudget();
} else {
  waitingForResponse.value = false;
}
</script>

<template>
  <BreadcrumbHTML class="bg-primary-100/50 dark:bg-gray-800/50 rounded-full p-1"
    ><UBreadcrumb :ui="{ li: 'text-black text-xs' }" :links="links"
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
    <h1 class="text-3xl">Digital Envelopes</h1>
  </div>
  <div class="py-2 flex justify-between items-center">
    <div class="w-9/12">
      <UProgress indicator class="pb-2" :value="usedBudgetPercent" />
      <em class="text-gray-500"
        >Remaining Budget: ${{ totalBudget - usedBudget }}</em
      ><br />
      <em class="text-gray-500">Total Budget: ${{ totalBudget }}</em>
    </div>
    <UButton
      icon="i-heroicons-banknotes-solid"
      @click="showEditBudget = true"
      class="text-center col-span-2 p-3"
    />
  </div>
  <div v-if="waitingForResponse" class="grid grid-cols-2">
    <!-- skeleton envelopes -->
    <div class="flex justify-center">
      <USkeleton class="h-[170px] w-[116px]" />
    </div>
    <div class="flex justify-center mb-4">
      <USkeleton class="h-[170px] w-[116px]" />
    </div>
  </div>
  <div v-else-if="envelopeArray !== null && envelopeArray !== undefined" class="grid grid-cols-2">
    <!-- envelopes -->
    <div class="envelopeContainer" v-for="(envelope, index) in envelopeArray">
      <div
        @click="openAnEnvelope(index)"
        class="text-center text-3xl m-4 ring-2 ring-primary rounded-xl py-3 hover:bg-gray-300 hover:dark:bg-gray-700 relative"
      >
        <UIcon
          v-if="!envelope.open"
          name="i-heroicons-envelope-solid"
          size="xl"
        />
        <UIcon
          v-if="envelope.open"
          name="i-heroicons-envelope-open-solid"
          size="xl"
        />
        <div class="text-sm">
          <p>
            <strong>{{ envelope.name }}</strong>
          </p>
          <p>${{ envelope.budget }}</p>
          <p>
            <em>{{ envelope.date }}</em>
          </p>
        </div>
        <div class="absolute text-xs rounded-full p-1 percentage bg-primary text-gray-700">
          <p
            v-if="((envelope.budget / totalBudget) * 100).toFixed().length > 1"
          >
            %{{ getEnvelopeRatio(envelope.budget, totalComputedBudget) }}
          </p>
          <p v-else>
            %0{{ getEnvelopeRatio(envelope.budget, totalComputedBudget) }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <p>No envelopes created yet.</p>
  </div>
  <div class="text-center">
    <UButton
      @click="createEnvelope"
      class="mx-auto my-12 rounded-full h-28 w-28 justify-center text-3xl"
      >+<UIcon name="i-heroicons-envelope-solid"
    /></UButton>
  </div>
  <!-- Envelope Edit Modal -->
  <UModal v-model="editOpen" :ui="{ container: 'items-center' }" prevent-close>
    <UCard>
      <template #header>
        <div class="flex min-w-0 justify-between">
          <p class="text-2xl">{{ openEnvelope.name }}</p>
          <UButton
            @click="cancelEdit"
            variant="link"
            color="white"
            size="xl"
            icon="i-heroicons-x-mark-solid"
            class="text-gray-600 hover:text-gray-900"
          />
        </div>
      </template>
      <div class="grid grid-cols-3 items-center">
        <p>Label:</p>
        <UInput
          type="text"
          v-model="openEnvelope.name"
          class="my-4 text-xl col-span-2"
          input-class="text-xl"
        >
        </UInput>
        <p>Amount:</p>
        <UInput
          type="number"
          v-model="openEnvelope.budget"
          class="my-4 text-xl col-span-2"
          input-class="text-xl"
        >
          <template #leading> $ </template>
        </UInput>
        <p>Due Date:</p>
        <UInput
          type="date"
          v-model="openEnvelope.date"
          class="my-4 text-xl col-span-2"
          input-class="text-xl"
        >
        </UInput>
      </div>
      <em class="text-gray-400">Due date is optional</em>
      <template #footer>
        <UButton block label="Submit" @click="saveEnvelope" />
        <UButton
          block
          label="Delete"
          @click="deleteEnvelope"
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
      <p class="font-bold text-lg text-primary">What is the envelope system</p>
      <p>
        Envelope budgeting is a method where you allocate cash into different
        envelopes labeled with specific spending categories, such as groceries
        or entertainment.<br /><br />You can only spend the money in each
        envelope on its designated category, helping you stick to your budget
        and manage your finances effectively.
      </p>
      <UDivider class="my-2" />
      <p class="font-bold text-lg text-primary">How to use digital envelopes</p>
      <p>
        Create a digital envelope using
        <span class="text-primary">the "+" button</span>, one for each spending
        category.
      </p>
      <br />
      <p>
        Tap on an envelope to edit it. Hit
        <span class="text-primary">the "Submit" button</span> to save your
        changes, or
        <span class="text-primary">the "X" button in the top right</span> to
        cancel.
      </p>
      <br />
      <p>
        To set and update your <span class="text-primary">budget</span>, use the
        <UIcon class="text-primary" name="i-heroicons-banknotes-solid" />
        button.
      </p>
      <br />
      <p>
        Lastly, you can use
        <span class="text-red-500">the "Delete" button</span> to delete that
        envelope.
      </p>
    </UCard>
  </UModal>
  <!-- BUDGET MODAL -->
  <UModal :ui="{ container: 'items-center' }" v-model="showEditBudget">
    <UCard>
      <template #header>
        <div class="flex min-w-0 justify-between">
          <p class="text-2xl my-4">Current Budget: ${{ totalBudget }}</p>
          <UButton
            @click="showEditBudget = false"
            variant="link"
            color="white"
            size="xl"
            icon="i-heroicons-x-mark-solid"
            class="text-gray-600 hover:text-gray-900"
          />
        </div>
      </template>
      <URange v-model="totalBudget" name="range" :max="5000" />
      <UInput
        type="number"
        v-model="totalBudget"
        class="my-4"
        :ui="{ base: 'text-center flex justify-center' }"
        v-on:change="validateBudget"
      >
      </UInput>
      <template #footer>
        <UButton block label="Submit" @click="setBudget()" />
      </template>
    </UCard>
  </UModal>
</template>

<style>
.envelopeContainer .i-heroicons-envelope-solid,
.envelopeContainer .i-heroicons-envelope-open-solid {
  font-size: 5rem;
}
.envelopeContainer .percentage {
  left: 65%;
  bottom: 75%;
}
</style>
