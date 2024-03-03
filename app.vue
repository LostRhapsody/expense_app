<script setup lang="ts">
////// User Variables and Constants //////////////////////
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");
const userAvatar = ref("");
const route = useRoute()
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
const isSettingsModalOpen = ref(false);
const isConfirmClearUserDataOpen = ref(false);
const currentSettingMenu = ref("display");

const navBarLinks = [
   {
      label: "Home",
      icon: "i-heroicons-home-modern-solid",
      to: "/",
      id: "home",
   },
   {
      label: "Grocery",
      icon: "i-heroicons-shopping-bag-solid",
      to: "/grocery",
      id: "home",
   },
   {
      label: "Budget",
      icon: "i-heroicons-currency-dollar-solid",
      to: "/budgeting",
      id: "home",
   },
   {
      label: "More",
      icon: "i-heroicons-ellipsis-horizontal",
      to: "/more",
      id: "more",
   },
];

// a computed property. Set the parent route of the current page to active
const isParentActive = computed(() => {

   // all our top level parent routes
   const parentRoutes = ["/grocery","/budgeting"];

   let match = false;
   let matchedRoute = "";

   // loop through parent routes, compare against current.
   // if current route starts with a parent route, it's active
   for (let index = 0; index < parentRoutes.length; index++) {

      const thisRoute = parentRoutes[index];

      // check if the routes match/starts with parent route
      match = route.matched.some((route) => route.path.startsWith(thisRoute));

      // if match return the route and true
      if(match) {
         matchedRoute = thisRoute;
         return [matchedRoute, match];
      }
   }
   // if nothing matches, return false
   return ["",false];
});


const links = [
   {
      label: "Home",
      icon: "i-heroicons-home-modern-solid",
      to: "/",
      id: "home",
      isTitle: false,
   },
   {
      label: "Grocery",
      content: "Tools to save you money while you shop.",
      to: "/grocery",
      isTitle: true,
   },
   {
      label: "Clicker",
      icon: "i-heroicons-shopping-bag-solid",
      to: "/grocery/clicker",
      id: "Clicker",
      content: "Easily track your grocery limit while you shop",
      isTitle: false,
   },
   {
      label: "Converter",
      icon: "i-heroicons-arrows-up-down-solid",
      to: "/grocery/converter",
      id: "Converter",
      content: "Quickly convert common weights and prices",
      isTitle: false,
   },
   {
      label: "List",
      icon: "i-heroicons-list-bullet",
      to: "/grocery/lists",
      id: "List",
      content: "Create and manage grocery lists",
      isTitle: false,
   },
   {
      label: "Budgeting",
      to: "/budgeting",
      content:
         "Balance your checkbook, create digital envelopes, and more budgeting tools.",
      isTitle: true,
   },
   {
      label: "Envelopes",
      icon: "i-heroicons-envelope-solid",
      id: "Envelopes",
      content: "Create digital envelopes to help categorize spending habits.",
      to: "/budgeting/envelopes",
      isTitle: false,
   },
   {
      label: "IOUs",
      icon: "i-heroicons-user-solid",
      id: "IOUs",
      content: "Track debts, credit, IOUs, etc.",
      to: "/budgeting/iou",
      isTitle: false,
   },
   {
      label: "Savings Goals",
      icon: "i-heroicons-trophy-solid",
      id: "Goals",
      content: "Track your long or shortterm savings goals.",
      to: "/budgeting/goals",
      isTitle: false,
   },
   {
      label: "Checkbook",
      icon: "i-heroicons-rectangle-stack-solid",
      id: "checkbook",
      content: "Record expenses and income",
      to: "/budgeting/checkbook",
      isTitle: false,
   },
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

useHead({
   link: [
      {
         rel: "icon",
         href: "/favicon.ico",
         sizes: "48x48",
      },
      {
         rel: "icon",
         href: "/favicon.svg",
         sizes: "any",
         type: "image/svg+xml",
      },
      {
         rel: "apple-touch-icon",
         href: "/apple-touch-icon-180x180.png",
      },
      {
         rel: "mask-icon",
         href: "/maskable-icon-512x512.png",
         color: "#FFFFFF",
      },
   ],
});

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
   } else {
      // if theme is Default, don't set a link tag
      if (theme !== "Default" && theme !== null) {
         // remove if it exists so we never have 2 elements with matching ID
         removeThemeTag();

         // create a new link tag for the theme
         const themeTag = document.createElement("link");
         themeTag.href = "/themes/" + theme;
         themeTag.id = "themeStylesheet";
         themeTag.rel = "stylesheet";
         document.head.appendChild(themeTag);
      } else {
         // just remove it to reset theme to default
         removeThemeTag();
      }
   }
}

/**
 * Removes the link tag containing the theme stylesheet
 */
function removeThemeTag() {
   // just remove it lol
   let themeTag = document.getElementById("themeStylesheet");
   if (themeTag !== null && themeTag !== undefined) {
      themeTag.remove();
   }
}

/**
 * get's the user's theme preferences from the db
 * @param key key to get record
 */
