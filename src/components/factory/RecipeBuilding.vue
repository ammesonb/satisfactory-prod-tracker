<script setup lang="ts">
import type { RecipeNode } from '@/logistics/graph-node'
import { useDataStore } from '@/stores/data'
import { computed } from 'vue'
import CachedIcon from '@/components/common/CachedIcon.vue'

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
    <v-card>
      <v-card-text class="pa-3">
        <div class="d-flex flex-row align-center gap-2">
          <v-checkbox
            :model-value="recipe.built"
            @update:model-value="(value: boolean | null) => updateBuiltState(value ?? false)"
            label=""
            density="compact"
            hide-details
          />
          <CachedIcon v-if="buildingIcon" :icon="buildingIcon" :size="32" />
          <div class="text-body-2 font-weight-medium text-center mr-3">
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
