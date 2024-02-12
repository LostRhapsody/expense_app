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
    <BudgieTitle />
    <p>Use the <UIcon name="i-heroicons-magnifying-glass" /> to navigate, or see the categories down below.</p>  
    <GroupLinks :links="pageCategories" label="Category" />    
  </div>
</template>
