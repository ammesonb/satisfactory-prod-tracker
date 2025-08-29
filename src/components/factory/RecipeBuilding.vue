<script setup lang="ts">
import type { RecipeNode } from '@/logistics/graph-node'
import { getIconURL } from '@/logistics/images'
import { useDataStore } from '@/stores/data'
import { computed } from 'vue'

const props = defineProps<{
  recipe: RecipeNode
}>()

const emit = defineEmits<{
  'update:built': [value: boolean]
}>()

const data = useDataStore()

const buildingIcon = computed(() => data.buildings[props.recipe.recipe.building]?.icon)

const updateBuiltState = (value: boolean) => {
  emit('update:built', value)
}
</script>

<template>
  <div class="recipe-building text-center">
    <h4 class="text-h6 mb-3">Building</h4>
    <v-card variant="outlined">
      <v-card-text class="pa-3">
        <div class="d-flex flex-column align-center gap-2">
          <v-checkbox
            :model-value="recipe.built"
            @update:model-value="updateBuiltState"
            label="Placed"
            density="compact"
            hide-details
          />
          <v-img v-if="buildingIcon" :src="getIconURL(buildingIcon, 64)" :width="32" :height="32" />
          <div class="text-body-2 font-weight-medium text-center">
            {{ data.getBuildingDisplayName(recipe.recipe.building) }}
          </div>
          <v-chip size="small" color="primary" variant="outlined">
            x{{ recipe.recipe.count.toFixed(2) }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
