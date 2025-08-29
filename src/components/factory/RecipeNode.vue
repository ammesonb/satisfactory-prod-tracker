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
const emit = defineEmits<{
  'update:built': [value: boolean]
  'update:link-built': [linkId: string, value: boolean]
}>()

const data = useDataStore()
const themeStore = useThemeStore()

const updateBuiltState = (value: boolean) => {
  emit('update:built', value)
}

const updateLinkBuiltState = (linkId: string, value: boolean) => {
  emit('update:link-built', linkId, value)
}

const panelBgClass = computed(
  () =>
    (props.completed ? 'bg-blue-grey' : 'bg-grey') +
    (themeStore.isDark ? '-darken-2' : '-lighten-2'),
)

const titleBgClass = computed(
  () => (props.completed ? 'bg-blue-grey' : 'bg-grey') + (themeStore.isDark ? '-darken-1' : ''),
)
</script>

<template>
  <v-expansion-panel :class="panelBgClass" :value="props.panelValue" :id="props.recipeId">
    <v-expansion-panel-title :class="titleBgClass">
      <p class="text-h6">{{ data.getRecipeDisplayName(props.recipe.recipe.name) }}</p>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <div class="d-flex justify-space-between align-start gap-4">
        <RecipeInputs :links="props.recipe.inputs" @update:link-built="updateLinkBuiltState" />
        <RecipeBuilding :recipe="props.recipe" @update:built="updateBuiltState" />
        <RecipeOutputs :links="props.recipe.outputs" @update:link-built="updateLinkBuiltState" />
      </div>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
