<script setup lang="ts">

const count = ref(0);
const showAlert = ref(false);
const onPlaying = ref(false);
const showList = ref(false);
const userArray = ref([]);
const total = ref(0);
const showExplanation = ref(false);

// Grab the date
const date = new Date()
const day = date.getDate()
const month = date.getMonth() + 1
const year = date.getFullYear()
const currentDate = `${day}-${month}-${year}`

const { status, data, signIn, signOut } = useAuth();

const loggedIn = computed(() => status.value === "authenticated");

/**
 * Stores the current counter in a key-value pair
 * @param key the key used to store this value
 */
async function storeCounter(key: string) {
  console.log(userArray.value)
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
 */
function updateTotal() {
  total.value = 0;
  userArray.value.forEach((element) => {
    total.value += element.count;
  });
}

/**
 * Get's the key-value pair containing the
 * array of the user's expenses, updates total
 */
async function getUserRecords(key: string) {
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
      date: currentDate
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

  if(audio.paused){
    audio.play()
    count.value++;
    return
  }
  if(audio2.paused){
    audio2.play()
    count.value++;
    return
  }
  if(audio3.paused){
    audio3.play()
    count.value++;
    return
  }

}

/**
 * Hides the 'confirm reset' alert
 */
function hideAlert() {
  showAlert.value = false;
}

/**
 * Resets the counter to 0 and hides the alert
 */
function resetCounter() {
  hideAlert();
  count.value = 0;
}

/**
 * Initialize
 */
if (loggedIn.value) {
  getUserRecords(data.value?.user.email);
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
    <USlideover v-model="showList" :overlay="true" :side="'left'">
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

        <!-- Past tallies list -->
        <ol>
          <li
            v-for="(item, index) in userArray"
            :key="item.id"
            class="text-lg my-4 flex justify-around w-full border-gray-800 border-solid border-2 py-1 rounded-lg hover:bg-gray-700"
          >
            ${{ item.count }}
            <em class="text-neutral-500">{{ item.date ? item.date : 'No date'}}</em>
            <UButton
              @click="deleteItem(index)"
              icon="i-heroicons-x-circle-solid"
            >
            </UButton>
          </li>
        </ol>
        <p class="text-xl">TOTAL: ${{ total }}</p>
      </UCard>
    </USlideover>

    <!-- clicker -->
    <UButton
      @click="increment"
      class="mx-auto my-12 rounded-full h-28 w-28 justify-center text-3xl"
      >+1</UButton
    >

    <!-- Total Tracker -->
    <UDivider label="TOTAL" />
    <p class="text-center text-3xl my-4">${{ count }}</p>

    <!-- Controls -->
    <UDivider label="CONTROLS" />
    <div class="my-4 text-center justify-around flex">
      <!-- Display list button -->
      <UButton
        @click="showList = true"
        icon="i-heroicons-banknotes-solid"
      ></UButton>

      <!-- Submit count button -->
      <UButton label="Submit" @click="updateUserArray('add')" />

      <!-- Reset button -->
      <UButton
        @click="showAlert = true"
        icon="i-heroicons-arrow-path-solid"
      ></UButton>

      <!-- Show Explanation button -->
      <UButton
        @click="showExplanation = !showExplanation"
        icon="i-heroicons-information-circle-solid"
      ></UButton>
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
        Click submit to keep track of all your grocery trips. Be sure to sign in
        <em>(secured with 0Auth)</em> to save your submissions. View past
        submissions with <UIcon name="i-heroicons-banknotes-solid" />.
      </p>
    </div>
  </div>
</template>

<style>
li {
  list-style-type: none;
}
</style>
