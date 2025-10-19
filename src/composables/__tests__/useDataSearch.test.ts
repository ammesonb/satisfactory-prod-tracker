import type { ItemOption } from '@/types/data'
import type { SearchOptions } from '@/types/ui'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref, type Ref } from 'vue'
import { useDataSearch } from '../useDataSearch'

const IRON_ORE: ItemOption = {
  value: 'Desc_OreIron_C',
  name: 'Iron Ore',
  icon: 'iron-ore',
  type: 'item',
}
const IRON_INGOT: ItemOption = {
  value: 'Desc_IronIngot_C',
  name: 'Iron Ingot',
  icon: 'iron-ingot',
  type: 'item',
}
const IRON_PLATE: ItemOption = {
  value: 'Desc_IronPlate_C',
  name: 'Iron Plate',
  icon: 'iron-plate',
  type: 'item',
}
const COPPER_ORE: ItemOption = {
  value: 'Desc_OreCopper_C',
  name: 'Copper Ore',
  icon: 'copper-ore',
  type: 'item',
}
const COPPER_INGOT: ItemOption = {
  value: 'Desc_CopperIngot_C',
  name: 'Copper Ingot',
  icon: 'copper-ingot',
  type: 'item',
}
const IRON_ROD: ItemOption = {
  value: 'Desc_IronRod_C',
  name: 'Iron Rod',
  icon: 'iron-rod',
  type: 'item',
}
const STEEL_INGOT: ItemOption = {
  value: 'Desc_SteelIngot_C',
  name: 'Steel Ingot',
  icon: 'steel-ingot',
  type: 'item',
}

