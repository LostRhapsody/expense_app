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
];
const breadCrumbs = getBreadcrumbs([
  {
    name: "Budgeting",
    icon: "i-heroicons-currency-dollar-solid",
    url: "/budgeting",
  },
]);
</script>

<template>
  <BreadcrumbHTML><UBreadcrumb :links="breadCrumbs" /></BreadcrumbHTML>
  <div class="text-center">
    <h1 class="text-lg">
      <strong class="text-4xl">Ratio 💵</strong>
      <br />Balance a checkbook, create digital envelopes, and more simple
      budgeting tools 🧾
    </h1>
    <UDivider label="All budgeting tools" class="my-8" />
    <UVerticalNavigation :links="links">
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
