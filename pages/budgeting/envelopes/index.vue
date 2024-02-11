<script setup lang="ts">
import getCurrentDate from "~/utils/getCurrentDate";

const route = useRoute();

// show things
const showExplanation = ref(false);
const editOpen = ref(false);

// array of envelopes, init as empty array of objects
//const envelopeArray = [{}]

// for testing, init as array of built objects
const envelopeArray = ref([
  {
    name: "groceries",
    budget: 100,
    created: getCurrentDate(),
    open: false,
  },
  {
    name: "bills",
    budget: 150,
    created: getCurrentDate(),
    open: false,
  },
  {
    name: "car",
    budget: 300,
    created: getCurrentDate(),
    open: false,
  },
]);

// stores the envelope that is currently open
let openEnvelope = {};

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
  // grab the index
  let index = openEnvelope.index;

  // set all the values to the array
  envelopeArray.value[index].name = openEnvelope.name;
  envelopeArray.value[index].budget = openEnvelope.budget;
  envelopeArray.value[index].created = openEnvelope.created;
  envelopeArray.value[index].created = openEnvelope.created;
  // close the envelope icon
  envelopeArray.value[index].open = false;

  // set to blank
  openEnvelope = {};

  // hide modal
  editOpen.value = false;
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
    name: "new",
    budget: 0,
    created: getCurrentDate(),
    open: true,
  };
  envelopeArray.value.push(envelope);
  openAnEnvelope(envelopeArray.value.length - 1);
}

/**
 * removes an envelope from the array
 */
function deleteEnvelope() {
  envelopeArray.value.splice(openEnvelope.index, 1);
  editOpen.value = false;
  //updateUserArray("delete");
}
</script>

<template>
  <BreadcrumbHTML><UBreadcrumb :links="links" /></BreadcrumbHTML>
  <UButton
    @click="showExplanation = !showExplanation"
    class="justify-center w-full mx-auto text-xl my-2"
    icon="i-heroicons-information-circle-solid"
  >
    How to use ( •̀ ω •́ )✧
  </UButton>
  <div class="text-center my-4">
    <h1 class="text-3xl">Digital Envelopes</h1>
  </div>
  <div class="grid grid-cols-2">
    <!-- envelopes -->
    <div class="envelopeContainer" v-for="(envelope, index) in envelopeArray">
      <div
        @click="openAnEnvelope(index)"
        class="text-center text-3xl m-4 ring-2 ring-primary rounded-xl py-3"
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
            <em>{{ envelope.created }}</em>
          </p>
        </div>
      </div>
    </div>
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
          />
        </div>
      </template>
      <UInput
        type="text"
        v-model="openEnvelope.name"
        class="my-4 text-xl"
        input-class="text-xl"
      >
        <template #trailing> Name </template>
      </UInput>
      <UInput
        type="number"
        v-model="openEnvelope.budget"
        class="my-4 text-xl"
        input-class="text-xl"
      >
        <template #leading> $ </template>
        <template #trailing> Budget </template>
      </UInput>
      <UInput
        type="text"
        v-model="openEnvelope.created"
        class="my-4 text-xl"
        input-class="text-xl"
      >
        <template #trailing>Date</template>
      </UInput>

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
      Lastly, you can use <span class="text-red-500">the "Delete" button</span> to delete that envelope.
      </p>
    </UCard>
  </UModal>
</template>

<style>
.envelopeContainer .i-heroicons-envelope-solid,
.envelopeContainer .i-heroicons-envelope-open-solid {
  font-size: 5rem;
}
</style>
