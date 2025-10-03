<script setup lang="ts">
import { watch } from 'vue'
import { type RecipeEntry } from '@/types/factory'
import { useRecipeInputForm } from './composables/useRecipeInputForm'

const emit = defineEmits<{
  change: [value: RecipeEntry[]]
}>()

const form = useRecipeInputForm()

watch(
  () => form.selectedRecipes.value,
  () => {
    emit('change', form.selectedRecipes.value)
  },
  { deep: true },
)

const addRecipe = () => {
  if (!form.isValid) {
    return
  }

  form.addRecipe()
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
        :exclude-keys="form.recipeKeys"
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

      <RecipeDisplay :recipes="form.selectedRecipes" @remove="form.removeRecipe" />
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
