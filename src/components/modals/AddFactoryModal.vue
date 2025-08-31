<script setup lang="ts">
import { ref, computed } from 'vue'
import { type RecipeEntry } from '@/types/factory'
import IconSelector from '@/components/common/IconSelector.vue'
import RecipeInput from '@/components/common/RecipeInput.vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'add-factory'])

// Input mode toggle - default is recipe mode
const inputMode = ref<'recipe' | 'import'>('recipe')

const form = ref({
  name: '',
  icon: undefined as string | undefined,
  recipes: '',
  recipeList: [] as RecipeEntry[],
})

const showDialog = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const clear = () => {
  form.value = { name: '', icon: undefined, recipes: '', recipeList: [] }
  inputMode.value = 'recipe'
  showDialog.value = false
}

const addFactory = () => {
  if (
    !form.value.name ||
    !form.value.icon ||
    (!form.value.recipes && !form.value.recipeList.length)
  )
    return

  const factory = {
    name: form.value.name,
    icon: form.value.icon,
    recipes: form.value.recipes,
  }

  if (inputMode.value === 'recipe') {
    if (form.value.name && form.value.recipeList.length > 0 && form.value.icon) {
      // Convert recipe list to the expected format
      const recipeStrings = form.value.recipeList.map((entry) => {
        return `"${entry.recipe}@1.0#${entry.building}": "${entry.count}"`
      })

      factory.recipes = recipeStrings.join('\n')
    }
  }

  emit('add-factory', factory)
  clear()
}
</script>

<template>
  <v-dialog v-model="showDialog" max-width="600px" scrollable>
    <v-card class="d-flex flex-column" style="height: 80vh">
      <v-card-title>Add a new factory</v-card-title>
      <v-card-text class="flex-grow-1 overflow-y-auto">
        <v-form>
          <v-text-field
            v-model="form.name"
            label="Factory name"
            required
            variant="outlined"
            class="mb-4"
          />
          <IconSelector
            v-model="form.icon"
            placeholder="Search for a factory icon..."
            class="mb-4"
          />

          <!-- Input Mode Toggle -->
          <div class="mb-4 d-flex justify-center">
            <v-btn-toggle
              v-model="inputMode"
              color="secondary"
              group
              mandatory
              variant="outlined"
              class="mb-2"
            >
              <v-btn value="recipe" size="small" rounded> Recipe Builder </v-btn>
              <v-btn value="import" size="small" rounded> Import from Satisfactory Tools </v-btn>
            </v-btn-toggle>
          </div>

          <!-- Recipe Mode -->
          <RecipeInput v-if="inputMode === 'recipe'" v-model="form.recipeList" />

          <!-- Import Mode -->
          <v-textarea
            v-if="inputMode === 'import'"
            v-model="form.recipes"
            label="Recipes"
            placeholder="Enter recipes, one per line"
            rows="8"
            variant="outlined"
            required
            density="compact"
            class="recipe-textarea"
          />
        </v-form>
      </v-card-text>
      <v-card-actions class="flex-shrink-0 pa-4">
        <v-spacer />
        <v-btn variant="tonal" @click="clear">Cancel</v-btn>
        <v-btn
          color="secondary"
          variant="elevated"
          @click="addFactory"
          :disabled="!form.name || (!form.recipes && !form.recipeList.length) || !form.icon"
        >
          Add Factory
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.recipe-textarea :deep(.v-field) {
  margin-top: 20px !important;
}

.recipe-textarea :deep(textarea) {
  font-family: monospace !important;
  font-size: 0.75rem !important;
}
</style>
