<script setup lang="ts">
////// User Variables and Constants //////////////////////
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");
const userAvatar = ref("");
let userEmail = "";
let userName = "";

////// Authentication Functions //////////////////////
async function handleSignIn() {
  await signIn();
}

async function handleSignOut() {
  await signOut();
}

////// Toast Functions //////////////////////
const toast = useToast();

////// Display Control Variables //////////////////////
const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});
const isNavOpen = ref(false);
const isPrefrencesOpen = ref(false);
const isThemeModalOpen = ref(false);

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

////// Themes //////////////////////
interface themeType {
  id: number;
  label: string;
  path: string;
}

const themes: themeType[] = [
  { id: 1, label: "Default", path: "" },
  { id: 2, label: "Glassy", path: "glassy_gradient.css" },
  { id: 3, label: "Warm-Hot", path: "warm_hot.css" },
];
const themeSelected = ref();

// INIT logged in logic
if (loggedIn.value) {
  // pull the user's email and avatar
  if (data !== null && data !== undefined) {
    if (data.value !== null && data.value !== undefined) {
      if (typeof data.value.user === "object") {
        if (typeof data.value.user.image === "string") {
          userAvatar.value = data.value.user?.image;
        }
        if (typeof data.value.user.email === "string") {
          userEmail = data.value.user?.email;
        }
        if (typeof data.value.user.name === "string") {
          // user name just grabs the first name.
          userName = data.value.user?.name.substring(
            0,
            data.value.user?.name.indexOf(" ")
          );
        }
      }
    }
  }

  // Client ONLY processes (don't run on server)
  if (process.client) {
    // say hi!
    toast.add({
      title: "Hey, " + userName + "! Ready to start saving?",
    });

    let currentUUID = localStorage.getItem("uuid");

    // check if the UUID is in local storage
    if (currentUUID === null) {
      // if no, we'll get it from the server from /UUID
      await postUUID(userEmail);
    } else {
      // attempt to set the theme.
      // this handles getting the theme from cache/db/retrying
      setClientTheme();
    }
  }
}

/**
 * Posts an email to the backend, stores UUID in cache to verify requests
 * @param email user's email for UUID
 */
async function postUUID(email: string) {
  await useFetch("/api/auth/UUID", {
    method: "post",
    body: {
      value: email,
    },
    // this key ensures we store it in the cache
    key: "uuid",
    onResponse({ response }) {
      localStorage.setItem("uuid", response._data);
      postUUIDCallback();
    },
  });
}

/**
 * Callback function for postUUID, any logic that requires a UUID to be in
 * local storage runs here
 */
async function postUUIDCallback() {
  const currentUUID = localStorage.getItem("uuid");

  if (
    currentUUID === null ||
    currentUUID === undefined ||
    currentUUID === "guest"
  ) {
    alert("The client token failed to get set correctly.");
    return;
  }

  // we can now set our theme, since the UUID is set
  setClientTheme();
}

/**
 * This logic runs AFTER the UUID has been set in the cache
 * if theme is not in cache, requests it from the db
 * if theme is in cache, we set the theme on the client
 */
async function setClientTheme() {
  const theme = localStorage.getItem("budgie_theme");
  const currentUUID = localStorage.getItem("uuid");

  // if not in cache, pull the server from /getTheme
  if (theme === null && currentUUID !== null) {
    await getTheme(currentUUID);
  } else if (currentUUID === null) {
    alert("Setting client token failed! Alert evan.robertson77@gmail.com");
  } else {
    // if theme is Default, don't set a link tag
    if (theme !== "Default") {
      useHead({
        link: [
          {
            rel: "stylesheet",
            href: "/themes/" + theme,
            id: "themeStylesheet",
          },
        ],
      });
    } else {
      // just remove it lol
      let themeTag = document.getElementById("themeStylesheet");
      if (themeTag !== null && themeTag !== undefined) {
        // clear the tag
        themeTag.href = "";
      }
    }
  }
}

/**
 * get's the user's theme preferences from the db
 * @param key key to get record
 */
async function getTheme(key: string) {
  await useFetch("/api/user/getTheme", {
    method: "post",
    body: {
      key: key + "Theme",
    },
    key: "theme",
    onResponse({ response }) {
      localStorage.setItem("budgie_theme", response._data);
      getThemeCallback();
    },
  });
}

/**
 * callback for getTheme
 * Now that the theme is set in local storage, we can apply it
 */

function getThemeCallback() {
  const theme = localStorage.getItem("budgie_theme");

  // if not in cache, pull the server from /getTheme
  if (theme === null) {
    alert("An error occurred retrieving you're theme preference");
    return;
  } else {
    setClientTheme();
  }
}

/**
 * set's the user's theme preference in the db and calls setClientTheme
 * @param theme theme we're setting
 */
async function setTheme(theme: string) {
  const key = localStorage.getItem("uuid");

  localStorage.setItem("budgie_theme", theme);

  if (key === null) {
    alert("Getting client token failed! Alert evan.robertson77@gmail.com");
    return;
  }

  await useFetch("/api/user/setTheme", {
    method: "post",
    body: {
      key: key + "Theme",
      value: theme,
    },
    onResponse({ response }) {
      setClientTheme();
    },
  });
}

/**
 * Opens the theme modal
 */
function openThemeModal() {
  isThemeModalOpen.value = true;
  isPrefrencesOpen.value = false;
}

