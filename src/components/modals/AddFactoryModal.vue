<script setup lang="ts">
import { computed, ref } from 'vue'

import type { ItemOption, RecipeProduct } from '@/types/data'
import { type RecipeEntry } from '@/types/factory'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'add-factory'])

// Input mode toggle - default is recipe mode
const inputMode = ref<'recipe' | 'import'>('recipe')

const form = ref({
  name: '',
  item: undefined as ItemOption | undefined,
  recipes: '',
  recipeList: [] as RecipeEntry[],
  externalInputs: [] as RecipeProduct[],
})

const showDialog = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const clear = () => {
  form.value = { name: '', item: undefined, recipes: '', recipeList: [], externalInputs: [] }
  inputMode.value = 'recipe'
  showDialog.value = false
}

const addFactory = () => {
  if (
    !form.value.name ||
    !form.value.item?.icon ||
    (!form.value.recipes && !form.value.recipeList.length)
  )
    return

  const factory = {
    name: form.value.name,
    icon: form.value.item.icon,
    recipes: form.value.recipes,
    externalInputs: form.value.externalInputs,
  }

  if (inputMode.value === 'recipe') {
    if (form.value.name && form.value.recipeList.length > 0 && form.value.item?.icon) {
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

// TODO: update this with new instructions
const instructions = `Import from Satisfactory Tools:

1. 🏭 Create your factory on Satisfactory Tools
2. 🔧 Open browser dev tools (F12, Shift+Ctrl+I, Option+Command+I)
3. 🌐 Go to Network tab → Reload page → Find "solver" requests
4. 🔍 Use the requests pane to find the desired factory
5. 📋 In the solver request, go to "Response" tab
6. 📄 Copy all lines starting with "Recipe_" (include quotes)
7. 📥 Paste into the Recipes field below (one per line)`

const openHelpWiki = () => {
  window.open(
    'https://github.com/ammesonb/satisfactory-prod-tracker/wiki/Import-from-Satisfactory-Tools',
    '_blank',
  )
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
          <ItemSelector
            v-model="form.item"
            placeholder="Search for a factory icon..."
            class="mb-4"
          />

          <!-- Input Mode Toggle -->
          <div class="mb-4 d-flex justify-center align-center">
            <v-btn-toggle
              v-model="inputMode"
              color="secondary"
              group
              mandatory
              variant="outlined"
              class="mb-2 mr-2"
            >
              <v-btn value="recipe" size="small" rounded> Recipe Builder </v-btn>
              <v-btn value="import" size="small" rounded> Import from Satisfactory Tools </v-btn>
            </v-btn-toggle>

            <div v-if="inputMode === 'import'" @click="openHelpWiki">
              <v-tooltip location="top" max-width="400" content-class="bg-grey-darken-2">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-help-circle-outline"
                    size="small"
                    variant="text"
                    color="info"
                  />
                </template>
                <div class="text-body-2" style="white-space: pre-line">{{ instructions }}</div>
              </v-tooltip>
            </div>
          </div>

          <RecipeForm v-if="inputMode === 'recipe'" @change="form.recipeList = $event" />

          <v-textarea
            v-if="inputMode === 'import'"
            v-model="form.recipes"
            label="Recipes"
            placeholder="Paste recipe lines from Satisfactory Tools here..."
            rows="8"
            variant="outlined"
            required
            density="compact"
            class="recipe-textarea mb-4"
            :persistent-placeholder="true"
            :hide-details="true"
          />

          <ExternalInputSelector v-model="form.externalInputs" />
        </v-form>
      </v-card-text>
      <v-card-actions class="flex-shrink-0 pa-4">
        <v-spacer />
        <v-btn variant="tonal" @click="clear">Cancel</v-btn>
        <v-btn
          color="secondary"
          variant="elevated"
          @click="addFactory"
          :disabled="!form.name || (!form.recipes && !form.recipeList.length) || !form.item?.icon"
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
