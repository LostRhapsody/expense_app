<script setup>
defineProps({
  links:Array,
  label:String,
});
</script>

<template>
  <UDivider :label="label" class="mt-8" />
  <UVerticalNavigation :links="links">
    <template #default="{ link }">
      <div class="flex flex-col text-start">
        <p>
          <strong class="text-lg dark:text-white text-black">{{
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