function onThemeSelect(option: themeType) {  
  // leave if this was not a real selection
  if (option === null || option === undefined) {
    return;
  }

  // if chosen theme is already set, do nothing
  const currentTheme = localStorage.getItem("budgie_theme");
  if (currentTheme === option.label || currentTheme === option.path) {
    isThemeModalOpen.value = false;
    return;
  }

  if (option.path !== null && option.path !== undefined && option.path !== "") {
    setTheme(option.path);
    isThemeModalOpen.value = false;
    return;
  } else if (option.label === "Default") {
    // if Default, we pass the label instead to tell the page to refresh
    setTheme(option.label);
    isThemeModalOpen.value = false;
    return;
  }

  // if no returns are hit we did something wrong
  alert(
    "Error setting theme! Object is probably malformed. Please report to evan.robertson77@gmail.com"
  );
}

// These events happen AFTER app is mounted (DOM is loaded)
onMounted(async () => {
  await nextTick();

  /**
  * keybind listeners
  * Not currently used... this is a mobile app after all
  * Keeping it for reference as a possible use
  */
  // window.addEventListener(
  //   "keydown", 
  //   (event) => {     
  //     /**
  //      * On "T" keydown... 
  //      * */ 
  //     if (event.code === "KeyT") {        
  //       openThemeModal();        
  //   }
  // });
});
</script>

<template>
  <UContainer class="max-w-xl">
    <!-- main -->
    <UCard class="my-4 cardBody">
      <template #header>
        <div class="flex min-w-0 w-full justify-between items-center">
          <!-- button to display a user's avatar when logged in, will log you out -->
          <UButton
            v-if="loggedIn && userAvatar !== null && userAvatar !== ''"
            @click="isPrefrencesOpen = true"
            variant="ghost"
          >
            <UAvatar class="ring-2 ring-primary" :src="userAvatar" />
          </UButton>

          <!-- button that displays normal user icon when logged in, will log you out -->
          <UButton
            variant="ghost"
            v-else-if="loggedIn"
            @click="isPrefrencesOpen = true"
          >
            <UAvatar
              class="ring-2 ring-primary"
              icon="i-heroicons-user-circle-solid"
            />
          </UButton>

          <!-- button that displays normal user icon when logged out, will log you in -->
          <UButton variant="ghost" v-else @click="isPrefrencesOpen = true">
            <UAvatar
              class="ring-2 ring-gray-500"
              icon="i-heroicons-user-circle-solid"
            />
          </UButton>
          <UButton @click="isNavOpen = true" icon="i-heroicons-bars-3" />
        </div>

        <!-- Slideover user preferences -->
        <USlideover v-model="isPrefrencesOpen" :overlay="true" side="left">
          <UCard
            class="flex flex-col flex-1 cardBody"
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
                  Preferences
                </h3>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="my-1"
                  @click="isPrefrencesOpen = false"
                />
              </div>
            </template>
            <div class="grid grid-cols-1 gap-4">
              <UButton
                v-if="loggedIn && userAvatar !== null && userAvatar !== ''"
                @click="handleSignOut"
                variant="ghost"
              >
                <UAvatar class="ring-2 ring-primary" :src="userAvatar" />Sign
                Out
              </UButton>

              <!-- button that displays normal user icon when logged in, will log you out -->
              <UButton
                variant="ghost"
                v-else-if="loggedIn"
                @click="handleSignOut"
              >
                <UAvatar
                  class="ring-2 ring-primary"
                  icon="i-heroicons-user-circle-solid"
                />Sign Out
              </UButton>

              <!-- button that displays normal user icon when logged out, will log you in -->
              <UButton variant="ghost" v-else @click="handleSignIn">
                <UAvatar
                  class="ring-2 ring-gray-500"
                  icon="i-heroicons-user-circle-solid"
                />Sign In
              </UButton>

              <UButton label="Select Theme" @click="openThemeModal" />
              <!-- <UButton variant="ghost" @click="setTheme('glassy_gradient.css')"
                >Set theme to "Glassy"</UButton
              >
              <UButton variant="ghost" @click="setTheme('Default')"
                >Set theme to "Default"</UButton
              > -->
            </div>
          </UCard>
        </USlideover>

        <!-- Slideover navigation -->
        <USlideover v-model="isNavOpen" :overlay="true">
          <UCard
            class="flex flex-col flex-1 cardBody"
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
                  class="my-1"
                  @click="isNavOpen = false"
                />
              </div>
            </template>

            <UVerticalNavigation
              :links="links"
              @click="isNavOpen = false"
              :ui="{
                active: 'before:bg-transparent dark:before:bg-transparent',
              }"
              class="custom-nav-links"
            >
              <template #Default="{ link }">
                <div
                  v-if="link.isTitle"
                  class="text-center w-full my-4 ring-2 dark:ring-gray-800 ring-gray-200 rounded p-2"
                >
                  <p
                    class="text-xl dark:border-gray-800 ring-gray-200 border-b-2 mb-2 !hover:color-red"
                  >
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
            <ULink
              class="dark:text-primary-400 text-primary-600"
              to="mailto:evan.robertson77@gmail.com"
              >Contact</ULink
            >
          </h2>
        </div>
      </template>
      <UNotifications />
    </UCard>
    <UModal :ui="{ container: 'items-center' }" v-model="isThemeModalOpen">
      <UCommandPalette
        v-model="themeSelected"
        nullable
        :autoselect="false"
        :groups="[{ key: 'themes', commands: themes }]"
        @update:model-value="onThemeSelect"    
        ref="themePalett"    
      />
    </UModal>
  </UContainer>
</template>

<style>
.custom-nav-links a::before {
  background-color: transparent !important;
}
</style>
