<script setup lang="ts">
// show/hide things
const showAlert = ref(false);
const showList = ref(false);
const showExplanation = ref(false);
const showEditBudget = ref(false);
const showSettings = ref(false);
const showTaxEstimate = ref(true);

// How much to increase the counter by
const incrementBy = ref(1);

// controls audio
const onPlaying = ref(false);

// stores grocery trips in memory
const userArray = ref([]);

// total of all grocery trips
const total = ref(0);
// formatted total
const totalDisplay = ref("");

// The clicker's val
const count = ref(0);

// Budget for grocery trips
const budget = ref(100);

// approximate tax rate
const taxRate = ref(0.13);

// approximate tax
const taxEstimate = ref(0);

// Grab the date
const date = new Date();
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();
const currentDate = `${day}-${month}-${year}`;

const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

/**
 * Updates the user's saved budget
 * @param key the key used to store this value (user email)
 */
async function saveBudget(key: string) {
  await $fetch("/api/setItem/", {
    method: "post",
    body: {
      key: key + "budget",
      value: {
        budget: budget.value,
      },
    },
  });
  showEditBudget.value = false;
}

/**
 * Get's the user's saved budget
 * @param key the key used to retrieve this value (user email + budget)
 */
async function getUserBudget(key: string) {
  const budgetData = await $fetch("/api/getItem/", {
    method: "post",
    body: { key: key + "budget" },
  });
  if (budgetData !== null)
    if (budgetData.budget !== null && typeof budgetData.budget === "number")
      budget.value = budgetData.budget;
}

/**
 * Stores the current counter in a key-value pair
 * @param key the key used to store this value (user email)
 */
async function storeCounter(key: string) {
  await $fetch("/api/setItem/", {
    method: "post",
    body: {
      key: key,
      value: {
        list: userArray.value,
      },
    },
  });
}

/**
 * Updates the total value of past tallies
 * Also formats the display value
 */
function updateTotal() {
  total.value = 0;
  userArray.value.forEach((element) => {
    total.value += element.count;
  });
  totalDisplay.value = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(total.value);
}

/**
 * Get's the key-value pair containing the
 * array of the user's expenses, updates total
 * @param key the key used to retrive the value
 */
async function getUserTallies(key: string) {
  const itemData = await $fetch("/api/getItem/", {
    method: "post",
    body: { key: key },
  });
  userArray.value = itemData.list;
  updateTotal();
}

/**
 * Updates the userArray with the current counter
 * @param mode add mode: resets counter and pushes to array
 */
function updateUserArray(mode: string) {
  if (mode === "add") {
    if (count.value <= 0) return;
    userArray.value.push({
      count: count.value,
      id: userArray.value.length + 1,
      date: currentDate,
      budget: budget.value,
      usedBudget: (count.value / budget.value) * 100,
    });
    resetCounter();
  }
  updateTotal();
  if (loggedIn.value) {
    storeCounter(data.value?.user.email);
  }
}

/**
 * Deletes an item from the userArray
 * @param index the index of the item to delete from the array
 */
function deleteItem(index: number) {
  userArray.value.splice(index, 1);
  updateUserArray();
}

/**
 * increments the $ counter and chimes
 * audio must finish before we increment the counter again
 */
function increment() {
  // Really ugly implementation.
  // Should play one of the three sounds...
  // Issue isn't apparent on desktop, sound finished fast,
  // on phone, sound takes forever.
  const audio = document.getElementById("clicker");
  const audio2 = document.getElementById("clicker2");
  const audio3 = document.getElementById("clicker3");
  if (audio === null || audio2 === null || audio3 === null) return;
  if (!audio.paused && !audio2.paused && !audio3.paused) return;
  
  if (audio.paused) {
    audio.play();
    count.value += incrementBy.value;
    taxEstimate.value = Math.round(count.value * taxRate.value);
    return;
  }
  if (audio2.paused) {
    audio2.play();
    count.value += incrementBy.value;
    taxEstimate.value = Math.round(count.value * taxRate.value);
    return;
  }

  if (audio3.paused) {
    audio3.play();
    count.value += incrementBy.value;
    taxEstimate.value = Math.round(count.value * taxRate.value);
    return;
  }
}

/**
 * decrements the increment by value, keeping it at least 1
 */
function decrement() {
  if (count.value > 0) {
    if (count.value - incrementBy.value < 0) {
      count.value = 0;
    } else {
      count.value -= incrementBy.value;
    }
  }
}

/**
 * Used to ensure the number a user is unputting is a valid number
 */
