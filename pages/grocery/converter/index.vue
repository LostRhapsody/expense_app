<script setup lang="ts">

import convert from 'convert';
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// first unit of conversion
const startUnit = ref("Pounds");
// second unit of conversion
const endUnit = ref("Kilograms");
// amount we're converting (would be in the startUnit's measurement)
const value = ref(0);
// the converted value
const convertedValue = ref(0);

// just for reference... this is an array of arrays
// each array is a different section in the drop down
// 'popular' units are in the first section, followed
// by ALL available units
const massUnits = [
  [{
    label: 'Pounds - lb',
    id: 'lb'
  }, {
    label: 'Kilograms - kg',
    id: 'kg'
  }]
]
const massUnitsB = [
  {
    label: 'Pounds',
    id: 'lb'
  }, {
    label: 'Kilograms',
    id: 'kg'
  }
]

/**
 * update the unit of mass used for conversion
 * @param unitPosition represents the first or second unit we're updating
 */
function updateMassUnit() {
  console.log(startUnit);
  console.log(startUnit.value);
  // convertedValue.value = convert(value.value, startUnit.value).to(endUnit.value);
}
</script>

<template>
  <div class="mx-auto grid grid-cols-4 text-center">
    <p class="text-2xl">Convert</p>
    <UInputMenu @change="updateMassUnit()" v-model="startUnit" :options="massUnitsB" class="inline-block" size="xl" />
    <p class="text-2xl">to</p>
    <UInputMenu @change="updateMassUnit()" v-model="endUnit" :options="massUnitsB" class="inline-block" size="xl" />
    <h2 class="text-2xl my-4 ">Input:</h2>
    <UInput @change="updateMassUnit()" :ui="{ base: '!text-2xl text-center' }" :padded="false" type="number" v-model="value" class="inline-block my-4">
    </UInput>
    <h2 class="text-2xl my-4 ">Result:</h2>
    <h2 v-html="convertedValue"
      class="text-2xl my-4 focus:outline-none border-0 !text-2xl text-center form-input rounded-md p-0 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-2 ring-inset ring-primary-300 dark:ring-primary-700">
    </h2>
  </div>
</template>
