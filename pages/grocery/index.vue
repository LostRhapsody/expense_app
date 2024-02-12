<script setup lang="ts">
const route = useRoute();

const links = [
  {
    label: "Clicker",
    icon: "i-heroicons-shopping-bag-solid",
    to: "/grocery/clicker",
    id: "Clicker",
    desc: "Easily track your grocery limit while you shop",
  },
  {
    label: "Converter",
    icon: "i-heroicons-shopping-bag-solid",
    to: "/grocery/converter",
    id: "Converter",
    desc: "Quickly convert common weights and prices",
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
  <BreadcrumbHTML><UBreadcrumb :links="breadCrumbs" /></BreadcrumbHTML>
  <div class="text-center">
    <BudgieTitle/>
    <p>Easy to use tools to help track spending while your shopping 🛒</p>
    <GroupLinks :links="links" label="All grocery tools" />    
  </div>
</template>
