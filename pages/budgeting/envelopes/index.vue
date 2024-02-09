<script setup lang="ts">
const route = useRoute();

const links = getBreadcrumbs([
  { name: "Budgeting", icon: "i-heroicons-currency-dollar-solid", url: "/budgeting" },
  {
    name: "Envelopes",
    icon: "i-heroicons-envelope-solid",
    url: "/budgeting/envelopes",
  },
]);
</script>

<template>
  <BreadcrumbHTML><UBreadcrumb :links="links" /></BreadcrumbHTML>
  <div class="text-center">
    <h1 class="text-lg">
      <strong class="text-4xl">WIP</strong><br />Envelopes are a work in
      progress. Check back later!
    </h1>    
    <br />
    <ULink class="dark:text-primary-400 text-primary-500" to="/">Return Home</ULink>
  </div>
</template>
