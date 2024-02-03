<script setup lang="ts">
const count = ref(0);
const showAlert = ref(false);
const onPlaying = ref(false);
const showList = ref(false);
const userArray = ref([{}]);
const total = ref(0);
const showConfirmDelete = ref(false);

/**
 * Stores the current counter in a key-value pair
 * @param key the key used to store this value
 */
async function storeCounter(key: string) {
  await $fetch("/api/setItem/", {
    method: "post",
    body: {
      key: key,
      value: {
        list: userArray.value,
        id: 1,
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
  const data = await $fetch("/api/getItem/", {
    method: "post",
    body: { key: key },
  });
  userArray.value = data.list;
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
    });
    resetCounter();
  }
  storeCounter("user");
  updateTotal();
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
  const audio = document.getElementById("clicker");

  if (audio === null) return;
  if (!audio.paused) return;

  count.value++;

  audio.play();
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
getUserRecords("user");
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
            class="text-lg my-4 flex justify-around w-1/4"
          >
            ${{ item.count }}
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
      <UButton @click="updateUserArray('add')">Submit</UButton>

      <!-- Reset button -->
      <UButton
        @click="showAlert = true"
        icon="i-heroicons-arrow-path-solid"
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
  </div>
</template>

<style>
li {
  list-style-type: none;
}
</style>
