<script setup lang="ts">
import { computed, type Ref } from 'vue'
import { type RecipeNode } from '@/logistics/graph-node'
import { getStores } from '@/composables/useStores'
import { useFloorManagement } from '@/composables/useFloorManagement'
import { type Material } from '@/types/factory'
import { ZERO_THRESHOLD } from '@/logistics/constants'
import { formatRecipeId } from '@/composables/useFloorNavigation'

const props = defineProps<{
  recipe: RecipeNode
  panelValue: string
  currentFloorIndex: number
}>()

const { dataStore: data, themeStore, factoryStore } = getStores()
const { getEligibleFloors, moveRecipe } = useFloorManagement()

const leftoverProducts: Ref<Material[]> = computed(() =>
  props.recipe.availableProducts
    .filter((p) => p.amount > ZERO_THRESHOLD)
    .map((p) => ({
      source: props.recipe.recipe.name,
      sink: '',
      material: p.item,
      amount: p.amount,
    })),
)

const completed = computed(() => factoryStore.recipeComplete(props.recipe))

const panelBgClass = computed(
  () =>
    (completed.value ? 'bg-blue-grey' : 'bg-grey') +
    (themeStore.isDark ? '-darken-2' : '-lighten-1'),
)

const titleBgClass = computed(() => (completed.value ? 'bg-green-lighten-4' : 'bg-grey'))

const availableFloors = computed(() => getEligibleFloors(props.currentFloorIndex))

const handleMoveRecipe = (targetFloorIndex: number) => {
  moveRecipe(props.recipe.recipe.name, props.currentFloorIndex, targetFloorIndex)
}
</script>

<template>
  <v-expansion-panel
    :class="panelBgClass"
    :value="props.panelValue"
    :id="formatRecipeId(props.currentFloorIndex, props.recipe.recipe.name)"
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
            :model-value="props.currentFloorIndex"
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
        <RecipeInputs :links="props.recipe.inputs" :recipe="props.recipe" />
        <RecipeBuilding :recipe="props.recipe" />
        <RecipeOutputs
          :links="[...props.recipe.outputs, ...leftoverProducts]"
          :recipe="props.recipe"
        />
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