describe('useDataSearch', () => {
  let testItems: Ref<ItemOption[]>
  let matchesFn: (item: ItemOption, query: string) => boolean

  beforeEach(() => {
    testItems = ref<ItemOption[]>([IRON_ORE, IRON_INGOT, IRON_PLATE, COPPER_ORE, COPPER_INGOT])

    matchesFn = (item: ItemOption, query: string) => {
      return item.name.toLowerCase().includes(query)
    }
  })

  describe('Initial State', () => {
    it('initializes with empty search input', () => {
      const { searchInput } = useDataSearch(testItems, matchesFn)

      expect(searchInput.value).toBe('')
    })

    it('returns limited items when no search query', () => {
      const { filteredItems } = useDataSearch(testItems, matchesFn)

      expect(filteredItems.value).toHaveLength(5)
    })

    it('applies maxNoSearchResults limit when no search query', () => {
      const options: SearchOptions = { maxNoSearchResults: 3 }
      const { filteredItems } = useDataSearch(testItems, matchesFn, options)

      expect(filteredItems.value).toHaveLength(3)
      expect(filteredItems.value).toEqual(testItems.value.slice(0, 3))
    })
  })

  describe('Search Functionality', () => {
    it('filters items based on search query', async () => {
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn)

      updateSearch('copper')
      await vi.waitFor(() => {
        expect(filteredItems.value).toHaveLength(2)
      })

      expect(filteredItems.value).toEqual([COPPER_ORE, COPPER_INGOT])
    })

    it('is case insensitive', async () => {
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn)

      updateSearch('IRON')
      await vi.waitFor(() => {
        expect(filteredItems.value).toHaveLength(3)
      })

      expect(filteredItems.value).toEqual([IRON_ORE, IRON_INGOT, IRON_PLATE])
    })

    it('trims whitespace from search query', async () => {
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn)

      updateSearch('  copper  ')
      await vi.waitFor(() => {
        expect(filteredItems.value).toHaveLength(2)
      })
    })

    it('returns empty array when no matches found', async () => {
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn)

      updateSearch('steel')
      await vi.waitFor(() => {
        expect(filteredItems.value).toEqual([])
      })
    })

    it('updates searchInput ref when updateSearch is called', () => {
      const { searchInput, updateSearch } = useDataSearch(testItems, matchesFn)

      updateSearch('test query')

      expect(searchInput.value).toBe('test query')
    })
  })

  describe('Debouncing', () => {
    it('debounces search input', async () => {
      const options: SearchOptions = { debounceMs: 100 }
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn, options)

      updateSearch('copper')

      expect(filteredItems.value).toHaveLength(5)

      await vi.waitFor(
        () => {
          expect(filteredItems.value).toHaveLength(2)
        },
        { timeout: 200 },
      )
    })

    it('uses custom debounce value', async () => {
      const options: SearchOptions = { debounceMs: 50 }
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn, options)

      updateSearch('iron')

      await vi.waitFor(
        () => {
          expect(filteredItems.value).toHaveLength(3)
        },
        { timeout: 200 },
      )
    })
  })

  describe('Result Limiting', () => {
    it('applies maxResults limit when searching', async () => {
      const options: SearchOptions = { maxResults: 2 }
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn, options)

      updateSearch('iron')
      await vi.waitFor(() => {
        expect(filteredItems.value).toHaveLength(2)
      })

      expect(filteredItems.value).toEqual([IRON_ORE, IRON_INGOT])
    })

    it('respects maxResults even when more items match', async () => {
      const options: SearchOptions = { maxResults: 1 }
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn, options)

      updateSearch('iron')
      await vi.waitFor(() => {
        expect(filteredItems.value).toHaveLength(1)
      })
    })
  })

  describe('Custom Match Function', () => {
    it('uses custom match function for filtering', async () => {
      const typeMatchFn = (item: ItemOption, query: string) => {
        return item.name.toLowerCase().includes(query)
      }

      const { filteredItems, updateSearch } = useDataSearch(testItems, typeMatchFn)

      updateSearch('ingot')
      await vi.waitFor(() => {
        expect(filteredItems.value).toHaveLength(2)
      })

      expect(filteredItems.value).toEqual([IRON_INGOT, COPPER_INGOT])
    })

    it('supports complex match logic', async () => {
      const complexMatchFn = (item: ItemOption, query: string) => {
        return item.name.toLowerCase().includes(query) || item.value.toLowerCase().includes(query)
      }

      const { filteredItems, updateSearch } = useDataSearch(testItems, complexMatchFn)

      updateSearch('desc_ore')
      await vi.waitFor(() => {
        expect(filteredItems.value).toHaveLength(2)
      })

      expect(filteredItems.value).toEqual([IRON_ORE, COPPER_ORE])
    })
  })

  describe('Reactive Items', () => {
    it('updates filtered items when source items change', async () => {
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn)

      updateSearch('iron')
      await vi.waitFor(() => {
        expect(filteredItems.value).toHaveLength(3)
      })

      testItems.value = [IRON_ROD]
      await nextTick()

      expect(filteredItems.value).toHaveLength(1)
      expect(filteredItems.value[0]).toEqual(IRON_ROD)
    })

    it('refilters when items array is modified', async () => {
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn)

      updateSearch('steel')
      await vi.waitFor(() => {
        expect(filteredItems.value).toHaveLength(0)
      })

      testItems.value.push(STEEL_INGOT)
      await nextTick()

      expect(filteredItems.value).toHaveLength(1)
      expect(filteredItems.value[0]).toEqual(STEEL_INGOT)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      testItems.value = []
      const { filteredItems } = useDataSearch(testItems, matchesFn)

      expect(filteredItems.value).toEqual([])
    })

    it('handles empty search query after searching', async () => {
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn)

      updateSearch('iron')
      await vi.waitFor(() => {
        expect(filteredItems.value).toHaveLength(3)
      })

      updateSearch('')
      await vi.waitFor(() => {
        expect(filteredItems.value).toHaveLength(5)
      })
    })

    it('handles whitespace-only search query', async () => {
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn)

      updateSearch('   ')
      await vi.waitFor(() => {
        expect(filteredItems.value).toHaveLength(5)
      })
    })

    it('handles search query with only whitespace after trim', async () => {
      const options: SearchOptions = { maxNoSearchResults: 3 }
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn, options)

      updateSearch('  \t  ')
      await vi.waitFor(() => {
        expect(filteredItems.value).toHaveLength(3)
      })
    })
  })

  describe('Options Merging', () => {
    it('merges custom options with defaults', async () => {
      const options: SearchOptions = { maxResults: 10 }
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn, options)

      updateSearch('iron')
      await vi.waitFor(() => {
        expect(filteredItems.value.length).toBeLessThanOrEqual(10)
      })
    })

    it('uses default values when options not provided', async () => {
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn)

      updateSearch('i')
      await vi.waitFor(() => {
        expect(filteredItems.value.length).toBeLessThanOrEqual(50)
      })
    })

    it('allows all options to be customized', async () => {
      const options: SearchOptions = {
        debounceMs: 50,
        maxResults: 2,
        maxNoSearchResults: 1,
      }
      const { filteredItems, updateSearch } = useDataSearch(testItems, matchesFn, options)

      expect(filteredItems.value).toHaveLength(1)

      updateSearch('iron')
      await vi.waitFor(
        () => {
          expect(filteredItems.value).toHaveLength(2)
        },
        { timeout: 200 },
      )
    })
  })
})
