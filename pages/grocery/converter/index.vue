<script setup lang="ts">
// auth
const { status, data, signIn, signOut } = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

// For notifications
const toast = useToast();

// show/hide things
const showExplanation = ref(false);

// max length for inputs
const maxLength = 9;

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
const weight = ref(1);
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
  // if weight is longer than maxLength, shorten to maxLength
  if (weight.value.toString().length > maxLength) {
    weight.value = Number(weight.value.toString().substring(0, maxLength));
  }

  // if using the same units (maybe by accident?) don't send a request
  if (firstUnit.value.id == secondUnit.value.id) {
    convertedValue.value = weight.value.toString();
    return;
  }

  // send request to convert_mass endpoint
  const response = await $fetch("/api/grocery/convert_mass", {
    method: "post",
    body: {
      value: weight.value,
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
      toast.add({ title: "Oops, result was too large to display!" });
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
  let newCost;
  let totalCost;

  // if cost is longer than maxLength, shorten to maxLength
  if (initialCost.value.toString().length > maxLength) {
    initialCost.value = Number(
      initialCost.value.toString().substring(0, maxLength)
    );
  }
  // if not a number, empty, or null, set to 0
  if (
    typeof initialCost.value !== "number" ||
    initialCost.value === null ||
    initialCost.value.toString() == ""
  ) {
    initialCost.value = 0;
  }

  // get the total cost (price times weight)
  totalCost = initialCost.value * weight.value;

  // if the converted weight is less than or equal to 0 don't convert
  if (Number(convertedValue.value) > 0) {
    // divide that total by the total weight (second unit)
    newCost = totalCost / Number(convertedValue.value);
  } else {
    newCost = 0;
  }

  // final cost per unit
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
  <BreadcrumbHTML class="flex items-center"
    ><UBreadcrumb :links="links"
  /></BreadcrumbHTML>
  <UButton
    @click="showExplanation = !showExplanation"
    class="justify-center w-full mx-auto text-xl my-2"
    icon="i-heroicons-information-circle-solid"
    variant="outline"
  >
    How to use
    <img
      alt="An icon of a budgie, which is a kind of bird."
      class="inline-block text-primary"
      src="/edited_budgie.svg"
      height="25"
      width="25"
    />
  </UButton>
  <UAlert
    v-if="Number.isNaN(Number(convertedValue))"
    icon="i-heroicons-exclamation-triangle-solid"
    description="This converter is built for convenience, not exact science. Values greater than 10 digits won't be displayed."
    title="Heads up!"
    color="orange"
  />
  <div class="mx-auto grid grid-cols-2">
    <p class="text-3xl my-4 row-span-2 col-span-2 text-center text-primary">
      Convert
    </p>
    <div class="flex flex-col row-span-2 col-span-2 mx-auto">
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
  </div>
  <UDivider
    label="Enter weight"
    class="col-span-2 my-4"
    :ui="{ label: 'text-xl' }"
  />
  <div class="grid grid-cols-2 grid-rows-1 my-8">
    <div class="text-center w-full">
      <UInput
        @change="updateMassUnit()"
        :ui="{
          base: '!text-xl text-center',
          trailing: { padding: 'p-0' },
        }"
        :padded="false"
        type="number"
        v-model="weight"
        class="inline-block"
      >
        <template #trailing>
          {{ firstUnit.id }}
        </template>
      </UInput>
    </div>
    <p class="text-xl text-center w-full">
      = {{ convertedValue }}/{{ secondUnit.id }}
    </p>
  </div>
  <UDivider
    label="Enter cost per unit"
    class="col-span-2 my-4"
    :ui="{ label: 'text-xl' }"
  />
  <div class="grid grid-cols-2 grid-rows-1 my-8">
    <div class="text-center w-full">
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
        <template #trailing>{{ firstUnit.id }}</template>
      </UInput>
    </div>
    <p class="text-xl text-center w-full">
      = ${{ convertedCost }}/{{ secondUnit.id }}
    </p>
  </div>
  <UDivider label="Result" class="col-span-2 my-2" :ui="{ label: 'text-xl' }" />
  <p class="text-xl my-4">
    <strong>{{ weight }} {{ firstUnit.label }}</strong> equals
    <strong>{{ convertedValue }} {{ secondUnit.label }}</strong
    ><br />
    <strong>${{ initialCost }} per {{ firstUnit.id }}</strong> costs
    <strong>${{ convertedCost }} per {{ secondUnit.id }}</strong>
  </p>
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
            class="text-gray-600 hover:text-gray-900"
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
