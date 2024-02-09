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
    <h1 class="text-lg ring-2 dark:ring-gray-800 ring-gray-200 rounded p-2 mb-4"><strong class="text-4xl">Ratio 💵</strong><br/>Simple budgeting tools.</h1>
    <!-- <div v-if="link.isTitle" class="text-center w-full my-4 ring-2 dark:ring-gray-800 ring-gray-200 rounded p-2">
                  <p class="text-xl dark:border-gray-800 ring-gray-200 border-b-2 mb-2">{{ link.label }}</p>
                  <em>{{ link.desc }}</em>
                </div> -->
    <p>Use the <UIcon name="i-heroicons-magnifying-glass" /> to navigate, or see the categories down below.</p>  
    <UDivider label="Categories" class="my-4" />
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
