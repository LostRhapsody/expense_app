<script setup>
defineProps({
  links:Array,
  label:String,
});
</script>

<template>
  <UDivider :label="label" class="mt-8" />
  <UVerticalNavigation :links="links" class="custom-nav-links">
    <template #default="{ link }" >
      <div class="flex flex-col text-start">
        <p>
          <strong class="text-lg dark:text-white text-black underline underline-offset-2 decoration-2 decoration-gray-400">{{
            link.label
          }}</strong>
        </p>
        <em
          ><p v-if="link.desc !== ''">{{ link.desc }}</p></em
        >
      </div>
    </template>
  </UVerticalNavigation>
</template>

<style>
.custom-nav-links a::before {
  background-color: transparent !important;
}
</style>