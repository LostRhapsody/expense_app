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
    <UDivider label="All grocery tools" class="my-8" />
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
