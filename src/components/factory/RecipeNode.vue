<script setup lang="ts">
import { computed } from 'vue'

import { useFloorManagement } from '@/composables/useFloorManagement'
import { useRecipeStatus } from '@/composables/useRecipeStatus'
import { getStores } from '@/composables/useStores'
import { type RecipeNode } from '@/logistics/graph-node'
import { formatRecipeId } from '@/utils/floors'

const props = defineProps<{
  recipe: RecipeNode
}>()

const { dataStore: data, themeStore } = getStores()
const { getEligibleFloors, moveRecipe } = useFloorManagement()
const { isRecipeComplete, getRecipePanelValue } = useRecipeStatus()

const completed = computed(() => isRecipeComplete(props.recipe))

const panelBgClass = computed(
  () =>
    (completed.value ? 'bg-blue-grey' : 'bg-grey') +
    (themeStore.isDark ? '-darken-2' : '-lighten-1'),
)

const titleBgClass = computed(() => (completed.value ? 'bg-green-lighten-4' : 'bg-grey'))

const availableFloors = computed(() => getEligibleFloors(props.recipe.batchNumber!))

const handleMoveRecipe = (targetFloorIndex: number) => {
  moveRecipe(props.recipe.recipe.name, props.recipe.batchNumber!, targetFloorIndex)
}
</script>

<template>
  <v-expansion-panel
    :class="panelBgClass"
    :value="getRecipePanelValue(recipe)"
    :id="formatRecipeId(props.recipe.recipe.name)"
  >
    <v-expansion-panel-title :class="titleBgClass">
      <div class="d-flex justify-space-between align-center w-100">
        <div class="d-flex align-center gap-2">
          <p class="text-h6 mr-2">{{ data.getRecipeDisplayName(props.recipe.recipe.name) }}</p>
          <v-tooltip interactive v-if="data.recipes[props.recipe.recipe.name]" content-class="pa-0">
            <template v-slot:activator="{ props: activatorProps }">
              <v-chip
                size="small"
                class="mr-1"
                color="info"
                variant="elevated"
                style="cursor: help"
                v-bind="activatorProps"
              >
                x{{ props.recipe.recipe.count.toFixed(2) }}
              </v-chip>
            </template>
            <RecipeDetails :recipe="props.recipe" />
          </v-tooltip>
        </div>
        <div class="d-flex align-center gap-2">
          <v-select
            :model-value="props.recipe.batchNumber!"
            @update:model-value="handleMoveRecipe"
            @click.stop
            :items="availableFloors"
            density="compact"
            hide-details
            class="recipe-move-select mr-2"
            bg-color="secondary"
            variant="solo-filled"
            :menu-props="{ closeOnContentClick: true }"
          >
            <template #prepend-inner>
              <v-icon size="small">mdi-floor-plan</v-icon>
            </template>
          </v-select>
        </div>
      </div>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <div class="d-flex justify-space-between align-start gap-4">
        <RecipeInputs :recipe="props.recipe" />
        <RecipeBuilding :recipe="props.recipe" />
        <RecipeOutputs :recipe="props.recipe" />
      </div>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<style scoped>
.recipe-move-select {
  max-width: 160px;
  min-width: 120px;
}
</style>
