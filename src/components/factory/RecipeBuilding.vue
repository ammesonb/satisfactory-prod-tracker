<script setup lang="ts">
import { computed } from 'vue'
import type { RecipeNode } from '@/logistics/graph-node'
import { useDataStore } from '@/stores'
import { useRecipeStatus } from '@/composables/useRecipeStatus'

const props = defineProps<{
  recipe: RecipeNode
}>()

const data = useDataStore()

const buildingIcon = computed(() => data.getIcon(props.recipe.recipe.building))
const { setRecipeBuilt } = useRecipeStatus()

const updateBuiltState = (value: boolean) => {
  setRecipeBuilt(props.recipe.recipe.name, value)
}
</script>

<template>
  <div class="recipe-building text-center">
    <h4 class="text-h6 mb-3">Building</h4>
    <v-card
      hover
      @click="updateBuiltState(!props.recipe.built)"
      style="cursor: pointer; transition: all 0.2s ease"
      :class="{
        'elevation-2': true,
        'bg-green-lighten-4': props.recipe.built,
        'bg-surface': !props.recipe.built,
      }"
    >
      <v-card-text class="pa-3">
        <div class="d-flex flex-row align-center gap-2">
          <v-checkbox
            :model-value="props.recipe.built"
            @update:model-value="(value: boolean | null) => updateBuiltState(value ?? false)"
            @click.stop
            label=""
            density="compact"
            hide-details
          />
          <CachedIcon v-if="buildingIcon" :icon="buildingIcon" :size="32" />
          <div class="text-body-2 font-weight-medium text-center">
            {{ data.getBuildingDisplayName(props.recipe.recipe.building) }}
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
