<script setup lang="ts">
const isOpen = ref(false);

const links = [
  {
    label: "Home",
    icon: "i-heroicons-home-modern-solid",
    to: "/",
    id:"home"
  },
  {
    label: "Grocery",
    icon: "i-heroicons-shopping-bag-solid",
    to: "/grocery",
    id:"home"
  },
];
</script>

<template>
  <UContainer>
    <!-- main -->
    <UCard class="mt-4">
      <template #header>
        <div class="flex min-w-0 w-full justify-between">
          <!-- Slider nav -->
          <h1 class="text-lg">Expense Tracker</h1>
          <UButton
            label="Nav"
            @click="isOpen = true"
            icon="i-heroicons-magnifying-glass"
          />
        </div>
        <USlideover v-model="isOpen" :overlay="true">
          <UCard
            class="flex flex-col flex-1"
            :ui="{
              body: { base: 'flex-1' },
              ring: '',
              divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                >
                  Navigation
                </h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="isOpen = false"
                />
              </div>
            </template>

            <UVerticalNavigation :links="links" @click="isOpen = false"/>
          </UCard>
        </USlideover>
      </template>

      <NuxtPage />

      <template #footer>
        <Placeholder class="h-8" />
      </template>
    </UCard>
  </UContainer>
</template>
