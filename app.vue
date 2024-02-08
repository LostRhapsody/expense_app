<script setup lang="ts">
const { status, data, signIn, signOut } = useAuth();

const loggedIn = computed(() => status.value === "authenticated");

const userAvatar = ref("");
let userEmail = "";

// For notifications
const toast = useToast();

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

if (loggedIn.value) {
  if(process.client)
    toast.add({
      title: "Hey, " + data.value?.user.name + "! Ready to start saving?",
    });
  if (data !== null && data !== undefined) {
    if (data.value !== null && data.value !== undefined) {
      if (typeof data.value.user === "object") {
        if (typeof data.value.user.image === "string") {
          userAvatar.value = data.value.user?.image;
        }
        if (typeof data.value.user.email === "string") {
          userEmail = data.value.user?.email;
        }
      }
    }
  }

  // check if the UUID is set in the cache
  const { data: uuid } = useNuxtData("uuid");

  // if no, we'll get it from the server from /UUID
  if (uuid.value === null) {
    await useFetch("/api/auth/UUID", {
      method: "post",
      body: {
        key: "key",
        value: userEmail,
      },
      // this key ensures we store it in the cache
      key: "uuid",
    });
  }
}
</script>

<template>
  <UContainer class="max-w-xl">
    <!-- main -->
    <UCard class="mt-4">
      <template #header>
        <div class="flex min-w-0 w-full justify-between items-center">
          <!-- Slider nav -->
          <ULink class="text-xl" to="/">Ratio</ULink>
          <UButton
            v-if="loggedIn && userAvatar !== null && userAvatar !== ''"
            @click="handleSignOut"
            ><UAvatar :src="userAvatar" />Sign out</UButton
          >
          <UButton v-else-if="loggedIn" @click="handleSignOut"
            ><UAvatar icon="i-heroicons-user-circle-solid" />Sign out</UButton
          >
          <UButton v-else label="Sign In" @click="handleSignIn"
            ><UAvatar icon="i-heroicons-user-circle-solid" />Sign in</UButton
          >
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
          </ClientOnly>
        </div>
        <div class="flex flex-row justify-between min-w-0 items-center">
          <h2>
            <ULink class="text-primary-400" to="mailto:evan.robertson77@gmail.com">Contact me.</ULink>
          </h2>
        </div>
      </template>
      <UNotifications />
    </UCard>
  </UContainer>
</template>
