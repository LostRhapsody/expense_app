<script setup lang="ts">
// For notifications
const toast = useToast();

// show things
const showExplanation = ref(false);
const showPayIOU = ref(false);
const showEditIOU = ref(false);
const showIouList = ref(false);

// user data
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// list of IOU records
let iouArray: any[] = [];
let currentIOU = {};

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
async function setIouArray() {
  const key = localStorage.getItem("uuid");
  const setIouResponse = await $fetch("/api/budgeting/setIou", {
    method: "post",
    body: {
      key: key + "IOU",
      value: {
        iouReponseArray: iouArray,
      },
    },
  });

  if (setIouResponse === null || setIouResponse === undefined) {
    toast.add({ title: "Error: invalid response from server" });
  } else if (setIouResponse.error) {
    toast.add({ title: "Error: " + setIouResponse.message });
  }
}

/**
 * Get's the user's saved envelopes
 * @param key the key used to retrieve this value
 */
async function getIouArray() {
  const key = localStorage.getItem("uuid");

  const getIouResponse = await $fetch("/api/budgeting/getIou", {
    method: "post",
    body: { key: key + "IOU" },
  });

  if (
    getIouResponse === null ||
    getIouResponse === undefined ||
    getIouResponse.length > 0
  ) {
    toast.add({ title: "Error: invalid response from server" });
  } else if (getIouResponse.error) {
    toast.add({ title: "Error: " + getIouResponse.message });
  } else {
    iouArray = getIouResponse.iouReponseArray;
    if (iouArray !== null && iouArray !== undefined && iouArray.length > 0)
      showIouList.value = true;
  }
}

/**
 * Shows the confirmation "this IOU is payed?" dialogue box
 * @param index index of the current IOU
 */
function togglePayModal(index: number) {
  showPayIOU.value = true;
  currentIOU = iouArray[index];
  currentIOU.index = index;
}

/**
 * deletes an IOU from the array
 */
function deleteIOU() {
  // hide pay/edit modals
  showPayIOU.value = false;
  showEditIOU.value = false;

  // if array is zero, there's nothing to delete
  if (iouArray.length === 0) return;

  iouArray.splice(currentIOU.index, 1);
  setIouArray();
}

/**
 * create an IOU object
 */
function createIou() {
  showEditIOU.value = true;

  // set the current IOU object to a blank object
  currentIOU.name = "";
  currentIOU.borrowed = true;
  currentIOU.amount = 0;
  currentIOU.date = getCurrentDate("ymd");
  if (iouArray === undefined || iouArray === null) {
    currentIOU.index = 0;
  } else {
    // index 1 will be array element [0], so we don't have to add +1 to the length
    currentIOU.index = iouArray.length;
  }
}

/**
 * Validates that the 'currentIOU' object is valid and can be saved
 */
function validateIOU() {
  let validIOU = true;
  if (currentIOU.name.length <= 0) {
    alert("Please enter a name for the IOU record.");
    validIOU = false;
  }
  if (currentIOU.amount <= 0 && validIOU) {
    alert("Please enter a positive amount for the IOU record.");
    validIOU = false;
  }
  if (currentIOU.date.length <= 0 && validIOU) {
    alert("Please enter a due date for the IOU record.");
    validIOU = false;
  }

  return validIOU;
}

/**
 * Updates the array of IOUs with the current IOU being edited
 */
function updateIOUArray() {
  if (!validateIOU()) return;

  // if array doesn't exist, create it and the object
  if (iouArray === undefined || iouArray === null) {
    iouArray = [
      {
        name: currentIOU.name,
        borrowed: currentIOU.borrowed,
        amount: currentIOU.amount,
        date: currentIOU.date,
      },
    ];
  } else {
    // if the index is greater than or equal to the length, it is a new element
    if (currentIOU.index >= iouArray.length) {
      // push the current values onto the array
      iouArray.push(currentIOU);
      showIouList.value = true;
    } else {
      // otherwise, we have to update the correct element
      // need to -1 because the length is one greater than the element index
      iouArray[currentIOU.index] = {
        name: currentIOU.name,
        amount: currentIOU.amount,
        borrowed: currentIOU.borrowed,
        date: currentIOU.date,
      };
      showIouList.value = true;
    }
  }

  showEditIOU.value = false;
  setIouArray();
}

/**
 * Logged in INIT!
 */
if (loggedIn && process.client) {
  getIouArray();
}
</script>

<template>
  <BreadcrumbHTML class="bg-primary-100/50 dark:bg-gray-700/50 rounded-full p-1"
    ><UBreadcrumb :ui="{ li: 'text-black' }" :links="links"
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
  <!-- List of IOUs -->
  <div class="grid grid-cols-2 gap-4">
    <div v-if="showIouList">
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
    <div v-else>
      <p>No IOUs to display.</p>
    </div>
  </div>
  <div class="text-center">
    <!-- @click="createIOU" -->
    <UButton
      class="mx-auto my-4 rounded-full h-28 w-28 justify-center text-3xl"
      @click="createIou"
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
      <p>
        Has The amount of ${{ currentIOU.amount }} been
        <span v-if="currentIOU.borrowed">paid to</span
        ><span v-else>received from</span> {{ currentIOU.name }}?
      </p>
      <p>Due: {{ currentIOU.date }}</p>
      <template #footer>
        <div class="grid grid-cols-3 gap-3">
          <UButton
            @click="deleteIOU"
            label="Yes, all paid!"
            class="justify-center w-full"
          />
          <UButton
            @click="(showPayIOU = false), (showEditIOU = true)"
            label="Edit"
            class="justify-center w-full"
            color="blue"
          />
          <UButton
            @click="showPayIOU = false"
            label="Not yet"
            class="justify-center w-full"
            color="red"
          />
        </div>
      </template>
    </UCard>
  </UModal>

  <!-- Edit/Create IOU modal -->
  <UModal
    :ui="{ container: 'items-center' }"
    v-model="showEditIOU"
    prevent-close
  >
    <UCard>
      <template #header>
        <div class="flex min-w-0 justify-between items-center">Edit IOU</div>
      </template>
      <div class="p-4">
        <!-- IOU for who -->
        <div class="grid grid-cols-3 gap-4">
          <p v-if="currentIOU.borrowed">Pay back:</p>
          <p v-else>Due from:</p>
          <UInput
            class="col-span-2"
            type="string"
            placeholder="Name"
            v-model="currentIOU.name"
          />
        </div>

        <!-- Borrowed -->
        <div class="grid grid-cols-3 gap-4 my-2">
          <p>Borrowed:</p>
          <UCheckbox class="col-span-2" v-model="currentIOU.borrowed" />
        </div>

        <!-- IOU Amount -->
        <div class="grid grid-cols-3 gap-4">
          <p>Amount:</p>
          <UInput
            class="col-span-2"
            type="number"
            placeholder="0.00"
            v-model="currentIOU.amount"
          >
            <template #leading> $ </template>
          </UInput>
        </div>

        <!-- IOU Date -->
        <div class="grid grid-cols-3 gap-4">
          <p>Due Date:</p>
          <UInput class="col-span-2" type="date" v-model="currentIOU.date" />
        </div>
      </div>
      <template #footer>
        <div class="grid grid-cols-2 gap-3">
          <UButton
            @click="updateIOUArray"
            label="Submit"
            class="justify-center"
          />
          <UButton
            @click="deleteIOU"
            label="Delete IOU"
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
