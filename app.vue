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
  [
    {
      label: "Home",
      icon: "i-heroicons-home-modern-solid",
      to: "/",
      id: "home",
    },
  ],
  [
    {
      label: "Grocery",
      desc: "Tools to save you money while you shop.",
      to: "/grocery",
      isTitle: true,
    },
    {
      label: "Clicker",
      icon: "i-heroicons-shopping-bag-solid",
      to: "/grocery/clicker",
      id: "Clicker",
      desc: "Easily track your grocery limit while you shop",
    },
    {
      label: "Converter",
      icon: "i-heroicons-arrows-up-down-solid",
      to: "/grocery/converter",
      id: "Converter",
      desc: "Quickly convert common weights and prices",
    },
  ],
  [
    {
      label: "Budgeting",
      isTitle: true,
      to: "/budgeting",
      desc: "Balance your checkbook, create digital envelopes, and more budgeting tools.",
    },
    {
      label: "Envelopes",
      icon: "i-heroicons-envelope-solid",
      id: "Envelopes",
      desc: "Create digital envelopes to help categorize spending habits.",
      to: "/budgeting/envelopes",
    },
  ],
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
  if (process.client)
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
    <UCard class="my-4 cardBody">
      <template #header>
        <div class="flex min-w-0 w-full justify-between items-center">
          <!-- Slider nav -->
          <!-- button to display a user's avatar when logged in, will log you out -->
          <UButton v-if="loggedIn && userAvatar !== null && userAvatar !== ''" @click="handleSignOut" variant="none">
            <UAvatar class="ring-2 ring-primary" :src="userAvatar" />
          </UButton>

          <!-- button that displays normal user icon when logged in, will log you out -->
          <UButton variant="none" v-else-if="loggedIn" @click="handleSignOut">
            <UAvatar class="ring-2 ring-primary" icon="i-heroicons-user-circle-solid" />
          </UButton>

          <!-- button that displays normal user icon when logged out, will log you in -->
          <UButton variant="none" v-else @click="handleSignIn">
            <UAvatar class="ring-2 ring-gray-500" icon="i-heroicons-user-circle-solid" />
          </UButton>
          <UButton @click="isOpen = true" icon="i-heroicons-bars-3" />
        </div>
        <USlideover v-model="isOpen" :overlay="true">
          <UCard class="flex flex-col flex-1" :ui="{
            body: { base: 'flex-1' },
            ring: '',
            divide: 'divide-y divide-gray-100 dark:divide-gray-800',
          }">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                  Navigation
                </h3>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="my-1"
                  @click="isOpen = false" />
              </div>
            </template>

            <UVerticalNavigation :links="links" @click="isOpen = false" :ui="{
              active: 'before:bg-transparent dark:before:bg-transparent',
            }" class="custom-nav-links">
              <template #default="{ link }">
                <div v-if="link.isTitle"
                  class="text-center w-full my-4 ring-2 dark:ring-gray-800 ring-gray-200 rounded p-2">
                  <p class="text-xl dark:border-gray-800 ring-gray-200 border-b-2 mb-2 !hover:color-red">
                    {{ link.label }}
                  </p>
                  <em>{{ link.desc }}</em>
                </div>
                <div v-else class="flex flex-col">
                  <strong class="text-lg dark:text-white text-black">
                    <p>{{ link.label }}</p>
                  </strong>
                </div>
              </template>
            </UVerticalNavigation>
          </UCard>
        </USlideover>
      </template>

      <NuxtPage />

      <template #footer>
        <div class="flex flex-row justify-between min-w-0 items-center">
          <h2 class="text-center"><em>Made with 💖 for Sarah-Jayne</em></h2>
          <ClientOnly>
            <UButton id="darkModeButton" :icon="isDark
                ? 'i-heroicons-moon-20-solid'
                : 'i-heroicons-sun-20-solid'
              " color="gray" variant="ghost" aria-label="Theme" @click="isDark = !isDark" />
          </ClientOnly>
        </div>
        <div class="flex flex-row justify-between min-w-0 items-center">
          <h2>
            <ULink class="dark:text-primary-400 text-primary-600" to="mailto:evan.robertson77@gmail.com">Contact</ULink>
          </h2>
        </div>
      </template>
      <UNotifications />
    </UCard>
  </UContainer>
</template>

<style>
.custom-nav-links a::before {
  background-color: transparent !important;
}

.dark body {
  background: rgb(0, 0, 0);
  background: linear-gradient(131deg,
      rgba(0, 0, 0, 1) 48%,
      rgba(72, 211, 128, 1) 100%);
}

body {
  min-height: 100vh;
  background: rgb(160, 212, 181);
  background: linear-gradient(131deg,
      rgb(212, 212, 212) 26%,
      rgb(34, 197, 94) 100%);
}

.dark .cardBody {
  background: rgba(70, 70, 70, 0.3) !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(104, 104, 104, 0.5) !important;
}

.cardBody {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
</style>
