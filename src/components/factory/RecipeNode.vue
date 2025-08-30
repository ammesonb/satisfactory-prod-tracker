<script setup lang="ts">
import { computed } from 'vue'
import { type RecipeNode } from '@/logistics/graph-node'
import { useDataStore } from '@/stores/data'
import { useThemeStore } from '@/stores/theme'

const props = defineProps<{
  recipe: RecipeNode
  recipeId: string
  completed: boolean
  panelValue: string
}>()

const data = useDataStore()
const themeStore = useThemeStore()

const panelBgClass = computed(
  () => (props.completed ? 'bg-blue-grey' : 'bg-grey') + (themeStore.isDark ? '-darken-2' : ''),
)

const titleBgClass = computed(() => (props.completed ? 'bg-green-lighten-4' : 'bg-grey-lighten-1'))
</script>

<template>
  <v-expansion-panel :class="panelBgClass" :value="props.panelValue" :id="props.recipeId">
    <v-expansion-panel-title :class="titleBgClass">
      <div class="d-flex justify-space-between align-center w-100">
        <div class="d-flex align-center gap-2">
          <p class="text-h6">{{ data.getRecipeDisplayName(props.recipe.recipe.name) }}</p>
          <v-tooltip interactive v-if="data.recipes[props.recipe.recipe.name]" content-class="pa-0">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn
                v-bind="activatorProps"
                icon="mdi-information"
                size="medium"
                variant="text"
                color="info"
                class="ml-1"
              />
            </template>
            <RecipeDetails :recipe="props.recipe" />
          </v-tooltip>
        </div>
        <v-chip size="small" class="mr-2" color="info" variant="elevated">
          x{{ props.recipe.recipe.count.toFixed(2) }}
        </v-chip>
      </div>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <div class="d-flex justify-space-between align-start gap-4">
        <RecipeInputs :links="props.recipe.inputs" />
        <RecipeBuilding :recipe="props.recipe" />
        <RecipeOutputs :links="props.recipe.outputs" />
      </div>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
