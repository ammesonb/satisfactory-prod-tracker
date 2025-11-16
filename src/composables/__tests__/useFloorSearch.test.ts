import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, type Ref } from 'vue'

import { mockCurrentFactory } from '@/__tests__/fixtures/composables/factoryStore'
import {
  mockFloorMatches,
  mockGetFloorDisplayName,
} from '@/__tests__/fixtures/composables/floorManagement'
import { makeFloor } from '@/__tests__/fixtures/data'
import { useFloorSearch } from '@/composables/useFloorSearch'
import type { Floor } from '@/types/factory'
import type { FloorWithIndex } from '@/composables/useFloorManagement'

vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return {
    getStores: mockGetStores,
  }
})

vi.mock('@/composables/useFloorManagement', async () => {
  const { mockUseFloorManagement } = await import('@/__tests__/fixtures/composables')
  return {
    useFloorManagement: mockUseFloorManagement,
  }
})

describe('useFloorSearch', () => {
  let testFloors: Ref<Floor[] | undefined>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockCurrentFactory.value = null

    testFloors = ref<Floor[]>([
      makeFloor(['Recipe_IronIngot_C', 'Recipe_CopperIngot_C'], { name: 'Smelting' }),
      makeFloor(['Recipe_IronPlate_C', 'Recipe_IronRod_C'], { name: 'Production' }),
      makeFloor(['Recipe_Cable_C']),
    ])

    // Set up mock return values
    mockGetFloorDisplayName.mockImplementation((index: number, floor: Floor) => {
      return floor.name ? `Floor ${index} - ${floor.name}` : `Floor ${index}`
    })

    mockFloorMatches.mockImplementation((floor: FloorWithIndex, query: string) => {
      const floorName = mockGetFloorDisplayName(floor.originalIndex + 1, floor).toLowerCase()
      if (floorName.includes(query.toLowerCase())) {
        return true
      }
      // Check if any recipe matches
      return floor.recipes.some((recipe) =>
        recipe.recipe.name.toLowerCase().includes(query.toLowerCase()),
      )
    })
  })

  describe('Initial State', () => {
    it('initializes with empty search input', () => {
      const { searchInput } = useFloorSearch(testFloors)

      expect(searchInput.value).toBe('')
    })

    it('returns all floors when no search query', () => {
      const { filteredFloors } = useFloorSearch(testFloors)

      expect(filteredFloors.value).toHaveLength(3)
    })

    it('returns empty array when floors is undefined', () => {
      testFloors.value = undefined
      const { filteredFloors } = useFloorSearch(testFloors)

      expect(filteredFloors.value).toEqual([])
    })

    it('preserves original floor index', () => {
      const { filteredFloors } = useFloorSearch(testFloors)

      expect(filteredFloors.value[0]).toHaveProperty('originalIndex', 0)
      expect(filteredFloors.value[1]).toHaveProperty('originalIndex', 1)
      expect(filteredFloors.value[2]).toHaveProperty('originalIndex', 2)
    })
  })

  describe('Floor Name Search', () => {
    it('filters floors by name', async () => {
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('smelting')
      await vi.waitFor(() => {
        expect(filteredFloors.value).toHaveLength(1)
      })

      expect(filteredFloors.value[0].name).toBe('Smelting')
    })

    it('filters floors by floor number', async () => {
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('floor 2')
      await vi.waitFor(() => {
        expect(filteredFloors.value).toHaveLength(1)
      })

      expect(filteredFloors.value[0].name).toBe('Production')
    })

    it('is case insensitive', async () => {
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('PRODUCTION')
      await vi.waitFor(() => {
        expect(filteredFloors.value).toHaveLength(1)
      })

      expect(filteredFloors.value[0].name).toBe('Production')
    })

    it('returns all recipes when floor name matches', async () => {
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('smelting')
      await vi.waitFor(() => {
        expect(filteredFloors.value).toHaveLength(1)
      })

      expect(filteredFloors.value[0].recipes).toHaveLength(2)
      expect(filteredFloors.value[0].recipes[0].recipe.name).toBe('Recipe_IronIngot_C')
      expect(filteredFloors.value[0].recipes[1].recipe.name).toBe('Recipe_CopperIngot_C')
    })
  })

  describe('Recipe Name Search', () => {
    it('filters recipes within floors', async () => {
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('iron')
      await vi.waitFor(() => {
        expect(filteredFloors.value.length).toBeGreaterThan(0)
      })

      const smeltingFloor = filteredFloors.value.find((f) => f.name === 'Smelting')
      const productionFloor = filteredFloors.value.find((f) => f.name === 'Production')

      expect(smeltingFloor?.recipes).toHaveLength(1)
      expect(smeltingFloor?.recipes[0].recipe.name).toBe('Recipe_IronIngot_C')

      expect(productionFloor?.recipes).toHaveLength(2)
      expect(productionFloor?.recipes[0].recipe.name).toBe('Recipe_IronPlate_C')
      expect(productionFloor?.recipes[1].recipe.name).toBe('Recipe_IronRod_C')
    })

    it('excludes floors with no matching recipes', async () => {
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('cable')
      await vi.waitFor(() => {
        expect(filteredFloors.value).toHaveLength(1)
      })

      expect(filteredFloors.value[0].originalIndex).toBe(2)
      expect(filteredFloors.value[0].recipes).toHaveLength(1)
      expect(filteredFloors.value[0].recipes[0].recipe.name).toBe('Recipe_Cable_C')
    })

    it('returns empty array when no recipes match', async () => {
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('steel')
      await vi.waitFor(() => {
        expect(filteredFloors.value).toEqual([])
      })
    })
  })

  describe('Mixed Search', () => {
    it('matches both floor names and recipe names', async () => {
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('production')
      await vi.waitFor(() => {
        expect(filteredFloors.value).toHaveLength(1)
      })

      expect(filteredFloors.value[0].name).toBe('Production')
      expect(filteredFloors.value[0].recipes).toHaveLength(2)
    })

    it('shows full floor when floor name matches, partial when recipe matches', async () => {
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('copper')
      await vi.waitFor(() => {
        expect(filteredFloors.value).toHaveLength(1)
      })

      const smeltingFloor = filteredFloors.value[0]
      expect(smeltingFloor.name).toBe('Smelting')
      expect(smeltingFloor.recipes).toHaveLength(1)
      expect(smeltingFloor.recipes[0].recipe.name).toBe('Recipe_CopperIngot_C')
    })
  })

  describe('Whitespace Handling', () => {
    it('trims whitespace from search query', async () => {
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('  smelting  ')
      await vi.waitFor(() => {
        expect(filteredFloors.value).toHaveLength(1)
      })

      expect(filteredFloors.value[0].name).toBe('Smelting')
    })

    it('handles empty search after trimming', async () => {
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('   ')
      await vi.waitFor(() => {
        expect(filteredFloors.value).toHaveLength(3)
      })
    })
  })

  describe('Reactive Updates', () => {
    it('updates when floors change', async () => {
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('iron')
      await vi.waitFor(() => {
        expect(filteredFloors.value.length).toBeGreaterThan(0)
      })

      testFloors.value = [makeFloor(['Recipe_IronIngot_C'], { name: 'New Floor' })]

      await vi.waitFor(() => {
        expect(filteredFloors.value).toHaveLength(1)
      })

      expect(filteredFloors.value[0].name).toBe('New Floor')
    })

    it('clears filter when search is cleared', async () => {
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('smelting')
      await vi.waitFor(() => {
        expect(filteredFloors.value).toHaveLength(1)
      })

      updateSearch('')
      await vi.waitFor(() => {
        expect(filteredFloors.value).toHaveLength(3)
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles floors with no recipes', async () => {
      testFloors.value = [makeFloor([], { name: 'Empty Floor' })]
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('empty')
      await vi.waitFor(() => {
        expect(filteredFloors.value).toHaveLength(1)
      })

      expect(filteredFloors.value[0].recipes).toHaveLength(0)
    })

    it('handles floors with no name', async () => {
      testFloors.value = [makeFloor([], { name: 'Floor 1' })]
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('floor 1')
      await vi.waitFor(() => {
        expect(filteredFloors.value).toHaveLength(1)
      })
    })
  })

  describe('Debouncing', () => {
    it('debounces search input', async () => {
      const { filteredFloors, updateSearch } = useFloorSearch(testFloors)

      updateSearch('s')
      expect(filteredFloors.value).toHaveLength(3)

      updateSearch('sm')
      expect(filteredFloors.value).toHaveLength(3)

      updateSearch('smelting')

      await vi.waitFor(
        () => {
          expect(filteredFloors.value).toHaveLength(1)
        },
        { timeout: 200 },
      )
    })
  })

  describe('Result Limiting', () => {
    it('limits results when no search query', () => {
      testFloors.value = Array.from({ length: 50 }, (_, i) =>
        makeFloor(['Recipe_Test_C'], { name: `Floor ${i}` }),
      )

      const { filteredFloors } = useFloorSearch(testFloors)

      expect(filteredFloors.value.length).toBeLessThanOrEqual(40)
    })
  })
})
