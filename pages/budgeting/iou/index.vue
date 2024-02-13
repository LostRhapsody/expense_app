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
  <div class="grid grid-cols-2">
    <div v-for="(iou, index) in iouArray">
      <div v-if="iou.borrowed" class="m-2">
        <UChip
          size="3xl"
          :text="'$' + iou.amount"
          class="w-full my-4"
          color="red"
        >
          <UButton
            @click="togglePayModal(index)"
            color="red"
            class="w-full block text-start"
            variant="outline"
          >
            <span>{{ iou.name }}</span
            ><br />
            <span>Borrow</span>
          </UButton>
        </UChip>
      </div>
      <div v-else class="m-2">
        <UChip size="3xl" :text="'$' + iou.amount" class="w-full my-4">
          <UButton
            @click="togglePayModal(index)"
            class="w-full block text-start"
            variant="outline"
          >
            <span>{{ iou.name }}</span
            ><br />
            <span>Lent</span>
          </UButton>
        </UChip>
      </div>
    </div>
  </div>
  <div class="text-center">
    <!-- @click="createIOU" -->
    <UButton class="mx-auto my-4 rounded-full h-28 w-28 justify-center text-3xl"
      >+ IOU</UButton
    >
  </div>
  <!-- Pay IOU modal -->
  <UModal :ui="{ container: 'items-center' }" v-model="showPayIOU">
    <UCard>
      <template #header>
        <div class="flex min-w-0 justify-between items-center">
          IOU: {{ currentIOU.name }}
          <UButton
            @click="showPayIOU = false"
            variant="link"
            color="white"
            size="xl"
            icon="i-heroicons-x-mark-solid"
            class="text-gray-600 hover:text-gray-900"
          />
        </div>
      </template>
      Has The amount of ${{ currentIOU.amount }} been
      <span v-if="currentIOU.borrowed">paid to</span
      ><span v-else>received from</span> {{ currentIOU.name }}?
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
            class="text-gray-600 hover:text-gray-900"
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
        If you 'borrow' money from someone, set the IOU to 'borrowed'. These
        will be in <span class="text-red-400">red</span>.<br /><br />If someone
        owes you money, set the IOU to 'lent'. These will be in
        <span class="text-primary">green</span>.
      </p>
      <br />
      <p>
        Always pay back your debts! <span class="text-primary">O(∩_∩)O</span>
      </p>
      <UDivider class="my-2" />
    </UCard>
  </UModal>
</template>
