<script setup lang="ts">
// For notifications
const toast = useToast();

// show things
const showExplanation = ref(false);
const showPayIOU = ref(false);

// user data
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");
const uuid = ref("");

// list of IOU records
const iouArray = ref([
  {
    name: "Evan",
    borrowed: true,
    amount: 50.0,
    date: getCurrentDate(),
  },
  {
    name: "Sarah",
    borrowed: false,
    amount: 25.0,
    date: getCurrentDate(),
  },
  {
    name: "Sarah",
    borrowed: true,
    amount: 1500.0,
    date: getCurrentDate(),
  },
]);

// columns to show in table
const columns = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "amount",
    label: "Amount",
  },
  {
    key: "borrowed",
    label: "Borrowed",
  },
];

const currentIOU = ref({});

const links = getBreadcrumbs([
  {
    name: "Budgeting",
    icon: "i-heroicons-currency-dollar-solid",
    url: "/budgeting",
  },
  {
    name: "IOUs",
    icon: "i-heroicons-user-solid",
    url: "/budgeting/iou",
  },
]);

/**
 * save's an envelope to the DB
 * @param key the key used to retrieve this value
 */
async function setEnvelopeArray(key: string) {
  // const setEnvelopeResponse = await $fetch("/api/budgeting/setEnvelope", {
  //   method: "post",
  //   body: {
  //     key: key + "Envelope",
  //     value: {
  //       envelopeArray: envelopeArray.value,
  //     },
  //   },
  // });
  // if (setEnvelopeResponse === null || setEnvelopeResponse === undefined) {
  //   toast.add({ title: "Error: invalid response from server" });
  // } else if (setEnvelopeResponse.error) {
  //   toast.add({ title: "Error: " + setEnvelopeResponse.message });
  // }
}

/**
 * Get's the user's saved envelopes
 * @param key the key used to retrieve this value
 */
async function getEnvelopeArray(key: string) {
  // const getEnvelopeResponse = await $fetch("/api/budgeting/getEnvelope", {
  //   method: "post",
  //   body: { key: key + "Envelope" },
  // });
  // if (
  //   getEnvelopeResponse === null ||
  //   getEnvelopeResponse === undefined ||
  //   getEnvelopeResponse.length > 0
  // ) {
  //   toast.add({ title: "Error: invalid response from server" });
  // } else if (getEnvelopeResponse.error) {
  //   toast.add({ title: "Error: " + getEnvelopeResponse.message });
  // } else {
  //   envelopeArray.value = getEnvelopeResponse.envelopeArray;
  // }
}

/**
 * Shows the confirmation "this IOU is payed?" dialogue box
 * @param index index of the current IOU
 */
function togglePayModal(index: number) {
  showPayIOU.value = true;
  currentIOU.value = iouArray.value[index];
  currentIOU.value.index = index;
}

/**
 * deletes an IOU from the array
 */
function deleteIOU() {
  iouArray.value.splice(currentIOU.value.index, 1);
  showPayIOU.value = false;
  //setIouArray(uuid.value);
}
</script>

<template>
  <BreadcrumbHTML><UBreadcrumb :links="links" /></BreadcrumbHTML>
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
  <UDivider label="IOU LIST" class="mt-8" />
  <!-- List of IOUs -->
  <UTable :rows="iouArray" :columns="columns" />
  <div class="grid grid-cols-1">
    <div
      class="ring-2 ring-gray-800 mx-4 my-4 text-center rounded-lg"
      v-for="(iou, index) in iouArray"
    >
      <div class="grid-cols-2 grid-rows-2 grid">
        <p
          class="ring-2 ring-gray-500 rounded m-2 flex items-center justify-center"
        >
          {{ iou.name }}
        </p>
        <p
          v-if="iou.borrowed"
          class="ring-2 ring-primary rounded m-2 flex items-center justify-center"
        >
          Borrowed
        </p>
        <p
          v-else
          class="ring-2 ring-red-400 rounded m-2 flex items-center justify-center"
        >
          Lent
        </p>
        <p
          class="ring-2 ring-gray-500 rounded m-2 flex items-center justify-center"
        >
          ${{ iou.amount }}
        </p>
        <UButton
          @click="togglePayModal(index)"
          class="m-2"
          icon="i-heroicons-check-solid"
        >
          Resolve
        </UButton>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-2 text-center">
    <div v-for="(iou, index) in iouArray">
      <br />
      <UChip size="xl" :text="'$' + iou.amount"
        ><UButton @click="togglePayModal(index)" variant="outline">
          <div class="flex items-center">
            <UIcon v-if="iou.borrowed" name="i-heroicons-arrow-up" />
            <UIcon v-else name="i-heroicons-arrow-down" />
            <div>
              {{ iou.name }}
              <p v-if="iou.borrowed">Borrowed</p>
              <p v-else>Lent</p>
            </div>
          </div>
        </UButton></UChip
      >
    </div>
  </div>

  <div v-for="(iou, index) in iouArray">
    <UCard class="my-6 mx-8">
      <template #header>
        <div class="flex justify-between items-center">
          <p v-if="iou.borrowed">Borrowed by: {{ iou.name }}</p>
          <p v-else>Lent to:{{ iou.name }}</p>
          <UButton
            @click="togglePayModal(index)"
            icon="i-heroicons-check-circle-solid"
          />
        </div>
      </template>
      <p class="text-lg">${{ iou.amount }}</p>
      <template #footer>
        <p v-if="iou.borrowed">Pay by: {{ iou.date }}</p>
        <p v-else>Recieve by: {{ iou.date }}</p>
      </template>
    </UCard>
  </div>
  <!-- Pay IOU modal -->
  <UModal :ui="{ container: 'items-center' }" v-model="showPayIOU">
    <UCard>
      <template #header>
        <div class="flex min-w-0 justify-between items-center">
          {{ currentIOU.name }}
          <UButton
            @click="showPayIOU = false"
            variant="link"
            color="white"
            size="xl"
            icon="i-heroicons-x-mark-solid"
          />
        </div>
      </template>
      Has The amount of ${{ currentIOU.amount }} been paid to
      {{ currentIOU.name }}?
      <template #footer>
        <div class="flex justify-around mx-auto">
          <UButton
            @click="deleteIOU"
            label="Yes, all paid!"
            class="justify-center"
          />
          <UButton
            @click="showPayIOU = false"
            label="Not yet"
            class="justify-center"
            color="red"
          />
        </div>
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
      <p class="font-bold text-lg text-primary">I Owe You</p>
      <p>
        An IOU (I Owe You) is a note you can leave yourself to track who has
        borrwed money from you, or who has lent money to you.
      </p>
      <br />
      <p>
        If you 'borrow' money from someone, set the IOU to 'borrowed'.<br />If
        someone owes you money, set the IOU to 'lent'.
      </p>
      <br />
      <p>Always pay back your debts! O(∩_∩)O</p>
      <UDivider class="my-2" />
    </UCard>
  </UModal>
</template>
