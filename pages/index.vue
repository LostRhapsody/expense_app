<script setup lang="ts">
const route = useRoute()

const pageCategories = [
  {
    label: "Grocery",
    desc: "Tools to save you money while you shop.",
    to: "/grocery",
    isTitle: true,
  },
  {
    label: "Budgeting",
    isTitle: true,
    to: "/budgeting",
    desc: "Balance your checkbook, create digital envelopes, and more budgeting tools.",
  },
];
</script>

<template>
  <div class="text-center">
    <h1 class="text-lg"><strong class="text-4xl">Ratio 💵</strong><br/>Simple budgeting tools.</h1>
    <p>Use the <UIcon name="i-heroicons-magnifying-glass" /> to navigate.</p>  
    <UDivider label="Categories" class="my-8" />
    <UVerticalNavigation
      :links="pageCategories"
    >
      <template #default="{ link }">
        <div class="flex flex-col text-start">
          <strong
            ><p class="z-100">{{ link.label }}</p></strong
          >
          <em
            ><p v-if="link.desc !== ''">{{ link.desc }}</p></em
          >
        </div>
      </template>
    </UVerticalNavigation>
  </div>
</template>
