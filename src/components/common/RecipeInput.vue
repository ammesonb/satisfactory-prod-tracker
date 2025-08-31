<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDataStore } from '@/stores/data'
import { type RecipeEntry } from '@/types/factory'
import CachedIcon from '@/components/common/CachedIcon.vue'

interface Props {
  modelValue: RecipeEntry[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: RecipeEntry[]]
}>()

const dataStore = useDataStore()

// Form inputs
const selectedRecipe = ref<string>('')
const buildingCount = ref<number>(1)
const selectedBuilding = ref<string>('')

// Available recipes with friendly names, excluding already selected ones
const recipeOptions = computed(() => {
  const selectedRecipeKeys = props.modelValue.map((entry) => entry.recipe)

  return Object.keys(dataStore.recipes)
    .filter((key) => !selectedRecipeKeys.includes(key))
    .map((key) => ({
      value: key,
      title: dataStore.getRecipeDisplayName(key),
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
})

// Available buildings for selected recipe
const buildingOptions = computed(() => {
  if (!selectedRecipe.value || !dataStore.recipes[selectedRecipe.value]) {
    return []
  }
  return dataStore.recipes[selectedRecipe.value].producedIn.map((buildingKey) => ({
    value: buildingKey,
    title: dataStore.getBuildingDisplayName(buildingKey),
    icon: dataStore.buildings[buildingKey]?.icon || '',
  }))
})

watch(
  buildingOptions,
  () => {
    if (buildingOptions.value.length === 1) {
      selectedBuilding.value = buildingOptions.value[0].value
    }
  },
  { immediate: true },
)

const canAddRecipe = computed(() => {
  return selectedRecipe.value && selectedBuilding.value && buildingCount.value > 0
})

const addRecipe = () => {
  if (canAddRecipe.value) {
    const building = dataStore.buildings[selectedBuilding.value]
    const newEntry: RecipeEntry = {
      recipe: selectedRecipe.value,
      building: selectedBuilding.value,
      count: buildingCount.value,
      icon: building?.icon || '',
    }

    const updatedList = [...props.modelValue, newEntry]
    emit('update:modelValue', updatedList)

    // Reset inputs
    selectedRecipe.value = ''
    selectedBuilding.value = ''
    buildingCount.value = 1
  }
}

const removeRecipe = (index: number) => {
  const updatedList = [...props.modelValue]
  updatedList.splice(index, 1)
  emit('update:modelValue', updatedList)
}

const getRecipeProductIcon = (recipeName: string): string => {
  const products = dataStore.recipeProducts(recipeName)
  if (products.length > 0) {
    const firstProduct = products[0].item
    return dataStore.items[firstProduct]?.icon || ''
  }
  return ''
}

// Auto-select building if only one option
watch(selectedRecipe, () => {
  if (buildingOptions.value.length === 1) {
    selectedBuilding.value = buildingOptions.value[0].value
  } else {
    selectedBuilding.value = ''
  }
})
</script>

<template>
  <div class="recipe-input">
    <!-- Recipe Selection Form -->
    <div class="recipe-form">
      <v-autocomplete
        v-model="selectedRecipe"
        :items="recipeOptions"
        label="Recipe"
        item-title="title"
        item-value="value"
        variant="outlined"
        clearable
        class="mb-3"
        :hide-details="true"
      />

      <div class="d-flex gap-3 mb-3 align-center">
        <v-text-field
          v-model.number="buildingCount"
          label="Building count"
          type="number"
          min="1"
          variant="outlined"
          style="flex: 0 0 150px"
          class="me-2"
          :hide-details="true"
        />

        <v-autocomplete
          v-model="selectedBuilding"
          :items="buildingOptions"
          label="Building"
          item-title="title"
          item-value="value"
          variant="outlined"
          :disabled="!selectedRecipe || buildingOptions.length < 2"
          style="flex: 1"
          class="me-2"
          :hide-details="true"
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps">
              <template #prepend v-if="item.raw.icon">
                <CachedIcon :icon="item.raw.icon" :size="24" class="me-2" />
              </template>
            </v-list-item>
          </template>

          <template #selection="{ item }">
            <div class="d-flex align-center">
              <CachedIcon v-if="item.raw.icon" :icon="item.raw.icon" :size="20" class="me-2" />
              {{ item.raw.title }}
            </div>
          </template>
        </v-autocomplete>

        <v-btn
          @click="addRecipe"
          :disabled="!canAddRecipe"
          color="secondary"
          variant="outlined"
          rounded
          style="flex: 0 0 auto"
        >
          Add Recipe
        </v-btn>
      </div>

      <!-- Recipe List -->
      <div v-if="modelValue.length > 0" class="recipe-list">
        <v-divider class="mb-3" />
        <h4 class="text-subtitle-2 mb-3">Selected Recipes</h4>

        <div class="recipe-entries">
          <v-card
            v-for="(entry, index) in modelValue"
            :key="`${entry.recipe}-${entry.building}-${index}`"
            variant="outlined"
            class="mb-2"
          >
            <v-card-text class="d-flex align-center py-3">
              <!-- Recipe product icon -->
              <div class="d-flex flex-row align-center mr-3">
                <CachedIcon :icon="getRecipeProductIcon(entry.recipe)" :size="32" class="mr-2" />
                <div class="d-flex flex-column text-body-2 font-weight-medium">
                  {{ index + 1 }}. {{ dataStore.getRecipeDisplayName(entry.recipe) }}
                  <div
                    class="d-flex flex-row align-center justify-start text-caption text-medium-emphasis"
                  >
                    <CachedIcon v-if="entry.icon" :icon="entry.icon" :size="24" class="mr-1" />
                    {{ entry.count }}x {{ dataStore.getBuildingDisplayName(entry.building) }}
                  </div>
                </div>
              </div>

              <v-spacer />

              <v-btn
                @click="removeRecipe(index)"
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
              />
            </v-card-text>
          </v-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recipe-input {
  width: 100%;
}

.recipe-form {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}

.recipe-entries {
  max-height: 300px;
  overflow-y: auto;
}

.recipe-entries .text-caption :deep(.cached-icon),
.recipe-entries .text-caption :deep(.v-img),
.recipe-entries .text-caption :deep(.v-responsive) {
  max-width: 24px !important;
  width: 24px !important;
  flex: none !important;
}
</style>
