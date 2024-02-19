<script setup>
// For notifications
const toast = useToast();

// show things
const showExplanation = ref(false);
const editOpen = ref(false);
const showIconExplainModal = ref(false);
const showGoalsList = ref(true);
const showIconList = ref(false);

// user data
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// temp goals
const goals = ref([]);

let currentGoal = ref({});

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

const icons = ref([
  "i-heroicons-academic-cap-solid",
  "i-heroicons-adjustments-horizontal-solid",
  "i-heroicons-adjustments-vertical-solid",
  "i-heroicons-archive-box-arrow-down-solid",
  "i-heroicons-archive-box-x-mark-solid",
  "i-heroicons-archive-box-solid",
  "i-heroicons-arrow-down-circle-solid",
  "i-heroicons-arrow-down-left-solid",
  "i-heroicons-arrow-down-on-square-stack-solid",
  "i-heroicons-arrow-down-on-square-solid",
  "i-heroicons-arrow-down-right-solid",
  "i-heroicons-arrow-down-tray-solid",
  "i-heroicons-arrow-down-solid",
  "i-heroicons-arrow-left-circle-solid",
  "i-heroicons-arrow-left-end-on-rectangle-solid",
  "i-heroicons-arrow-left-start-on-rectangle-solid",
  "i-heroicons-arrow-left-solid",
  "i-heroicons-arrow-long-down-solid",
  "i-heroicons-arrow-long-left-solid",
  "i-heroicons-arrow-long-right-solid",
  "i-heroicons-arrow-long-up-solid",
  "i-heroicons-arrow-path-rounded-square-solid",
  "i-heroicons-arrow-path-solid",
  "i-heroicons-arrow-right-circle-solid",
  "i-heroicons-arrow-right-end-on-rectangle-solid",
  "i-heroicons-arrow-right-start-on-rectangle-solid",
  "i-heroicons-arrow-right-solid",
  "i-heroicons-arrow-top-right-on-square-solid",
  "i-heroicons-arrow-trending-down-solid",
  "i-heroicons-arrow-trending-up-solid",
  "i-heroicons-arrow-up-circle-solid",
  "i-heroicons-arrow-up-left-solid",
  "i-heroicons-arrow-up-on-square-stack-solid",
  "i-heroicons-arrow-up-on-square-solid",
  "i-heroicons-arrow-up-right-solid",
  "i-heroicons-arrow-up-tray-solid",
  "i-heroicons-arrow-up-solid",
  "i-heroicons-arrow-uturn-down-solid",
  "i-heroicons-arrow-uturn-left-solid",
  "i-heroicons-arrow-uturn-right-solid",
  "i-heroicons-arrow-uturn-up-solid",
  "i-heroicons-arrows-pointing-in-solid",
  "i-heroicons-arrows-pointing-out-solid",
  "i-heroicons-arrows-right-left-solid",
  "i-heroicons-arrows-up-down-solid",
  "i-heroicons-at-symbol-solid",
  "i-heroicons-backspace-solid",
  "i-heroicons-backward-solid",
  "i-heroicons-banknotes-solid",
  "i-heroicons-bars-2-solid",
  "i-heroicons-bars-3-bottom-left-solid",
  "i-heroicons-bars-3-bottom-right-solid",
  "i-heroicons-bars-3-center-left-solid",
  "i-heroicons-bars-3-solid",
  "i-heroicons-bars-4-solid",
  "i-heroicons-bars-arrow-down-solid",
  "i-heroicons-bars-arrow-up-solid",
  "i-heroicons-battery-0-solid",
  "i-heroicons-battery-100-solid",
  "i-heroicons-battery-50-solid",
  "i-heroicons-beaker-solid",
  "i-heroicons-bell-alert-solid",
  "i-heroicons-bell-slash-solid",
  "i-heroicons-bell-snooze-solid",
  "i-heroicons-bell-solid",
  "i-heroicons-bolt-slash-solid",
  "i-heroicons-bolt-solid",
  "i-heroicons-book-open-solid",
  "i-heroicons-bookmark-slash-solid",
  "i-heroicons-bookmark-square-solid",
  "i-heroicons-bookmark-solid",
  "i-heroicons-briefcase-solid",
  "i-heroicons-bug-ant-solid",
  "i-heroicons-building-library-solid",
  "i-heroicons-building-office-2-solid",
  "i-heroicons-building-office-solid",
  "i-heroicons-building-storefront-solid",
  "i-heroicons-cake-solid",
  "i-heroicons-calculator-solid",
  "i-heroicons-calendar-days-solid",
  "i-heroicons-calendar-solid",
  "i-heroicons-camera-solid",
  "i-heroicons-chart-bar-square-solid",
  "i-heroicons-chart-bar-solid",
  "i-heroicons-chart-pie-solid",
  "i-heroicons-chat-bubble-bottom-center-text-solid",
  "i-heroicons-chat-bubble-bottom-center-solid",
  "i-heroicons-chat-bubble-left-ellipsis-solid",
  "i-heroicons-chat-bubble-left-right-solid",
  "i-heroicons-chat-bubble-left-solid",
  "i-heroicons-chat-bubble-oval-left-ellipsis-solid",
  "i-heroicons-chat-bubble-oval-left-solid",
  "i-heroicons-check-badge-solid",
  "i-heroicons-check-circle-solid",
  "i-heroicons-check-solid",
  "i-heroicons-chevron-double-down-solid",
  "i-heroicons-chevron-double-left-solid",
  "i-heroicons-chevron-double-right-solid",
  "i-heroicons-chevron-double-up-solid",
  "i-heroicons-chevron-down-solid",
  "i-heroicons-chevron-left-solid",
  "i-heroicons-chevron-right-solid",
  "i-heroicons-chevron-up-down-solid",
  "i-heroicons-chevron-up-solid",
  "i-heroicons-circle-stack-solid",
  "i-heroicons-clipboard-document-check-solid",
  "i-heroicons-clipboard-document-list-solid",
  "i-heroicons-clipboard-document-solid",
  "i-heroicons-clipboard-solid",
  "i-heroicons-clock-solid",
  "i-heroicons-cloud-arrow-down-solid",
  "i-heroicons-cloud-arrow-up-solid",
  "i-heroicons-cloud-solid",
  "i-heroicons-code-bracket-square-solid",
  "i-heroicons-code-bracket-solid",
  "i-heroicons-cog-6-tooth-solid",
  "i-heroicons-cog-8-tooth-solid",
  "i-heroicons-cog-solid",
  "i-heroicons-command-line-solid",
  "i-heroicons-computer-desktop-solid",
  "i-heroicons-cpu-chip-solid",
  "i-heroicons-credit-card-solid",
  "i-heroicons-cube-transparent-solid",
  "i-heroicons-cube-solid",
  "i-heroicons-currency-bangladeshi-solid",
  "i-heroicons-currency-dollar-solid",
  "i-heroicons-currency-euro-solid",
  "i-heroicons-currency-pound-solid",
  "i-heroicons-currency-rupee-solid",
  "i-heroicons-currency-yen-solid",
  "i-heroicons-cursor-arrow-rays-solid",
  "i-heroicons-cursor-arrow-ripple-solid",
  "i-heroicons-device-phone-mobile-solid",
  "i-heroicons-device-tablet-solid",
  "i-heroicons-document-arrow-down-solid",
  "i-heroicons-document-arrow-up-solid",
  "i-heroicons-document-chart-bar-solid",
  "i-heroicons-document-check-solid",
  "i-heroicons-document-duplicate-solid",
  "i-heroicons-document-magnifying-glass-solid",
  "i-heroicons-document-minus-solid",
  "i-heroicons-document-plus-solid",
  "i-heroicons-document-text-solid",
  "i-heroicons-document-solid",
  "i-heroicons-ellipsis-horizontal-circle-solid",
  "i-heroicons-ellipsis-horizontal-solid",
  "i-heroicons-ellipsis-vertical-solid",
  "i-heroicons-envelope-open-solid",
  "i-heroicons-envelope-solid",
  "i-heroicons-exclamation-circle-solid",
  "i-heroicons-exclamation-triangle-solid",
  "i-heroicons-eye-dropper-solid",
  "i-heroicons-eye-slash-solid",
  "i-heroicons-eye-solid",
  "i-heroicons-face-frown-solid",
  "i-heroicons-face-smile-solid",
  "i-heroicons-film-solid",
  "i-heroicons-finger-print-solid",
  "i-heroicons-fire-solid",
  "i-heroicons-flag-solid",
  "i-heroicons-folder-arrow-down-solid",
  "i-heroicons-folder-minus-solid",
  "i-heroicons-folder-open-solid",
  "i-heroicons-folder-plus-solid",
  "i-heroicons-folder-solid",
  "i-heroicons-forward-solid",
  "i-heroicons-funnel-solid",
  "i-heroicons-gif-solid",
  "i-heroicons-gift-top-solid",
  "i-heroicons-gift-solid",
  "i-heroicons-globe-alt-solid",
  "i-heroicons-globe-americas-solid",
  "i-heroicons-globe-asia-australia-solid",
  "i-heroicons-globe-europe-africa-solid",
  "i-heroicons-hand-raised-solid",
  "i-heroicons-hand-thumb-down-solid",
  "i-heroicons-hand-thumb-up-solid",
  "i-heroicons-hashtag-solid",
  "i-heroicons-heart-solid",
  "i-heroicons-home-modern-solid",
  "i-heroicons-home-solid",
  "i-heroicons-identification-solid",
  "i-heroicons-inbox-arrow-down-solid",
  "i-heroicons-inbox-stack-solid",
  "i-heroicons-inbox-solid",
  "i-heroicons-information-circle-solid",
  "i-heroicons-key-solid",
  "i-heroicons-language-solid",
  "i-heroicons-lifebuoy-solid",
  "i-heroicons-light-bulb-solid",
  "i-heroicons-link-solid",
  "i-heroicons-list-bullet-solid",
  "i-heroicons-lock-closed-solid",
  "i-heroicons-lock-open-solid",
  "i-heroicons-magnifying-glass-circle-solid",
  "i-heroicons-magnifying-glass-minus-solid",
  "i-heroicons-magnifying-glass-plus-solid",
  "i-heroicons-magnifying-glass-solid",
  "i-heroicons-map-pin-solid",
  "i-heroicons-map-solid",
  "i-heroicons-megaphone-solid",
  "i-heroicons-microphone-solid",
  "i-heroicons-minus-circle-solid",
  "i-heroicons-minus-solid",
  "i-heroicons-moon-solid",
  "i-heroicons-musical-note-solid",
  "i-heroicons-newspaper-solid",
  "i-heroicons-no-symbol-solid",
  "i-heroicons-paint-brush-solid",
  "i-heroicons-paper-airplane-solid",
  "i-heroicons-paper-clip-solid",
  "i-heroicons-pause-circle-solid",
  "i-heroicons-pause-solid",
  "i-heroicons-pencil-square-solid",
  "i-heroicons-pencil-solid",
  "i-heroicons-phone-arrow-down-left-solid",
  "i-heroicons-phone-arrow-up-right-solid",
  "i-heroicons-phone-x-mark-solid",
  "i-heroicons-phone-solid",
  "i-heroicons-photo-solid",
  "i-heroicons-play-circle-solid",
  "i-heroicons-play-pause-solid",
  "i-heroicons-play-solid",
  "i-heroicons-plus-circle-solid",
  "i-heroicons-plus-solid",
  "i-heroicons-power-solid",
  "i-heroicons-presentation-chart-bar-solid",
  "i-heroicons-presentation-chart-line-solid",
  "i-heroicons-printer-solid",
  "i-heroicons-puzzle-piece-solid",
  "i-heroicons-qr-code-solid",
  "i-heroicons-question-mark-circle-solid",
  "i-heroicons-queue-list-solid",
  "i-heroicons-radio-solid",
  "i-heroicons-receipt-percent-solid",
  "i-heroicons-receipt-refund-solid",
  "i-heroicons-rectangle-group-solid",
  "i-heroicons-rectangle-stack-solid",
  "i-heroicons-rocket-launch-solid",
  "i-heroicons-rss-solid",
  "i-heroicons-scale-solid",
  "i-heroicons-scissors-solid",
  "i-heroicons-server-stack-solid",
  "i-heroicons-server-solid",
  "i-heroicons-share-solid",
  "i-heroicons-shield-check-solid",
  "i-heroicons-shield-exclamation-solid",
  "i-heroicons-shopping-bag-solid",
  "i-heroicons-shopping-cart-solid",
  "i-heroicons-signal-slash-solid",
  "i-heroicons-signal-solid",
  "i-heroicons-sparkles-solid",
  "i-heroicons-speaker-wave-solid",
  "i-heroicons-speaker-x-mark-solid",
  "i-heroicons-square-2-stack-solid",
  "i-heroicons-square-3-stack-3d-solid",
  "i-heroicons-squares-2x2-solid",
  "i-heroicons-squares-plus-solid",
  "i-heroicons-star-solid",
  "i-heroicons-stop-circle-solid",
  "i-heroicons-stop-solid",
  "i-heroicons-sun-solid",
  "i-heroicons-swatch-solid",
  "i-heroicons-table-cells-solid",
  "i-heroicons-tag-solid",
  "i-heroicons-ticket-solid",
  "i-heroicons-trash-solid",
  "i-heroicons-trophy-solid",
  "i-heroicons-truck-solid",
  "i-heroicons-tv-solid",
  "i-heroicons-user-circle-solid",
  "i-heroicons-user-group-solid",
  "i-heroicons-user-minus-solid",
  "i-heroicons-user-plus-solid",
  "i-heroicons-user-solid",
  "i-heroicons-users-solid",
  "i-heroicons-variable-solid",
  "i-heroicons-video-camera-slash-solid",
  "i-heroicons-video-camera-solid",
  "i-heroicons-view-columns-solid",
  "i-heroicons-viewfinder-circle-solid",
  "i-heroicons-wallet-solid",
  "i-heroicons-wifi-solid",
  "i-heroicons-window-solid",
  "i-heroicons-wrench-screwdriver-solid",
  "i-heroicons-wrench-solid",
  "i-heroicons-x-circle-solid",
  "i-heroicons-x-mark-solid",
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
    if (
      goals.value !== null &&
      goals.value !== undefined &&
      goals.value.length > 0
    )
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

  currentGoal.value.label = thisGoal.label;
  currentGoal.value.icon = thisGoal.icon;
  currentGoal.value.amount = thisGoal.amount;
  currentGoal.value.saved = thisGoal.saved;
  currentGoal.value.startDate = thisGoal.startDate;
  currentGoal.value.endDate = thisGoal.endDate;
  currentGoal.value.index = index;
}

/**
 * Save the current goal back to the array
 */
function saveGoal() {
  if (!validateGoal()) return;
  editOpen.value = false;
  let thisGoal = goals.value[currentGoal.value.index];
  thisGoal.label = currentGoal.value.label;
  thisGoal.icon = currentGoal.value.icon;
  thisGoal.amount = currentGoal.value.amount;
  thisGoal.saved = currentGoal.value.saved;
  thisGoal.startDate = currentGoal.value.startDate;
  thisGoal.endDate = currentGoal.value.endDate;

  // empty current Goal
  currentGoal.value = {};

  setGoalsArray();
}

/**
 * Delete the current goal from the array
 */
function deleteGoal() {
  editOpen.value = false;

  // if array is zero, there's nothing to delete
  if (goals.value.length === 0) return;

  goals.value.splice(currentGoal.value.index, 1);
}

/**
 * Validate the current goal before saving
 */
function validateGoal() {
  if (
    typeof currentGoal.value.label !== "string" ||
    currentGoal.value.label.length < 1
  ) {
    alert("Please give this goal a name before saving");
    return false;
  }
  if (
    typeof currentGoal.value.amount !== "number" ||
    currentGoal.value.amount < 1
  ) {
    alert("Please give this goal a savings goal before saving");
    return false;
  }
  if (typeof currentGoal.value.saved !== "number") {
    alert("Please ensure the amount saved is a number.");
    return false;
  }
  return true;
}

/**
 * Creates a blank goal object and opens the edit modal
 */
function createGoal() {
  currentGoal.value = {
    label: "",
    icon: 0,
    amount: 0,
    saved: 0,
    startDate: getCurrentDate("ymd"),
    endDate: "",
  };
  // if array doesn't exist, create it
  if (goals.value === undefined || goals.value === null) {
    currentGoal.value.index = 0;
    goals.value = [currentGoal.value];
  } else {
    // if array exists just push it
    currentGoal.value.index = goals.value.length;
    goals.value.push(currentGoal.value);
  }
  editOpen.value = true;
}

function getGoalRatio(saved, amount) {
  if (saved === null || amount === null) return 0;
  if (saved === undefined || amount === undefined) return 0;
  if (saved === 0 || amount === 0) return 0;
  return (saved / amount) * 100;
}

if (loggedIn.value && process.client) {
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
            <UIcon :name="icons[goal.icon]" />
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
        <UButton
          class="col-span-2 justify-center text-2xl"
          @click="showIconList = true"
          variant="outline"
          ><UIcon
            v-if="currentGoal.icon !== undefined"
            :name="icons[currentGoal.icon]"
          />
        </UButton>
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
      <em class="text-gray-400">Start and end dates are optional</em>
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
        Customize your savings goals with
        <span class="text-primary">any icon you want</span> from
        <ULink
          to="https://heroicons.com"
          class="text-purple-500 underline"
          target="_"
          >heroicons
          <UIcon name="i-heroicons-arrow-top-right-on-square" /></ULink
        >.
      </p>
      <br />
      <p>
        When you click the icon (defaults to <UIcon name="i-heroicons-academic-cap-solid" />) a list will appear. Just select any icon from that list and it will be used to represent your goal!
      </p>      
    </UCard>
  </UModal>
  <UModal v-model="showIconList" :ui="{ container: 'items-center' }">
    <UCard>
      <template #header> 
        <div class="flex min-w-0 justify-between">
          <p class="text-2xl">Icon List</p>
          <UButton
            @click="showIconList = false"
            variant="link"
            color="white"
            size="xl"
            icon="i-heroicons-x-mark-solid"
            class="text-gray-600 hover:text-gray-900"
          />
        </div>
      </template>
      <p class="text-center text-lg">Select an icon to represent your savings goal!</p>
      <div class="grid grid-cols-4 mx-auto text-center overflow-auto max-h-80">
        <div v-for="(icon, index) in icons">
          <UButton
            @click="(currentGoal.icon = index), (showIconList = false)"
            :icon="icon"
            variant="outline"
            class="m-2"
            size="lg"
          />
        </div>
      </div>
    </UCard>
  </UModal>
</template>
