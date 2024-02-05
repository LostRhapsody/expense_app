<script setup lang="ts">
const { status, data, signIn, signOut } = useAuth();

const loggedIn = computed(() => status.value === "authenticated");

async function handleSignIn() {
  await signIn();
}

async function handleSignOut() {
  await signOut();
}

const isOpen = ref(false);

const links = [
  {
    label: "Home",
    icon: "i-heroicons-home-modern-solid",
    to: "/",
    id: "home",
  },
  {
    label: "Grocery - The Clicker",
    icon: "i-heroicons-shopping-bag-solid",
    to: "/grocery/clicker",
    id: "Grocery",
  },
  {
    label: "Grocery - The Converter",
    icon: "i-heroicons-shopping-bag-solid",
    to: "/grocery/converter",
    id: "Grocery",
  },
];

const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});
</script>

<template>
  <UContainer class="max-w-xl">
    <!-- main -->
    <UCard class="mt-4">
      <template #header>
        <div class="flex min-w-0 w-full justify-between">
          <!-- Slider nav -->
          <ULink class="text-xl" to="/">Ratio</ULink>
          <UButton
            v-if="loggedIn"
            label="Sign Out"
            @click="handleSignOut"
            icon="i-heroicons-user-circle-solid"
          />
          <UButton
            v-else
            label="Sign In"
            @click="handleSignIn"
            icon="i-heroicons-user-circle-solid"
          />
          <UButton @click="isOpen = true" icon="i-heroicons-magnifying-glass" />
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

            <UVerticalNavigation :links="links" @click="isOpen = false" />
          </UCard>
        </USlideover>
      </template>

      <NuxtPage />

      <template #footer>
        <div class="flex flex-row justify-between min-w-0 items-center">
          <h2 class="text-center"><em>Made with 💖 for Sarah-Jayne</em></h2>
          <ClientOnly>
            <UButton
              id="darkModeButton"
              :icon="
                isDark
                  ? 'i-heroicons-moon-20-solid'
                  : 'i-heroicons-sun-20-solid'
              "
              color="gray"
              variant="ghost"
              aria-label="Theme"
              @click="isDark = !isDark"
            />
            <template #fallback>
              <div class="w-8 h-8" />
            </template>
          </ClientOnly>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
