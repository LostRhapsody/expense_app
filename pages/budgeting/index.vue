<script setup lang="ts">
const route = useRoute();

const links = [
  {
    label: "Envelopes",
    icon: "i-heroicons-envelope-solid",
    id: "Envelopes",
    desc: "Create digital envelopes to help categorize spending habits.",
    to: "/budgeting/envelopes",
  },
  {
    label: "IOUs",
    icon: "i-heroicons-user-solid",
    id: "IOUs",
    desc: "Track lending and borrowing.",
    to: "/budgeting/iou",
  },
];
const breadCrumbs = getBreadcrumbs([
  {
    name: "Budgeting",
    icon: "i-heroicons-currency-dollar-solid",
    url: "/budgeting",
  }
]);
</script>

<template>
  <BreadcrumbHTML><UBreadcrumb :links="breadCrumbs" /></BreadcrumbHTML>
  <div class="text-center">
    <BudgieTitle/>
    <p>Easy to use tools to help manage your budget🧾</p>
    <GroupLinks :links="links" label="All budgeting tools" />
  </div>
</template>
