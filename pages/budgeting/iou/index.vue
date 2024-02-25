<script setup lang="ts">
// For notifications
const toast = useToast();

// show things
const showExplanation = ref(false);
const showPayIOU = ref(false);
const showEditIOU = ref(false);

// user data
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// list of IOU records
const iouArray = ref([]);

let currentIOU = {};
const currentIndex = ref(0);

// if 1 or more IOUs exist, set to true
const showIouList = computed(() => {
  return iouArray.value.length > 0;
});

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
  if(key === null) {
    return;
  }
  const setIouResponse = await $fetch("/api/budgeting/setIou", {
    method: "post",
    body: {
      key: key + "IOU",
      value: {
        iouReponseArray: iouArray.value,
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
  if(key === null) {
    return;
  }
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
    iouArray.value = getIouResponse.iouReponseArray;
    }
}

/**
 * Shows the confirmation "this IOU is payed?" dialogue box
 * @param index index of the current IOU
 */
function togglePayModal(index: number) {
  // show the box
  showPayIOU.value = true;  
  // set the current index/iou
  currentIndex.value = index;
}

/**
 * deletes an IOU from the array
 */
function deleteIOU() {

  // hide pay/edit modals
  showPayIOU.value = false;
  showEditIOU.value = false;

  // if array is zero, there's nothing to delete
  if (iouArray.value.length === 0) return;

  iouArray.value.splice(currentIndex.value, 1);

  currentIndex.value = 0;

  // if we emptied the array, hide the list
  // if(iouArray.value === null || iouArray.value === undefined){
  //   showIouList.value = false;
  // }

  if(loggedIn.value){
    setIouArray();
  }  

}

/**
 * create an IOU object
 */
function createIou() {
  // if array does not exist, instantiate with new empty object
  if(iouArray.value === null || iouArray.value === undefined){
    iouArray.value = [
      {
        name:"",
        borrowed:true,
        amount:0,
        date:getCurrentDate('ymd'),
      },
    ];
    // show the list now that something exists
    // showIouList.value = true
  // if array exists, push new empty object
  } else {
    iouArray.value.push({
      name:"",
        borrowed:true,
        amount:0,
        date:getCurrentDate('ymd'),
    });
    
  }

  // this always works, as we just created an array above, so it will always
  // have a min length of 1
  currentIndex.value = iouArray.value.length -1;;

  showEditIOU.value = true;

}

/**
 * Validates that the 'currentIOU' object is valid and can be saved
 */
function validateIOU() {
  let validIOU = true;
  if (iouArray.value[currentIndex.value].name.length <= 0) {
    alert("Please enter a name for the IOU record.");
    validIOU = false;
  }
  if (iouArray.value[currentIndex.value].amount <= 0 && validIOU) {
    alert("Please enter a positive amount for the IOU record.");
    validIOU = false;
  }
  if (iouArray.value[currentIndex.value].date.length <= 0 && validIOU) {
    alert("Please enter a due date for the IOU record.");
    validIOU = false;
  }

  return validIOU;
}

/**
 * Logged in INIT!
 */
if (loggedIn.value && process.client) {
  getIouArray();
}
</script>

<template>
  <BreadcrumbHTML class="bg-primary-100/50 dark:bg-gray-800/50 rounded-full p-1"
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
  <div class="text-center my-4">
    <h1 class="text-3xl">IOUs</h1>
  </div>
  <!-- List of IOUs -->
  <div v-if="showIouList" class="grid grid-cols-2 gap-4">
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
            <span class="break-words">{{ iou.name }}</span
            ><br />
            <span>Borrow</span>
            <br />
            <span>{{ iou.date }}</span>
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
            <span class="break-words">{{ iou.name }}</span
            ><br />
            <span>Lent</span>
            <br />
            <span>{{ iou.date }}</span>
          </UButton>
        </UChip>
      </div>
    </div>
  </div>
  <div v-else>
    <p>No IOUs to display.</p>
  </div>
  <div class="text-center">
    <UButton
      class="mx-auto my-4 rounded-full h-28 w-28 justify-center text-3xl"
      @click="createIou"
      >+ IOU</UButton
    >
  </div>
  <!-- Pay IOU modal -->
  <UModal :ui="{ container: 'items-center' }" v-model="showPayIOU" v-if="iouArray[currentIndex]">
    <UCard>
      <template #header>
        <div class="flex min-w-0 justify-between items-center">
          IOU: {{ iouArray[currentIndex].name }}
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
        Has The amount of ${{ iouArray[currentIndex].amount }} been
        <span v-if="iouArray[currentIndex].borrowed">paid to</span
        ><span v-else>received from</span> {{ iouArray[currentIndex].name }}?
      </p>
      <p>Due: {{ iouArray[currentIndex].date }}</p>
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
    v-if="iouArray[currentIndex]"
  >
    <UCard>
      <template #header>
        <div class="flex min-w-0 justify-between items-center">Edit IOU</div>
      </template>
      <div class="p-4">
        <!-- IOU for who -->
        <div class="grid grid-cols-3 gap-4 my-2">
          <!-- This stopped working. Big sad. -->
          <!-- <p v-if="iouArray[currentIndex].borrowed">Pay back:</p>
          <p v-else>Due from:</p> -->
          <p>Name:</p>
          <UInput
            class="col-span-2"
            type="string"
            placeholder="Money Please"
            v-model="iouArray[currentIndex].name"
          />
        </div>

        <!-- Borrowed -->
        <div class="grid grid-cols-3 gap-4 my-2">
          <p>Borrowed:</p>
          <UCheckbox class="col-span-2" v-model="iouArray[currentIndex].borrowed" />
        </div>

        <!-- IOU Amount -->
        <div class="grid grid-cols-3 gap-4 my-2">
          <p>Amount:</p>
          <UInput
            class="col-span-2"
            type="number"
            placeholder="0.00"
            v-model="iouArray[currentIndex].amount"
          >
            <template #leading> $ </template>
          </UInput>
        </div>

        <!-- IOU Date -->
        <div class="grid grid-cols-3 gap-4 my-2">
          <p>Due Date:</p>
          <UInput class="col-span-2" type="date" v-model="iouArray[currentIndex].date" />
        </div>
      </div>
      <template #footer>
        <div class="grid grid-cols-2 gap-3">
          <UButton
            @click="showEditIOU = false, setIouArray()"
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
        Always pay back your debts!
        <span class="text-primary"><br />(╯°□°）╯︵ ┻━┻</span>
      </p>
      <UDivider class="my-2" />
    </UCard>
  </UModal>
</template>
