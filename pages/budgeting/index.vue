<script setup lang="ts">
const route = useRoute();

const links = [
  {
    label: "Envelopes",
    icon: "i-heroicons-envelope-solid",
    id: "Envelopes",
    content: "Create digital envelopes to help categorize spending habits.",
    to: "/budgeting/envelopes",
  },
  {
    label: "IOUs",
    icon: "i-heroicons-user-solid",
    id: "IOUs",
    content: "Track lending and borrowing.",
    to: "/budgeting/iou",
  },
  {
    label: "Saving Goals",
    icon: "i-heroicons-trophy-solid",
    id: "goals",
    content: "Track your short and longterm savings goals.",
    to: "/budgeting/goals",
  },
  {
    label: "Checkbook",
    icon: "i-heroicons-rectangle-stack-solid",
    id: "checkbook",
    content: "Record expenses and income",
    to: "/budgeting/checkbook",
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
  <BreadcrumbHTML
  class="bg-primary-100/50 dark:bg-gray-800/50 rounded-full p-1">
  <UBreadcrumb 
  :ui="{ li: 'text-black' }"
  :links="breadCrumbs" /></BreadcrumbHTML>
  <div class="text-center">
    <BudgieTitle/>
    <GroupLinks :links="links" />
  </div>
</template>
