<script setup lang="ts">
// auth
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// For notifications
const toast = useToast();

// show/hide things
const showExplanation = ref(false);

// first unit of conversion, default lb
const firstUnit = ref({
  label: "Pounds",
  id: "lb",
});

// second unit of conversion, default kg
const secondUnit = ref({
  label: "Kilograms",
  id: "kg",
});

// amount we're converting (would be in the firstUnit's measurement)
const value = ref(1);
// the converted value
const convertedValue = ref("0.45");

const massUnits = [
  {
    label: "Pounds",
    id: "lb",
  },
  {
    label: "Kilograms",
    id: "kg",
  },
  {
    label: "grams",
    id: "g",
  },
  {
    label: "milligrams",
    id: "mg",
  },
  {
    label: "ounce",
    id: "oz",
  },
  {
    label: "metric ton",
    id: "t",
  },
  {
    label: "stone",
    id: "st",
  },
];

// the starting cost of the item per first unit
const initialCost = ref(1);
// the calculated cost of the item per second unit
const convertedCost = ref(2.22);

/**
 * update the unit of mass used for conversion
 */
async function updateMassUnit() {
  if (value.value.toString().length >= 10) {
    console.log(value.value.toString().length);
    convertedValue.value = "😖";
    return;
  }
  // if using the same units (maybe by accident?) don't send a request
  if (firstUnit.value.id == secondUnit.value.id) {
    convertedValue.value = value.value.toString();
    return;
  }
  const response = await $fetch("/api/grocery/convert_mass", {
    method: "post",
    body: {
      // lol
      value: value.value,
      firstUnit: firstUnit.value.id,
      secondUnit: secondUnit.value.id,
    },
  });

  // check for errors
  if (response.error) {
    toast.add({ title: "Error: " + response.message });
    convertedValue.value = "😖";
  }

  // verify response is good
  if (response !== null || response !== undefined) {
    // check if it's over 10 digits. We're only working with small numbers here.
    if (response.toString().length >= 10) {
      convertedValue.value = "😖";
    } else {
      convertedValue.value = response.toString();
      convertCost();
    }
  } else {
    toast.add({ title: "Error: invalid response from server" });
  }
}

/**
 * uses the converted value of units to find
 * the converted cost per unit
 */
function convertCost() {
  // get total cost (first unit)
  let totalCost = initialCost.value * value.value;
  // divide that total by the total weight (second unit)
  let newCost = totalCost / Number(convertedValue.value);
  convertedCost.value = Number(newCost.toFixed(2));
}

const links = getBreadcrumbs([
  { name: "Grocery", icon: "i-heroicons-shopping-bag-solid", url: "/grocery" },
  {
    name: "Converter",
    icon: "i-heroicons-arrows-up-down-solid",
    url: "/grocery/converter",
  },
]);
</script>

<template>
  <BreadcrumbHTML><UBreadcrumb :links="links" /></BreadcrumbHTML>
  <div class="mx-auto grid grid-cols-2">
    <p class="text-xl my-4 row-span-2 items-center flex">Convert</p>
    <div class="flex flex-col row-span-2">
      <UInputMenu
        @change="updateMassUnit()"
        v-model="firstUnit"
        :options="massUnits"
        class="inline-block"
        size="xl"
      />
      <p class="text-xl text-center my-2">
        <UIcon name="i-heroicons-arrow-down-solid" />
        to
        <UIcon name="i-heroicons-arrow-down-solid" />
      </p>
      <UInputMenu
        @change="updateMassUnit()"
        v-model="secondUnit"
        :options="massUnits"
        class="inline-block"
        size="xl"
      />
    </div>
    <UDivider
      label="Enter mass"
      class="col-span-2 my-4"
      :ui="{ label: 'text-xl' }"
    />
    <div class="col-span-2 text-center">
      <UInput
        @change="updateMassUnit()"
        :ui="{
          base: '!text-xl text-center',
          trailing: { padding: 'p-0' },
        }"
        :padded="false"
        type="number"
        v-model="value"
        class="inline-block"
      >
        <template #trailing>
          {{ firstUnit.id }}
        </template>
      </UInput>
      <p class="text-xl text-center my-2">
        <UIcon name="i-heroicons-arrows-up-down-solid" />
      </p>
      <UInput
        :ui="{
          base: '!text-xl text-center !ring-primary-500 dark:!ring-primary-400',
          trailing: { padding: 'p-0' },
        }"
        :padded="false"
        type="number"
        v-model="convertedValue"
        class="inline-block"
        :disabled="true"
      >
        <template #trailing>
          {{ secondUnit.id }}
        </template>
      </UInput>
    </div>
  </div>
  <UDivider
    label="Enter cost per unit"
    class="col-span-2 my-4"
    :ui="{ label: 'text-xl' }"
  />
  <div class="grid grid-cols-2">
    <div class="col-span-2 text-center">
      <UInput
        @change="convertCost"
        :ui="{
          base: '!text-xl text-center',
          trailing: { padding: 'ps-0' },
          leading: { padding: 'ps-0' },
        }"
        :padded="false"
        type="number"
        v-model="initialCost"
        class="inline-block"
      >
        <template #leading>$</template>
        <template #trailing>per {{ firstUnit.id }}</template>
      </UInput>
      <p class="text-xl text-center my-2">
        <UIcon name="i-heroicons-arrows-up-down-solid" />
      </p>
      <UInput
        :ui="{
          base: '!text-xl text-center !ring-primary-500 dark:!ring-primary-400',
          trailing: { padding: 'ps-0' },
          leading: { padding: 'ps-0' },
        }"
        :padded="false"
        type="number"
        v-model="convertedCost"
        class="inline-block"
        :disabled="true"
      >
        <template #leading>$</template>
        <template #trailing>per {{ secondUnit.id }}</template>
      </UInput>
    </div>
  </div>
  <UDivider label="Result" class="col-span-2 my-2" />
  <p class="text-xl my-4">
    <strong>{{ value }} {{ firstUnit.label }}</strong> equals
    <strong>{{ convertedValue }} {{ secondUnit.label }}</strong> and
    <strong>${{ initialCost }}/ {{ firstUnit.id }}</strong> costs
    <strong>${{ convertedCost }}/{{ secondUnit.id }}</strong
    >.
  </p>
  <UButton
    @click="showExplanation = !showExplanation"
    class="justify-center w-full"
    icon="i-heroicons-information-circle-solid"
  />
  <UAlert
    v-if="value.toString().length >= 10 || convertedValue.length >= 10"
    icon="i-heroicons-exclamation-triangle-solid"
    description="This converter is built for convenience, not exact science. Values greater than 10 digits won't be displayed."
    title="Heads up!"
    color="orange"
  />
  <!-- EXPLANATION -->
  <UModal :ui="{ container: 'items-center' }" v-model="showExplanation">
    <UCard>
      <template #header>
        <div class="flex min-w-0 justify-between">
          <p class="text-2xl">Information</p>
          <UButton
            @click="showExplanation = false"
            variant="link"
            color="white"
            size="xl"
            icon="i-heroicons-x-mark-solid"
          />
        </div>
      </template>
      <p>
        <strong
          >Easily convert common weight units and costs per item while grocery
          shopping.</strong
        >
      </p>
      <br />
      <p class="text-sm">
        Ever try and compare two items sold by weight that are measured in
        different units? I have. This tool attempts to solve that.
      </p>
      <br />
      <p class="text-sm">
        Choose your units of measurement, enter the weight, and enter the cost
        per unit of measurement.
      </p>
    </UCard>
  </UModal>
</template>
