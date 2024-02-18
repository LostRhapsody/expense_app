<script setup>
// For notifications
const toast = useToast();

// show things
const showExplanation = ref(false);
const editOpen = ref(false);
const showIconExplainModal = ref(false);
const showGoalsList = ref(true);

// user data
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// temp goals
const goals = ref([]);

let currentGoal = {};

const links = getBreadcrumbs([
  {
    name: "Budgeting",
    icon: "i-heroicons-currency-dollar-solid",
    url: "/budgeting",
  },
  {
    name: "Goals",
    icon: "i-heroicons-trophy-solid",
    url: "/budgeting/goals",
  },
]);

/**
 * save's an envelope to the DB
 * @param key the key used to retrieve this value
 */
 async function setGoalsArray() {
  const key = localStorage.getItem("uuid");
  const setGoalsResponse = await $fetch("/api/budgeting/setGoal", {
    method: "post",
    body: {
      key: key + "goal",
      value: {
        goalResponseArray: goals.value,
      },
    },
  });

  if (setGoalsResponse === null || setGoalsResponse === undefined) {
    toast.add({ title: "Error: invalid response from server" });
  } else if (setGoalsResponse.error) {
    toast.add({ title: "Error: " + setGoalsResponse.message });
  }
}

/**
 * Get's the user's saved envelopes
 * @param key the key used to retrieve this value
 */
async function getGoalsArray() {
  const key = localStorage.getItem("uuid");

  const getGoalsResponse = await $fetch("/api/budgeting/getGoal", {
    method: "post",
    body: { key: key + "goal" },
  });

  if (
    getGoalsResponse === null ||
    getGoalsResponse === undefined ||
    getGoalsResponse.length > 0
  ) {
    toast.add({ title: "Error: invalid response from server" });
  } else if (getGoalsResponse.error) {
    toast.add({ title: "Error: " + getGoalsResponse.message });
  } else {
    goals.value = getGoalsResponse.goalResponseArray;
    if (goals.value !== null && goals.value !== undefined && goals.value.length > 0)
      showGoalsList.value = true;
  }
}

/**
 * Edit goal modal open
 * @param index the index of goals to edit
 */
function editGoal(index) {
  editOpen.value = true;
  let thisGoal = goals.value[index];

  currentGoal.label = thisGoal.label;
  currentGoal.icon = thisGoal.icon;
  currentGoal.amount = thisGoal.amount;
  currentGoal.saved = thisGoal.saved;
  currentGoal.startDate = thisGoal.startDate;
  currentGoal.endDate = thisGoal.endDate;
  currentGoal.index = index;
}

/**
 * Save the current goal back to the array
 */
function saveGoal() {
  if(!validateGoal()) return;
  editOpen.value = false;
  let thisGoal = goals.value[currentGoal.index];
  thisGoal.label = currentGoal.label;
  thisGoal.icon = currentGoal.icon;
  thisGoal.amount = currentGoal.amount;
  thisGoal.saved = currentGoal.saved;
  thisGoal.startDate = currentGoal.startDate;
  thisGoal.endDate = currentGoal.endDate;

  // empty current Goal
  currentGoal = {};

  setGoalsArray();
}

/**
 * Delete the current goal from the array
 */
function deleteGoal() {
  editOpen.value = false;

  // if array is zero, there's nothing to delete
  if (goals.value.length === 0) return;

  goals.value.splice(currentGoal.index, 1);
}

/**
 * Validate the current goal before saving
 */
function validateGoal(){
  if(typeof currentGoal.label !== "string" || currentGoal.label.length < 1){
    alert("Please give this goal a name before saving");
    return false;
  }
  if(typeof currentGoal.amount !== "number" || currentGoal.amount < 1){
    alert("Please give this goal a savings goal before saving");
    return false;
  }
  if(typeof currentGoal.saved !== "number"){
    alert("Please ensure the amount saved is a number.");
    return false;
  }
  return true;
}

/**
 * Creates a blank goal object and opens the edit modal
 */
function createGoal(){
  currentGoal = {
    label:"",
    icon:"",
    amount:0,
    saved:0,
    startDate:getCurrentDate("ymd"),
    endDate:"",
  }
  // if array doesn't exist, create it
  if(goals.value === undefined || goals.value === null){
    currentGoal.index = 0;
    goals.value = [currentGoal];
  } else {
    // if array exists just push it
    currentGoal.index = goals.value.length;
    goals.value.push(currentGoal);
  }
  editOpen.value = true;
}

function getGoalRatio(saved, amount) {
  if (saved === null || amount === null) return 0;
  if (saved === undefined || amount === undefined) return 0;
  if (saved === 0 || amount === 0) return 0;
  return (saved / amount) * 100;
}

if(loggedIn.value && process.client){
  getGoalsArray();
}

