<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Floor } from '@/types/factory'
import { getIconURL } from '@/logistics/images'
import { useFactoryStore } from '@/stores/factory'
import { formatFloorId, formatRecipeId } from '@/composables/useFloorNavigation'

interface Props {
  floor: Floor
  floorNumber: number
  expanded: boolean
}

const props = defineProps<Props>()

const factoryStore = useFactoryStore()

const floorName = computed(() => factoryStore.getFloorDisplayName(props.floorNumber, props.floor))

const expandedRecipes = ref<string[]>([])

// Initialize expanded recipes on mount and when floor changes
watch(
  () => [props.floor, props.expanded],
  () => {
    if (factoryStore.selected) {
      // wait slightly to allow panel to close before re-opening recipes,
      // since confusing visual glitch
      setTimeout(() => {
        expandedRecipes.value = props.floor.recipes
          .filter((recipe) => !factoryStore.recipeComplete(recipe))
          .map((recipe) => `${props.floorNumber}-${recipe.recipe.name}`)
      }, 250)
    }
  },
  { immediate: true },
)

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
            v-if="props.floor.icon"
            class="me-3"
            :src="getIconURL(props.floor.icon, 64)"
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
          :completed="factoryStore.recipeComplete(recipe)"
          :panel-value="`${props.floorNumber}-${recipe.recipe.name}`"
          :recipe-id="formatRecipeId(props.floorNumber - 1, recipe.recipe.name)"
          @update:built="(value: boolean) => (recipe.built = value)"
          @update:link-built="
            (linkId: string, value: boolean) => factoryStore.setLinkBuiltState(linkId, value)
          "
        />
      </v-expansion-panels>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
