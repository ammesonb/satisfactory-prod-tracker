import type { Floor } from '@/types/factory'
import { useDataSearch } from '@/composables/useDataSearch'
import { useFloorManagement, type FloorWithIndex } from '@/composables/useFloorManagement'
import { computed, type Ref } from 'vue'
import { getStores } from '@/composables/useStores'
import type { RecipeNode } from '@/logistics/graph-node'

export const useFloorSearch = (floors: Ref<Floor[] | undefined>) => {
  const { dataStore } = getStores()
  const { getFloorDisplayName, floorMatches } = useFloorManagement()

  // Prepare floors with original index
  const floorsWithIndex = computed<FloorWithIndex[]>(() => {
    if (!floors.value) return []
    return floors.value.map((floor, index) => ({
      ...floor,
      originalIndex: index,
    }))
  })

  const { searchInput, filteredItems, updateSearch } = useDataSearch(
    floorsWithIndex,
    floorMatches,
    {
      debounceMs: 100,
      maxResults: 1000, // Effectively unlimited for floors
      maxNoSearchResults: 1000, // Show all floors when no search
    },
  )

  // Further process filtered floors to filter recipes within each floor
  const filteredFloors = computed(() => {
    const query = searchInput.value?.toLowerCase().trim()

    if (!query) {
      return filteredItems.value
    }

    // Filter recipes within each matched floor
    return filteredItems.value.map((floor) => {
      const floorName = getFloorDisplayName(floor.originalIndex + 1, floor).toLowerCase()

      const recipeMatches = (recipe: RecipeNode) =>
        dataStore.getRecipeDisplayName(recipe.recipe.name).toLowerCase().includes(query)

      return {
        ...floor,
        recipes: floorName.includes(query) ? floor.recipes : floor.recipes.filter(recipeMatches),
      }
    })
  })

  return {
    searchInput,
    filteredFloors,
    updateSearch,
  }
}
