<script setup lang="ts">
const showAddFaveModal = ref(false);

const faveoriteLinks = ref([
  [
    {
      label: "Clicker",
      toggled: false,
      url: "/grocery/clicker",
      icon: "i-heroicons-shopping-bag-solid",
    },
    {
      label: "Converter",
      toggled: false,
      url: "/grocery/converter",
      icon: "i-heroicons-arrows-up-down-solid",
    },
    {
      label: "Envelopes",
      toggled: false,
      url: "/budgeting/envelopes",
      icon: "i-heroicons-envelope-solid",
    },
    {
      label: "IOUs",
      toggled: false,
      url: "/budgeting/iou",
      icon: "i-heroicons-user-solid",
    },
  ],
]);

const showFavoritesList = computed(() => {
  return faveoriteLinks.value[0].find((e) => e.toggled);
});

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
    <BreadcrumbHTML
      class="bg-primary-100/50 dark:bg-gray-700/50 rounded-full p-1"
      ><UBreadcrumb :ui="{ li: 'text-black' }" :links="breadCrumbs"
    /></BreadcrumbHTML>
    <BudgieTitle />
    <p>
      Use the <UIcon name="i-heroicons-magnifying-glass" /> to navigate, or see
      the categories down below.
    </p>
    <GroupLinks :links="pageCategories" label="Categories" />
    <UDivider label="Favorites" class="my-4" />
    <div class="m-2 p-1"> 

      <UButton
      label="Add Favorite"
      icon="i-heroicons-star"
      @click="showAddFaveModal = true"
      class="w-full"
      />
    </div>
    <div v-if="showFavoritesList" class="block">
      <div v-for="link in faveoriteLinks[0]">
        <div v-if="link.toggled" class="m-2 p-1">
          <UButton
            :icon="link.icon"
            :label="link.label"
            :to="link.url"
            class="w-full"
            variant="link"
          />
        </div>
      </div>
    </div>
    <div v-else>
      <p class="mb-4">No pages added to favorites.</p>
    </div>
  </div>
  <UModal :ui="{ container: 'items-center' }" v-model="showAddFaveModal">
    <UCard>
      <template #header>
        <div class="flex min-w-0 justify-between">
          <p class="text-2xl">Add to favorites</p>
          <UButton
            @click="showAddFaveModal = false"
            variant="link"
            color="white"
            size="xl"
            icon="i-heroicons-x-mark-solid"
            class="text-gray-600 hover:text-gray-900"
          />
        </div>
      </template>
      <p>Toggle the pages below for quick access to them on the homepage.</p>
      <div v-for="link in faveoriteLinks[0]">
        <p
          class="m-2 p-1 ring-1 ring-gray-300 rounded flex items-center justify-between"
        >
          {{ link.label }}
          <UToggle v-model="link.toggled" />
        </p>
      </div>
    </UCard>
  </UModal>
</template>
