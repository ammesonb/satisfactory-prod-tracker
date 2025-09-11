<script setup lang="ts">
import { computed } from 'vue'
import { type RecipeEntry } from '@/types/factory'
import { useRecipeInputForm } from './composables/useRecipeInputForm'

interface Props {
  modelValue: RecipeEntry[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: RecipeEntry[]]
}>()

const form = useRecipeInputForm()

const excludedRecipeKeys = computed(() => props.modelValue.map((entry) => entry.recipe))

const addRecipe = () => {
  if (!form.isValid) {
    return
  }

  try {
    const updatedList = [...props.modelValue, form.toRecipeEntry()]
    emit('update:modelValue', updatedList)
    form.reset()
  } catch (error) {
    if (error instanceof Error) {
      form.setError(`Failed to add recipe: ${error.message}`)
    } else {
      form.setError(`Failed to add recipe: ${String(error)}`)
    }
  }
}

const removeRecipe = (index: number) => {
  const updatedList = [...props.modelValue]
  updatedList.splice(index, 1)
  emit('update:modelValue', updatedList)
}
</script>

<template>
  <div class="recipe-input">
    <div class="recipe-form">
      <v-alert
        v-if="form.displayError.value"
        type="error"
        variant="tonal"
        :closable="!!form.errorMessage.value"
        @click:close="form.clearError"
        class="mb-4"
      >
        {{ form.displayError }}
      </v-alert>

      <RecipeSelector
        :model-value="form.selectedRecipe.value"
        @update:model-value="form.changeRecipe"
        :exclude-keys="excludedRecipeKeys"
        class="mb-3"
      />

      <v-row class="mb-3" align="center">
        <v-col cols="3">
          <v-text-field
            v-model.number="form.buildingCount.value"
            label="Building count"
            type="number"
            :min="0.1"
            :step="0.1"
            variant="outlined"
            :hide-details="true"
          />
        </v-col>

        <v-col cols="6">
          <BuildingSelector
            v-model="form.selectedBuilding.value"
            :filter-keys="form.productionBuildings.value"
            :disabled="!form.selectedRecipe.value"
          />
        </v-col>

        <v-col cols="3">
          <v-btn
            @click="addRecipe"
            :disabled="!form.isValid.value"
            color="secondary"
            variant="outlined"
            rounded
          >
            Add Recipe
          </v-btn>
        </v-col>
      </v-row>

      <RecipeDisplay :recipes="modelValue" @remove="removeRecipe" />
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
</style>
