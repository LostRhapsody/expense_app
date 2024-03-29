<script setup lang="ts">
const showAddFaveModal = ref(false);
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");
const favoriteLinks = ref([
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
         label: "Grocery Lists",
         toggled: false,
         url: "/grocery/lists",
         icon: "i-heroicons-list-bullet",
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
      {
         label: "Savings Goals",
         toggled: false,
         url: "/budgeting/goals",
         icon: "i-heroicons-trophy-solid",
      },
      {
         label: "Checkbook",
         toggled: false,
         url: "/budgeting/checkbook",
         icon: "i-heroicons-rectangle-stack-solid",
      },
   ],
]);

const showFavoritesList = computed(() => {
   return favoriteLinks.value[0].find((e) => e.toggled);
});

/**
 * get's the user's favorited app tools
 */
async function getFavorites() {
   const key = localStorage.getItem("uuid");
   await useFetch("/api/user/getFavorites", {
      method: "post",
      body: {
         key: key + "Favorites",
      },
      key: "Favorites",
      onResponse({ response }) {
         if (response._data !== "No favorites") {
            localStorage.setItem("favorites", response._data);
            favoriteLinks.value[0].forEach((fave, index) => {
               fave.toggled = response._data[0][index].toggled;
            });
         }
      },
   });
}

/**
 * set's the user's favorite links
 */
async function setFavorites() {
   const key = localStorage.getItem("uuid");

   if (key === null) {
      alert("Getting client token failed! Alert evan.robertson77@gmail.com");
      return;
   }

   await useFetch("/api/user/setFavorites", {
      method: "post",
      body: {
         key: key + "Favorites",
         value: favoriteLinks,
      },
      onResponse({ response }) {
         // setClientTheme();
      },
   });
}

const links = [
   {
      label: "Grocery",
      icon: "i-heroicons-envelope-solid",
      id: "grocery",
      content: "Tools to save money while you shop.",
      to: "/grocery",
   },
   {
      label: "Budgeting",
      icon: "i-heroicons-user-solid",
      id: "ious",
      content: "Balance your checkbook, budget with envelopes, and more.",
      to: "/budgeting",
   },
];

if (loggedIn.value && process.client) {
   getFavorites();
}
</script>

<template>
   <div class="text-center">
      <BudgieTitle />
      <GroupLinks :links="links" />

      <UDivider label="Favorites" class="mt-8" />
      <div class="m-2 p-1">
         <UButton
            label="Add Favorite"
            icon="i-heroicons-star"
            @click="showAddFaveModal = true"
            class="w-full"
         />
      </div>
      <div v-if="showFavoritesList" class="block">
         <div v-for="link in favoriteLinks[0]">
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

   <!-- Favorites modal -->
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
         <div v-for="link in favoriteLinks[0]">
            <p
               class="m-2 my-4 p-1 ring-1 ring-gray-300 dark:ring-gray-800 rounded flex items-center justify-between"
            >
               <span>
                  <UIcon :name="link.icon" />
                  {{ link.label }}
               </span>
               <UToggle v-model="link.toggled" v-on:blur="setFavorites" />
            </p>
         </div>
      </UCard>
   </UModal>
</template>
