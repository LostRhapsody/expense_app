<script setup lang="ts">

const { status, data, signIn, signOut   } = useAuth()

const loggedIn = computed(() => status.value === 'authenticated')

// status.value // Session status: `unauthenticated`, `loading`, `authenticated`
// data.value // Session data, e.g., expiration, user.email, ...
// await signIn() // Sign in the user
// await refresh() // Refresh the token 
// await signOut() // Sign out the user

async function handleSignIn() {
  await signIn()
}

async function handleSignOut() {
  await signOut()
}

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
        <!-- <pre>{{ data?.user.email }}</pre> -->
        <h2>Made with 💖</h2>
      </template>
    </UCard>
  </UContainer>
</template>
