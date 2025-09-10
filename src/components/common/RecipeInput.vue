<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getStores } from '@/composables/useStores'
import { type RecipeEntry } from '@/types/factory'
import { type ItemOption } from '@/types/data'

interface Props {
  modelValue: RecipeEntry[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: RecipeEntry[]]
}>()

const { dataStore } = getStores()

// Form inputs
const selectedRecipe = ref<ItemOption>()
const buildingCount = ref<number>(1)
const selectedBuilding = ref<ItemOption>()

// Excluded recipe keys for RecipeSelector
const excludedRecipeKeys = computed(() => props.modelValue.map((entry) => entry.recipe))

// Available building keys for selected recipe
const availableBuildingKeys = computed<string[]>(() =>
  selectedRecipe.value && dataStore.recipes[selectedRecipe.value.value]
    ? dataStore.recipes[selectedRecipe.value.value].producedIn
    : [],
)

const canAddRecipe = computed(() => {
  return selectedRecipe.value && selectedBuilding.value && buildingCount.value > 0
})

const addRecipe = () => {
  if (canAddRecipe.value && selectedRecipe.value && selectedBuilding.value) {
    const building = dataStore.buildings[selectedBuilding.value.value]
    const newEntry: RecipeEntry = {
      recipe: selectedRecipe.value.value,
      building: selectedBuilding.value.value,
      count: buildingCount.value,
      icon: building?.icon || '',
    }

    const updatedList = [...props.modelValue, newEntry]
    emit('update:modelValue', updatedList)

    // Reset inputs
    selectedRecipe.value = undefined
    selectedBuilding.value = undefined
    buildingCount.value = 1
  }
}

const removeRecipe = (index: number) => {
  const updatedList = [...props.modelValue]
  updatedList.splice(index, 1)
  emit('update:modelValue', updatedList)
}

// Auto-select building if only one option
watch(selectedRecipe, () => {
  if (availableBuildingKeys.value.length === 1) {
    selectedBuilding.value = {
      value: availableBuildingKeys.value[0],
      name: dataStore.getBuildingDisplayName(availableBuildingKeys.value[0]),
      icon: dataStore.getIcon(availableBuildingKeys.value[0]),
      type: 'building' as const,
    }
  } else {
    selectedBuilding.value = undefined
  }
})
</script>

<template>
  <div class="recipe-input">
    <!-- Recipe Selection Form -->
    <div class="recipe-form">
      <RecipeSelector
        v-model="selectedRecipe"
        :exclude-keys="excludedRecipeKeys"
        :display-config="{
          placeholder: 'Select a recipe...',
          label: 'Recipe',
        }"
        class="mb-3"
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

        <BuildingSelector
          v-model="selectedBuilding"
          :filter-keys="availableBuildingKeys"
          :disabled="!selectedRecipe || availableBuildingKeys.length < 2"
          :display-config="{
            placeholder: 'Select building...',
            label: 'Building',
          }"
          style="flex: 1"
          class="me-2"
        />

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
                <CachedIcon :icon="dataStore.getIcon(entry.recipe)" :size="32" class="mr-2" />
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
