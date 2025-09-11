<script setup lang="ts">
import { computed } from 'vue'
import type { Floor } from '@/types/factory'
import { getIconURL } from '@/logistics/images'
import { getStores } from '@/composables/useStores'
import { useFloorManagement } from '@/composables/useFloorManagement'
import { formatFloorId } from '@/composables/useFloorNavigation'
import { useRecipeStatus } from '@/composables/useRecipeStatus'

interface Props {
  floor: Floor
  floorNumber: number
}

const props = defineProps<Props>()

const { dataStore } = getStores()
const { getFloorDisplayName, openFloorEditor } = useFloorManagement()
const { getRecipePanelValue } = useRecipeStatus()

const floorName = computed(() => getFloorDisplayName(props.floorNumber, props.floor))

const expandedRecipes = computed({
  get: () => {
    return props.floor.recipes.filter((recipe) => recipe.expanded).map(getRecipePanelValue)
  },
  set: (value: string[]) => {
    // Update recipe expansion state when v-model changes
    props.floor.recipes.forEach((recipe) => {
      recipe.expanded = value.includes(getRecipePanelValue(recipe))
    })
  },
})
</script>

<template>
  <v-expansion-panel
    class="mb-2"
    elevation="2"
    :value="props.floorNumber - 1"
    :id="formatFloorId(props.floorNumber - 1)"
  >
    <v-expansion-panel-title>
      <div class="d-flex align-center w-100">
        <div class="d-flex align-center">
          <v-img
            v-if="props.floor.iconItem"
            class="me-3"
            :src="getIconURL(dataStore.getIcon(props.floor.iconItem), 64)"
            width="24"
            height="24"
          />
          <v-icon v-else class="me-3">mdi-factory</v-icon>
          <span class="text-h6 font-weight-bold">{{ floorName }}</span>
        </div>
        <v-spacer />
        <div class="d-flex align-center">
          <v-chip size="small" color="info" variant="outlined" class="me-2">
            {{ props.floor.recipes.length }} recipes
          </v-chip>
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            color="secondary"
            @click.stop="openFloorEditor(props.floorNumber - 1)"
            class="me-1"
          />
        </div>
      </div>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <v-expansion-panels multiple v-model="expandedRecipes">
        <RecipeNode
          v-for="recipe in props.floor.recipes"
          :key="recipe.recipe.name"
          :recipe="recipe"
        />
      </v-expansion-panels>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
