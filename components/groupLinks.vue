<script setup>
defineProps({
  links: Array,
  label: String,
});
</script>

<template>
  <UAccordion :items="links" :ui="{ wrapper: 'flex flex-col w-full' }">
    <template #default="{ item, index, open }">
      <div>
        <!-- PAGES -->
        <UButton color="gray" variant="ghost" class="border rounded-full my-2 border-gray-200 dark:border-gray-800 w-full"
          :class="(item.isTitle) ? 'hidden' : ''" :ui="{ rounded: 'rounded-none', padding: { sm: 'p-3' } }">
          <template #leading>
            <ULink :to="item.to">
              <div class="w-6 h-6 rounded-full bg-primary-500 dark:bg-primary-400 flex items-center justify-center -my-1">
                <UIcon :name="item.icon" class="w-4 h-4 text-white dark:text-gray-900" />
              </div>
            </ULink>
          </template>

          <ULink :to="item.to">
            <span class="truncate">{{ item.label }}</span>
          </ULink>

          <template #trailing>
            <UIcon v-if="item.content" name="i-heroicons-chevron-right-20-solid"
              class="w-5 h-5 ms-auto transform transition-transform duration-200" :class="[open && 'rotate-90']" />
          </template>
        </UButton>
        <!-- TITLES -->
        <UButton color="gray" variant="ghost" class="border-t my-4 border-gray-300 dark:border-gray-700 w-full text-xl"
          :class="(item.isTitle) ? '' : 'hidden'" :ui="{ rounded: 'rounded-none', padding: { sm: 'p-3' } }">

          <ULink :to="item.to">
            <span class="truncate">{{ item.label }}</span>
          </ULink>

          <template #trailing>
            <UIcon v-if="item.content" name="i-heroicons-chevron-right-20-solid"
              class="w-5 h-5 ms-auto transform transition-transform duration-200" :class="[open && 'rotate-90']" />
          </template>
        </UButton>
      </div>
    </template>
  </UAccordion>
</template>
