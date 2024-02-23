<script setup>
defineProps({
  links: Array,
  label: String,
});
</script>

<template>
  <UAccordion :items="links" :ui="{ wrapper: 'flex flex-col w-full' }">
    <template #default="{ item, index, open }">
      <UButton color="gray" variant="ghost" class="border rounded-full my-2 border-gray-200 dark:border-gray-800" :ui="{ rounded: 'rounded-none', padding: { sm: 'p-3' } }">
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
          <UIcon name="i-heroicons-chevron-right-20-solid"
            class="w-5 h-5 ms-auto transform transition-transform duration-200" :class="[open && 'rotate-90']" />
        </template>
      </UButton>
    </template>
  </UAccordion>
</template>

<style>
.custom-nav-links a::before {
  background-color: transparent !important;
}
</style>
