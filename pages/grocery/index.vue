<script setup lang="ts">
const route = useRoute();

const links = [
  {
    label: "Clicker",
    icon: "i-heroicons-shopping-bag-solid",
    to: "/grocery/clicker",
    id: "Clicker",
    content: "Easily track your grocery limit while you shop",
  },
  {
    label: "Converter",
    icon: "i-heroicons-arrows-up-down-solid",
    to: "/grocery/converter",
    id: "Converter",
    content: "Quickly convert common weights and prices",
  },
];
const breadCrumbs = getBreadcrumbs([
  {
    name: "Grocery",
    icon: "i-heroicons-shopping-bag-solid",
    url: "/grocery",
  },
]);
</script>

<template>
  <BreadcrumbHTML
  class="bg-primary-100/50 dark:bg-gray-800/50 rounded-full p-1"
><UBreadcrumb :ui="{ li: 'text-black' }" :links="breadCrumbs" /></BreadcrumbHTML>
  <div class="text-center">
    <BudgieTitle/>
    <GroupLinks :links="links" />    
  </div>
</template>
