<script setup lang="ts">
const count = ref(0);
const showAlert = ref(false);
const onPlaying = ref(false);

function increment() {
  const audio = document.getElementById("clicker");

  if (audio === null) return;
  if (!audio.paused) return;

  count.value++;

  audio.play();
}
function hideAlert() {
  showAlert.value = false;
}
function resetCounter() {
  hideAlert();
  count.value = 0;
}
</script>

<template>
  <div class="flex flex-col mx-auto justify-center">
    <audio
      pause
      id="clicker"
      src="/click_short.mp3"
      ref="audioPlayer"
      @timeupdate="onPlaying"
    >
      Your browser does not support the <code>audio</code> element.
    </audio>
    <UButton
      @click="increment"
      class="mx-auto my-12 rounded-full h-28 w-28 justify-center text-3xl"
      >+1</UButton
    >
    <UDivider label="TOTAL" />
    <p class="text-center text-3xl my-4">${{ count }}</p>
    <UDivider label="RESET COUNTER" />
    <div class="my-4 text-center">
      <UButton
        @click="showAlert = true"
        icon="i-heroicons-arrow-path-solid"
      ></UButton>
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
  </div>
</template>
