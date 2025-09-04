<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import type { Floor } from '@/types/factory'
import { getIconURL } from '@/logistics/images'
import { useDataStore } from '@/stores/data'
import { useFactoryStore } from '@/stores/factory'
import { formatFloorId } from '@/composables/useFloorNavigation'

interface Props {
  floor: Floor
  floorNumber: number
  expanded: boolean
}

const props = defineProps<Props>()

const dataStore = useDataStore()
const factoryStore = useFactoryStore()

const floorName = computed(() => factoryStore.getFloorDisplayName(props.floorNumber, props.floor))

// Use a ref to track expanded recipes for reactivity
const expandedRecipesRef = ref<string[]>([])

// Initialize and watch for changes
const updateExpandedRecipes = () => {
  expandedRecipesRef.value = props.floor.recipes
    .filter((recipe) => recipe.expanded)
    .map((recipe) => recipe.recipe.name)
}

// Initialize
updateExpandedRecipes()

// Watch for changes in recipe expansion - use immediate to catch initial changes
watch(
  () => props.floor.recipes.map((recipe) => recipe.expanded),
  () => {
    updateExpandedRecipes()
  },
  { immediate: true, flush: 'post' },
)

const expandedRecipes = computed({
  get: () => expandedRecipesRef.value,
  set: (value: string[]) => {
    expandedRecipesRef.value = value
    // Update recipe expansion state when v-model changes
    props.floor.recipes.forEach((recipe) => {
      recipe.expanded = value.includes(recipe.recipe.name)
    })
  },
})

const emit = defineEmits<{
  'edit-floor': [floorIndex: number]
}>()
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
            @click.stop="emit('edit-floor', props.floorNumber - 1)"
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
          :current-floor-index="props.floorNumber - 1"
        />
      </v-expansion-panels>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
