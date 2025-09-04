<script setup lang="ts">
import { ref } from 'vue'
import type { ItemOption, RecipeProduct } from '@/types/data'
import { getStores } from '@/composables/useStores'
import ItemSelector from '@/components/common/ItemSelector.vue'
import CachedIcon from '@/components/common/CachedIcon.vue'

interface Props {
  modelValue: RecipeProduct[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: RecipeProduct[]]
}>()

const { dataStore } = getStores()

// Form state for adding new external input
const selectedItem = ref<ItemOption>()
const quantity = ref<number>(1)

// Add new external input
const addExternalInput = () => {
  if (!selectedItem.value) return

  const newInput: RecipeProduct = {
    item: selectedItem.value.value,
    amount: quantity.value,
  }

  // Check if item already exists
  const existingIndex = props.modelValue.findIndex((input) => input.item === newInput.item)

  if (existingIndex >= 0) {
    // Update existing quantity
    const updated = [...props.modelValue]
    updated[existingIndex].amount += newInput.amount
    emit('update:modelValue', updated)
  } else {
    // Add new input
    emit('update:modelValue', [...props.modelValue, newInput])
  }

  // Reset form
  selectedItem.value = undefined
  quantity.value = 1
}

// Remove external input
const removeExternalInput = (index: number) => {
  const updated = [...props.modelValue]
  updated.splice(index, 1)
  emit('update:modelValue', updated)
}
</script>

<template>
  <v-expansion-panels variant="accordion" class="mb-4 external-inputs-panel">
    <v-expansion-panel>
      <v-expansion-panel-title>
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-import</v-icon>
          External Inputs
          <v-chip v-if="modelValue.length > 0" size="small" color="primary" class="ml-2">
            {{ modelValue.length }}
          </v-chip>
        </div>
      </v-expansion-panel-title>

      <v-expansion-panel-text>
        <div class="mb-4">
          <p class="text-body-2 text-medium-emphasis mb-3">
            Add items that will be provided from an external source.
          </p>

          <!-- Add new external input form -->
          <v-row no-gutters class="mb-4">
            <v-col cols="12" md="6" class="pe-md-3">
              <ItemSelector
                v-model="selectedItem"
                placeholder="Select an item..."
                :include-buildings="false"
              />
            </v-col>
            <v-col cols="8" md="3" class="pe-3 pe-md-3 d-flex align-center">
              <v-text-field
                v-model.number="quantity"
                label="Quantity / min"
                type="number"
                min="0.1"
                step="0.1"
                variant="outlined"
                hide-details
                density="comfortable"
              />
            </v-col>
            <v-col cols="4" md="3" class="d-flex align-center">
              <v-btn
                color="primary"
                variant="elevated"
                :disabled="!selectedItem"
                @click="addExternalInput"
                block
                class="h-100"
              >
                Add
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- List of added external inputs -->
        <div v-if="modelValue.length > 0">
          <h4 class="text-subtitle-2 mb-3">Added External Inputs:</h4>
          <div class="d-flex flex-wrap gap-2 align-center">
            <v-chip
              v-for="(input, index) in modelValue"
              :key="`${input.item}-${index}`"
              size="large"
              variant="outlined"
              closable
              @click:close="removeExternalInput(index)"
              class="external-input-chip"
            >
              <template #prepend>
                <CachedIcon :icon="dataStore.getIcon(input.item)" :size="20" class="me-2" />
              </template>

              {{ dataStore.getItemDisplayName(input.item) }}

              <v-badge :content="input.amount" color="primary" inline class="ml-2" />
            </v-chip>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-4 text-medium-emphasis">
          <v-icon size="48" class="mb-2">mdi-package-variant-remove</v-icon>
          <p class="text-body-2">No external inputs added yet</p>
          <p class="text-caption">Select an item above to add external inputs</p>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<style scoped>
.external-inputs-panel :deep(.v-expansion-panel) {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15) !important;
}

.external-inputs-panel :deep(.v-expansion-panel-title) {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1) !important;
}

.external-input-chip {
  height: auto !important;
  padding: 8px 12px;
}

.external-input-chip :deep(.v-chip__content) {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