function verifyNumber(value: number, taxRate: boolean) {
  // basically, we can set tax to 0, incrementBy should be at least 1 though
  if (taxRate) {
    if (value <= 0 || value === null || value === "" || value === undefined)
      return 0;
  } else {
    if (value <= 0 || value === null || value === "" || value === undefined)
      return 1;
  }

  return value;
}

/**
 * Hides the 'confirm reset' alert
 */
function hideAlert() {
  showAlert.value = false;
}

/**
 * Resets the counter to 0 and hides the alert and sets tax estimate to 0
 */
function resetCounter() {
  hideAlert();
  count.value = 0;
  taxEstimate.value = 0;
}

/**
 * Initialize
 */
if (loggedIn.value) {
  getUserTallies(data.value?.user.email);
  getUserBudget(data.value?.user.email);
}
</script>

<template>
  <div class="flex flex-col mx-auto justify-center">
    <!--  audio for clicker -->
    <audio
      pause
      id="clicker"
      src="/click_short.mp3"
      ref="audioPlayer"
      @timeupdate="onPlaying"
    >
      Your browser does not support the <code>audio</code> element.
    </audio>
    <audio
      pause
      id="clicker2"
      src="/click_short.mp3"
      ref="audioPlayer"
      @timeupdate="onPlaying"
    >
      Your browser does not support the <code>audio</code> element.
    </audio>
    <audio
      pause
      id="clicker3"
      src="/click_short.mp3"
      ref="audioPlayer"
      @timeupdate="onPlaying"
    >
      Your browser does not support the <code>audio</code> element.
    </audio>

    <!-- Left slideout for list of counters -->
    <USlideover v-model="showList" :overlay="true" :side="'left'" class="overflow-auto">
      <UCard
        class="flex flex-col flex-1"
        :ui="{
          body: { base: 'flex-1' },
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
            >
              Past Tallies
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="showList = false"
            />
          </div>
        </template>

        <p class="text-xl flex items-center">
          Current budget: ${{ budget }}
          <UButton
            @click="(showEditBudget = true), (showList = false)"
            color="white"
            :padded="false"
            icon="i-heroicons-cog-6-tooth-solid"
            class="ml-2"
            size="xl"
          />
        </p>
        <hr class="my-2" />
        <!-- Past tallies list -->
        <ol>
          <li
            v-if="userArray[0]"
            v-for="(item, index) in userArray"
            :key="item.id"
            class="text-lg my-4 flex justify-around w-full border-gray-800 border-solid border-2 py-1 rounded-lg hover:bg-gray-700"
          >
            <div class="flex flex-col w-full">
              <div class="flex flex-row justify-between mx-8 text-xl">
                <p>
                  <strong>${{ item.count }}</strong>
                </p>
                <em class="text-neutral-500">{{
                  item.date ? item.date : "No date"
                }}</em>
                <UButton
                  @click="deleteItem(index)"
                  icon="i-heroicons-x-circle-solid"
                >
                </UButton>
              </div>
              <div class="flex flex-row mx-8 my-2">
                <UProgress :value="item.usedBudget" />
              </div>
              <em class="text-neutral-500 text-sm text-center"
                >budget: ${{ item.budget ? item.budget : "No budget" }}</em
              >
            </div>
          </li>
          <li
            v-else
            class="text-lg my-4 flex justify-around w-full border-gray-800 border-solid border-2 py-1 rounded-lg hover:bg-gray-700"
          >
            No past tallies
          </li>
        </ol>
        <hr class="my-2" />
        <p class="text-xl">TOTAL: {{ totalDisplay }}</p>
      </UCard>
    </USlideover>

    <!-- clicker -->
    <UButton
      @click="increment"
      class="mx-auto my-12 rounded-full h-28 w-28 justify-center text-3xl"
      >+{{ incrementBy }}</UButton
    >

    <!-- Total Tracker -->
    <UDivider label="TOTAL" />
    <div class="my-4">
      <p class="text-center text-3xl">${{ count }}</p>
      <p v-if="showTaxEstimate" class="text-center text-gray-400">
        After tax: ${{ taxEstimate + count }}
      </p>
    </div>

    <!-- Controls -->
    <UDivider label="CONTROLS" />

    <!-- ROW 1 -->
    <div class="grid grid-cols-3 gap-8 mx-10 my-4">
      <!-- show tallies list -->
      <UButton
        @click="showList = true"
        class="justify-center"
        icon="i-heroicons-banknotes-solid"
      ></UButton>
      <!-- submit count -->
      <UButton
        label="Submit"
        class="justify-center"
        @click="updateUserArray('add')"
      />
      <!-- reset count -->
      <UButton
        @click="showAlert = true"
        class="justify-center"
        icon="i-heroicons-arrow-path-solid"
      ></UButton>

      <!-- ROW 2 -->
      <!-- Show Explanation button -->
      <UButton
        @click="showExplanation = !showExplanation"
        class="justify-center"
        icon="i-heroicons-information-circle-solid"
      />
      <!-- Decrement button -->
      <UButton @click="decrement" class="justify-center"
        >-{{ incrementBy }}</UButton
      >
      <!-- Settings button -->
      <UButton
        @click="showSettings = true"
        icon="i-heroicons-cog-6-tooth-solid"
        class="justify-center"
      />
    </div>

    <!-- Reset alert -->
    <UAlert
      v-if="showAlert"
      :actions="[
        { variant: 'solid', label: 'Cancel', click: hideAlert },
        {
          variant: 'outline',
          color: 'primary',
          label: 'Reset',
          click: resetCounter,
        },
      ]"
      title="Confirm Reset"
      class="my-4"
    />

    <!-- EXPLANATION -->
    <div v-if="showExplanation">
      <UDivider label="EXPLANATION" />
      <p>
        <strong
          >Easily keep track of your spending and budget while grocery
          shopping.</strong
        >
      </p>
      <br />
      <p class="text-sm">
        While shopping, track the cost of every item you place in your cart with
        this clicker tool.
      </p>
      <br />
      <p class="text-sm">
        Click <span class="text-primary-500">Submit</span> to keep track of all
        your grocery trips. Be sure to sign in
        <em
          >(secured with
          <ULink
            active="true"
            active-class="text-primary"
            to="https://oauth.net/2/"
            >0Auth</ULink
          >)</em
        >
        to save your submissions.
      </p>
      <br />
      <p
        class="text-sm grid grid-cols-2 gap-x-4 border-gray-700 border-2 rounded-lg p-2"
      >
        View past submissions
        <UIcon class="text-primary-400" name="i-heroicons-banknotes-solid" />
        Reset the counter
        <UIcon class="text-primary-400" name="i-heroicons-arrow-path-solid" />
        Decrease the counter
        <span class="text-primary-400">-{{ incrementBy }}</span>
        Adjust settings with
        <UIcon class="text-primary-400" name="i-heroicons-cog-6-tooth-solid" />
      </p>
    </div>
    <!-- BUDGET MODAL -->
    <UModal :ui="{ container: 'items-center' }" v-model="showEditBudget">
      <div class="p-4">
        <p class="text-2xl my-4">Current Budget: ${{ budget }}</p>
        <UDivider label="EDIT" />
        <URange v-model="budget" name="range" :max="500" />
        <UInput
          type="number"
          v-model="budget"
          class="my-4"
          :ui="{ base: 'text-center flex justify-center' }"
        >
        </UInput>
        <!-- </div> -->
        <UButton block label="Submit" @click="saveBudget(data.user.email)" />
      </div>
    </UModal>

    <!-- Settings MODAL -->
    <UModal :ui="{ container: 'items-center' }" v-model="showSettings">
      <UCard>
        <template #header>
          <div class="flex min-w-0 justify-between">
            <p class="text-2xl">Settings</p>
            <UButton
              @click="showSettings = false"
              variant="link"
              color="white"
              size="xl"
              icon="i-heroicons-x-mark-solid"
            />
          </div>
        </template>

        <div class="p-4">
          <!-- INCREMENT COUNT BY -->
          <div class="grid grid-cols-3 gap-4">
            <p class="col-span-2">Increment the count by:</p>
            <UInput
              type="number"
              v-model="incrementBy"
              v-on:blur="incrementBy = verifyNumber(incrementBy, false)"
            />
          </div>

          <!-- TAX RATE -->
          <div class="grid grid-cols-3 gap-4 my-2">
            <p class="col-span-2">Tax rate:</p>
            <UInput
              type="number"
              v-model="taxRate"
              v-on:blur="taxRate = verifyNumber(taxRate, true)"
            >
              <template #trailing
                ><span class="text-xs text-gray-500"
                  >%{{ taxRate * 100 }}</span
                ></template
              >
            </UInput>
          </div>

          <!-- SHOW TAX -->
          <div class="grid grid-cols-3 gap-4">
            <p class="col-span-2">Show tax estimate:</p>
            <UCheckbox v-model="showTaxEstimate" />
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<style>
li {
  list-style-type: none;
}
</style>
