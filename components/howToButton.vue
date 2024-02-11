<script setup>
// this component doesn't really work, I can't pass the showExplanation
// prop to the parent. Sadge. So, it's just a reference.
const showExplanation = ref(false);
</script>

<template>
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
</template>
