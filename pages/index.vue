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
// just home, lol
const breadCrumbs = getBreadcrumbs([]);
</script>

<template>
  <div class="text-center">
    <BreadcrumbHTML><UBreadcrumb :links="breadCrumbs" /></BreadcrumbHTML>
    <RatioTitle/>
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