async function getTheme(key: string) {
   // if no UUID is set, just set theme to default
   if (key === null || key === undefined) {
      localStorage.setItem("budgie_theme", "Default");
      getThemeCallback();
   }
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

   // if key is null, we're offline/not logged in
   // so just set the theme on the client and dip
   if (key === null) {
      setClientTheme();
      return;
   }

   await $fetch("/api/user/setTheme", {
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

/**
 * Opens the settings modal, closes the preferences slideout
 */
function openSettingsModal() {
   isSettingsModalOpen.value = true;
   isPrefrencesOpen.value = false;
}

/**
 * determines which settings menu to display
 * @param menu the settings menu to show
 */
function toggleSettingsDisplay(menu: string) {
   currentSettingMenu.value = menu;
}

/**
 * Called when a theme is selected
 * @param option the theme passed in, optional
 */
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

   if (
      option.path !== null &&
      option.path !== undefined &&
      option.path !== ""
   ) {
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

/**
 * Clears the user's data
 */
async function clearUserData() {
   isConfirmClearUserDataOpen.value = false;
   const key = localStorage.getItem("uuid");

   await useFetch("/api/user/clearUserData", {
      method: "post",
      body: {
         key: key + "clearRecords",
         value: key,
      },
      onResponse({ response }) {
         isPrefrencesOpen.value = false;
         toast.add({
            title: response._data.message,
            callback: location.reload(),
         });
      },
   });
}

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
} else {
   if (process.client) {
      // bro we still gotta try lol
      setClientTheme();
   }
}

// These events happen AFTER app is mounted (DOM is loaded)
onMounted(async () => {
   await nextTick();
   /**
    * keybind listeners
    */
   window.addEventListener("keydown", (event) => {
      switch (event.code) {
         case "BracketRight":
            isNavOpen.value = true;
            break;
         default:
            break;
      }
   });
});
</script>

<template>
   <NuxtPwaManifest />
   <!-- main -->
   <UContainer class="max-w-xl mb-24">
      <!-- Nav bar and profile -->
      <div
         class="min-w-0 w-full grid grid-cols-3 items-center dark:bg-gray-800/50 bg-primary-100/50 rounded-full p-2 my-4"
      >
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

         <strong>
            <ULink to="/" class="justify-center flex text-lg text-primary"
               >Budgie
               <img
                  alt="An icon of a budgie, which is a kind of bird."
                  class="inline-block text-primary"
                  src="/edited_budgie.svg"
                  height="25"
                  width="25"
               />
            </ULink>
         </strong>

         <!--  Nav Button -->
         <div class="text-end">
            <UButton
               class="rounded-full w-min"
               @click="isNavOpen = true"
               icon="i-heroicons-bars-3"
            />
         </div>
      </div>

      <!-- Slideover user preferences -->
      <USlideover
         v-model="isPrefrencesOpen"
         :overlay="true"
         side="left"
         class="overflow-auto"
      >
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
               <div class="flex flex-row justify-between">
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

               <UButton
                  label="Settings"
                  icon="i-heroicons-cog-6-tooth-solid"
                  @click="openSettingsModal"
               />
               <UButton
                  label="Clear User Data"
                  color="red"
                  @click="isConfirmClearUserDataOpen = true"
               />
            </div>
         </UCard>
      </USlideover>

      <!-- Slideover navigation -->
      <USlideover v-model="isNavOpen" :overlay="true" class="overflow-auto">
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
            <!-- This is identical to groupLinks.vue -->
            <!-- I just can't close the nav using that component -->
            <!-- so keep them in sync! -->
            <UAccordion
               :items="links"
               :ui="{ wrapper: 'flex flex-col w-full' }"
            >
               <template #default="{ item, index, open }">
                  <div>
                     <!-- PAGES -->
                     <UButton
                        color="gray"
                        variant="ghost"
                        class="border rounded-full my-2 border-gray-200 dark:border-gray-800 w-full"
                        :class="item.isTitle ? 'hidden' : ''"
                        :ui="{
                           rounded: 'rounded-none',
                           padding: { sm: 'p-3' },
                        }"
                     >
                        <template #leading>
                           <ULink
                              :to="item.to"
                              @click="isNavOpen = false"
                              v-if="item.icon"
                           >
                              <div
                                 class="w-6 h-6 rounded-full bg-primary-500 dark:bg-primary-400 flex items-center justify-center -my-1"
                              >
                                 <UIcon
                                    :name="item.icon"
                                    class="w-4 h-4 text-white dark:text-gray-900"
                                 />
                              </div>
                           </ULink>
                        </template>

                        <ULink :to="item.to" @click="isNavOpen = false">
                           <span class="truncate">{{ item.label }}</span>
                        </ULink>

                        <template #trailing>
                           <UIcon
                              v-if="item.content"
                              name="i-heroicons-chevron-right-20-solid"
                              class="w-5 h-5 ms-auto transform transition-transform duration-200"
                              :class="[open && 'rotate-90']"
                           />
                        </template>
                     </UButton>
                     <!-- TITLES -->
                     <UButton
                        color="gray"
                        variant="ghost"
                        class="border-t my-4 border-gray-300 dark:border-gray-700 w-full text-xl"
                        :class="item.isTitle ? '' : 'hidden'"
                        :ui="{
                           rounded: 'rounded-none',
                           padding: { sm: 'p-3' },
                        }"
                     >
                        <ULink :to="item.to" @click="isNavOpen = false">
                           <span class="truncate">{{ item.label }}</span>
                        </ULink>

                        <template #trailing>
                           <UIcon
                              v-if="item.content"
                              name="i-heroicons-chevron-right-20-solid"
                              class="w-5 h-5 ms-auto transform transition-transform duration-200"
                              :class="[open && 'rotate-90']"
                           />
                        </template>
                     </UButton>
                  </div>
               </template>
            </UAccordion>
         </UCard>
      </USlideover>

      <!-- Current page -->
      <NuxtPage />
      
      <!-- Commented out till I find out where to put this -->
      <!-- <div class="fixed bottom-0">
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
                  >Contact
               </ULink>
            </h2>
         </div>
      </div> -->

      <!-- For toast notifications -->
      <UNotifications />

      <!-- Settings modal! -->
      <UModal :ui="{ container: 'items-center' }" v-model="isSettingsModalOpen">
         <div
            class="grid grid-cols-8 dark:bg-gray-800 bg-gray-300 px-2 h-[90vh] gap-2"
         >
            <div
               class="col-span-3 border-r dark:border-gray-700 border-gray-400 flex-col flex"
            >
               <UButton
                  icon="i-heroicons-arrow-left"
                  @click="isSettingsModalOpen = false"
                  variant="ghost"
                  class="pl-0"
               />
               <p class="text-xl">Settings</p>
               <UButton
                  label="Display"
                  class="pl-0 my-2"
                  :ui="{ color: { gray: 'text-gray-400' } }"
                  color="gray"
                  variant="ghost"
                  @click="toggleSettingsDisplay('display')"
               />
               <UButton
                  label="Tools"
                  class="pl-0 my-2"
                  :ui="{ color: { gray: 'text-gray-400' } }"
                  color="gray"
                  variant="ghost"
                  @click="toggleSettingsDisplay('tools')"
               />
               <UButton
                  label="Data"
                  class="pl-0 my-2"
                  :ui="{ color: { gray: 'text-gray-400' } }"
                  color="gray"
                  variant="ghost"
                  @click="toggleSettingsDisplay('data')"
               />
            </div>
            <div class="col-span-5" v-if="currentSettingMenu === 'display'">
               <p class="text-xl my-8">Display</p>
               <p class="text-sm dark:text-gray-400">
                  Manage your display settings
               </p>
               <hr class="my-4 border-gray-600" />
               <p class="text-lg"><strong>Theme</strong></p>
               <UCommandPalette
                  v-model="themeSelected"
                  nullable
                  :autoselect="false"
                  :groups="[{ key: 'themes', commands: themes }]"
                  @update:model-value="onThemeSelect"
                  ref="themePalett"
                  placeholder="Search themes"
               />
            </div>
         </div>
      </UModal>
      <UModal
         :ui="{ container: 'items-center' }"
         v-model="isConfirmClearUserDataOpen"
      >
         <div class="p-4">
            <p class="text-xl text-red-500">
               <strong>Confirm clear user data?</strong>
            </p>
            <UDivider class="my-2" />
            <p>
               This includes all your previous grocery trips, envelopes,
               favorites, current theme, savings goals, IOUs, and anything
               Budgie stores on your behalf.
            </p>
            <div class="text-center">
               <UButton
                  label="No, I want to keepy my data in Budgie"
                  @click="isConfirmClearUserDataOpen = false"
                  class="w-3/4 my-2"
               />
               <UButton
                  label="Yes, delete all my Budgie data"
                  @click="clearUserData"
                  class="w-3/4 my-2"
                  color="red"
               />
            </div>
         </div>
      </UModal>
      <!-- End main container -->
   </UContainer>

   <!-- Bottom bar navigation -->
   <UHorizontalNavigation :links="navBarLinks" class="min-w-0 fixed bottom-0 !justify-center bg-white dark-nav-bg custom-nav-links" :ui="{base:'max-w-18 min-w-18'}">
      <template #default="{ link }">
         <span></span>
      </template>
      <template #icon="{ link, isActive }">
         <div class="flex flex-col items-center mx-1" >
            <UIcon
               :name="link.icon"
               class="w-6 h-6"
               :class="[isActive ? 'text-primary-500' : 'text-gray-400', (link.to.startsWith(isParentActive[0]) && isParentActive[1]) ? 'text-primary-500' : 'text-gray-400']"
            />            
            <span>{{ link.label }}</span>
         </div>
      </template>
   </UHorizontalNavigation>
</template>
<style>
.custom-nav-links a::before {
   background-color: transparent !important;
}
.dark .dark-nav-bg {
   background-color: #121212;
}
a::after {
   height: 5px!important;
}
</style>