</script>
<template>
  <BreadcrumbHTML
    class="bg-primary-100/50 dark:bg-gray-800/50 rounded-full p-1"
  >
    <UBreadcrumb :ui="{ li: 'text-black' }" :links="links"
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
    <h1 class="text-3xl">Savings Goals</h1>
  </div>
  <div v-for="(goal, index) in goals">
    <UCard class="mx-8 my-8 px-2 cardBody">
      <template #header>
        <div class="text-2xl items-center grid grid-cols-3">
          <div class="text-start col-span-1 text-primary">{{ index + 1 }}.</div>
          <div class="text-start col-span-2">
            <UIcon :name="'i-heroicons-' + goal.icon + '-solid'" />
            {{ goal.label }}
          </div>
        </div>
      </template>
      <div class="text-center">
        <span class="text-primary text-xl"
          >{{ formatCurrency(goal.saved) }} /
          {{ formatCurrency(goal.amount) }}</span
        >
        <div class="grid grid-cols-1 gap-2">
          <div
            v-if="goal.startDate"
            class="grid grid-cols-2 bg-gray-200/75 dark:bg-gray-800/50 rounded-lg my-0.5"
          >
            <span>Start:</span><span>{{ goal.startDate }}</span>
          </div>
          <div
            v-if="goal.endDate"
            class="grid grid-cols-2 bg-gray-200/75 dark:bg-gray-800/50 rounded-lg"
          >
            <span>End:</span><span>{{ goal.endDate }}</span>
          </div>
        </div>
        <UProgress
          indicator
          class="pb-2"
          :value="getGoalRatio(goal.saved, goal.amount)"
        />
      </div>
      <template #footer>
        <div class="text-center">
          <UButton
            variant="outline"
            label="Edit Goal"
            @click="editGoal(index)"
          />
        </div>
      </template>
    </UCard>
  </div>
  <div class="text-center">
    <UButton
      class="mx-auto my-4 rounded-full h-28 w-28 justify-center text-3xl"
      @click="createGoal"
      >+<UIcon name="i-heroicons-trophy-solid"
    /></UButton>
  </div>
  <!-- Goal Edit Modal -->
  <UModal v-model="editOpen" :ui="{ container: 'items-center' }" prevent-close>
    <UCard>
      <template #header>
        <div class="flex min-w-0 justify-between">
          <p class="text-2xl">{{ currentGoal.label }}</p>
        </div>
      </template>
      <div class="grid grid-cols-3 items-center">
        <p>Label:</p>
        <UInput
          type="text"
          v-model="currentGoal.label"
          class="my-4 text-xl col-span-2"
          input-class="text-xl"
        >
        </UInput>
        <p>
          Icon:<UButton
            size="xl"
            icon="i-heroicons-information-circle-solid"
            variant="ghost"
            @click="showIconExplainModal = true"
          />
        </p>
        <UInput
          type="text"
          v-model="currentGoal.icon"
          class="my-4 text-xl col-span-2"
          input-class="text-xl"
        >
        </UInput>
        <p>Amount:</p>
        <UInput
          type="number"
          v-model="currentGoal.amount"
          class="my-4 text-xl col-span-2"
          input-class="text-xl"
        >
          <template #leading> $ </template>
        </UInput>
        <p>Saved:</p>
        <UInput
          type="number"
          v-model="currentGoal.saved"
          class="my-4 text-xl col-span-2"
          input-class="text-xl"
        >
          <template #leading> $ </template>
        </UInput>
        <p>Start Date:</p>
        <UInput
          type="date"
          v-model="currentGoal.startDate"
          class="my-4 text-xl col-span-2"
          input-class="text-xl"
        >
        </UInput>
        <p>End Date:</p>
        <UInput
          type="date"
          v-model="currentGoal.endDate"
          class="my-4 text-xl col-span-2"
          input-class="text-xl"
        >
        </UInput>
      </div>
      <em class="text-gray-400">State and end dates are optional</em>
      <template #footer>
        <UButton block label="Save Goal" @click="saveGoal" />
        <UButton
          block
          label="Delete Goal"
          @click="deleteGoal"
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
      <p class="font-bold text-lg text-primary">How to setup Savings Goals</p>
      <p>
        Click the <span class="text-primary">"+"</span> button to setup a
        savings goal.
      </p>
      <br />
      <p>
        You can specify the amount, what it is you're saving for, and the dates
        you started saving and want to be finished saving (both optional).
      </p>
      <br />
      <p>
        To update your <span class="text-primary">goals</span>, just tap on one
        of them.
      </p>
      <br />
      <p>
        Lastly, you can use
        <span class="text-red-500">the "Delete" button</span> when editing a
        goal to delete that goal.
      </p>
    </UCard>
  </UModal>
  <!-- EXPLANATION -->
  <UModal :ui="{ container: 'items-center' }" v-model="showIconExplainModal">
    <UCard>
      <template #header>
        <div class="flex min-w-0 justify-between">
          <p class="text-2xl">Icon Information</p>
          <UButton
            @click="showIconExplainModal = false"
            variant="link"
            color="white"
            size="xl"
            icon="i-heroicons-x-mark-solid"
            class="text-gray-600 hover:text-gray-900"
          />
        </div>
      </template>
      <p class="font-bold text-lg text-primary">How to Use Icons</p>
      <p>
        You can customize your savings goals with
        <span class="text-primary">ANY ICON YOU WANT</span> from
        <ULink to="https://heroicons.com" class="text-purple-500 underline" target="_"
          >heroicons <UIcon name="i-heroicons-arrow-top-right-on-square" /></ULink
        >.
      </p>
      <br />
      <p>
        Just search for an icon, then enter the name of the icon
        <strong>exactly as shown</strong> into the icon text box.
      </p>
      <br />
      <p>
        Example, for the icon <UIcon name="i-heroicons-home-modern-solid" /> just enter "home-modern" into the icon input field.
      </p>
    </UCard>
  </UModal>
</template>
