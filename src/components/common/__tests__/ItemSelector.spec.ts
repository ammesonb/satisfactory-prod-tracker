import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ItemSelector from '@/components/common/ItemSelector.vue'
import { useDataStore } from '@/stores/data'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { itemDatabase, buildingDatabase } from '@/__tests__/fixtures/data'
import type { ItemOption } from '@/types/data'
import { getStubs, SupportedStubs, setComponentData } from '@/__tests__/componentStubs'
import '@/components/__tests__/component-setup'

vi.mock('@/stores/data', () => ({
  useDataStore: vi.fn(),
}))

describe('ItemSelector', () => {
  let mockDataStore: ReturnType<typeof useDataStore>
  let pinia: Pinia

  const mockItems = [
    'Desc_IronIngot_C',
    'Desc_CopperIngot_C',
    'Desc_GoldIngot_C',
    'Desc_IronPlate_C',
    'Desc_IronRod_C',
    'Desc_IronScrew_C',
    'Desc_ModularFrame_C',
    'Desc_Rubber_C',
    'Desc_PolymerResin_C',
    'Desc_Plastic_C',
    'Desc_HeavyOilResidue_C',
  ].reduce(
    (acc, item) => ({
      ...acc,
      [item]: {
        name: itemDatabase[item].name,
        icon: itemDatabase[item].icon,
      },
    }),
    {} as Record<string, { name: string; icon: string }>,
  )

  beforeEach(() => {
    vi.clearAllMocks()

    pinia = createPinia()
    setActivePinia(pinia)

    mockDataStore = {
      items: mockItems,
      buildings: buildingDatabase,
    } as unknown as ReturnType<typeof useDataStore>
    vi.mocked(useDataStore).mockImplementation(() => mockDataStore)
  })

  const triggerSearch = async (wrapper: ReturnType<typeof mount>, searchText: string) => {
    setComponentData(wrapper, { searchInput: searchText })
    // Wait for debounced search (200ms + extra time)
    await new Promise((resolve) => setTimeout(resolve, 250))
    await wrapper.vm.$nextTick()
  }

  const mountItemSelector = (props = {}) => {
    return mount(ItemSelector, {
      props,
      global: {
        stubs: getStubs(SupportedStubs.CachedIcon),
      },
    })
  }

  describe('Items Inclusion', () => {
    it('includes only items when includeBuildings is false', () => {
      const wrapper = mountItemSelector({
        includeBuildings: false,
      })

      const allItems = wrapper.vm.allItems
      expect(allItems.every((item: ItemOption) => item.type === 'item')).toBe(true)
      expect(
        allItems.some((item: ItemOption) => item.name === itemDatabase.Desc_IronIngot_C.name),
      ).toBe(true)
      expect(
        allItems.some(
          (item: ItemOption) => item.name === buildingDatabase.Desc_ConstructorMk1_C.name,
        ),
      ).toBe(false)
    })

    it('includes items and buildings when includeBuildings is true (default)', () => {
      const wrapper = mountItemSelector()

      const allItems = wrapper.vm.allItems
      const items = allItems.filter((item: ItemOption) => item.type === 'item')
      const buildings = allItems.filter((item: ItemOption) => item.type === 'building')

      expect(items.length).toBe(Object.keys(mockItems).length)
      expect(buildings.length).toBe(Object.keys(buildingDatabase).length)
      expect(
        allItems.some((item: ItemOption) => item.name === itemDatabase.Desc_IronIngot_C.name),
      ).toBe(true)
      expect(
        allItems.some(
          (item: ItemOption) => item.name === buildingDatabase.Desc_ConstructorMk1_C.name,
        ),
      ).toBe(true)
    })
  })

  describe('Search Filtering', () => {
    it('filters items based on search text', async () => {
      const wrapper = mountItemSelector()

      await triggerSearch(wrapper, 'iron')

      const filteredItems = wrapper.vm.filteredItems
      expect(filteredItems.length).toBeGreaterThan(0)
      expect(
        filteredItems.every((item: ItemOption) => item.name.toLowerCase().includes('iron')),
      ).toBe(true)
    })

    it('returns multiple matches when search text matches multiple items', async () => {
      const wrapper = mountItemSelector()

      await triggerSearch(wrapper, 'ingot')

      const filteredItems = wrapper.vm.filteredItems
      expect(filteredItems.length).toBeGreaterThan(1)
      expect(
        filteredItems.every((item: ItemOption) => item.name.toLowerCase().includes('ingot')),
      ).toBe(true)
    })

    it('is case insensitive', async () => {
      const wrapper = mountItemSelector()

      await triggerSearch(wrapper, 'IRON')
      const filteredItems = wrapper.vm.filteredItems
      expect(
        filteredItems.some((item: ItemOption) => item.name.toLowerCase().includes('iron')),
      ).toBe(true)
    })
  })

  describe('Item Limits and Sorting', () => {
    it('shows only first 20 items when no search query', () => {
      const wrapper = mountItemSelector()

      const filteredItems = wrapper.vm.filteredItems
      expect(filteredItems).toHaveLength(20)
    })

    it('sorts items alphabetically by name', () => {
      const wrapper = mountItemSelector()

      const allItems = wrapper.vm.allItems
      const itemNames = allItems.map((item: ItemOption) => item.name)
      const sortedNames = [...itemNames].sort((a, b) => a.localeCompare(b))

      expect(itemNames).toEqual(sortedNames)
    })
  })

  describe('Value Emission and Updates', () => {
    it('emits update:modelValue when item is selected', async () => {
      const wrapper = mountItemSelector()

      const testItem: ItemOption = {
        value: 'Desc_IronIngot_C',
        name: itemDatabase.Desc_IronIngot_C.name,
        icon: itemDatabase.Desc_IronIngot_C.icon,
        type: 'item',
      }

      wrapper.vm.updateValue(testItem)
      await nextTick()

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted![0][0]).toEqual(testItem)
    })

    it('emits undefined when item is cleared', async () => {
      const wrapper = mountItemSelector()

      wrapper.vm.updateValue(null)
      await nextTick()

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted![0][0]).toBeUndefined()
    })

    it('updates selectedItem computed when modelValue prop changes', async () => {
      const testItem: ItemOption = {
        value: 'Desc_IronIngot_C',
        name: itemDatabase.Desc_IronIngot_C.name,
        icon: itemDatabase.Desc_IronIngot_C.icon,
        type: 'item',
      }

      const wrapper = mountItemSelector({
        modelValue: testItem,
      })

      expect(wrapper.vm.selectedItem?.value).toBe(testItem.value)

      await wrapper.setProps({ modelValue: undefined })
      expect(wrapper.vm.selectedItem).toBeUndefined()
    })
  })

  describe('No Items Found Display', () => {
    it('has empty state when no items are available', () => {
      // Create a wrapper with empty data store
      const emptyMockDataStore = {
        items: {},
        buildings: {},
      } as unknown as ReturnType<typeof useDataStore>
      vi.mocked(useDataStore).mockImplementation(() => emptyMockDataStore)

      const wrapper = mountItemSelector()

      // Verify the component state that would drive the "Loading items..." template
      expect(wrapper.vm.allItems).toHaveLength(0)
      expect(wrapper.vm.filteredItems).toHaveLength(0)
      expect(wrapper.vm.searchInput).toBe('')

      // Verify autocomplete receives empty items array
      const autocomplete = wrapper.findComponent({ name: 'VAutocomplete' })
      expect(autocomplete.props('items')).toHaveLength(0)
    })

    it('shows initial items when no search text is entered', () => {
      const wrapper = mountItemSelector()

      // Verify initial state - should show first 20 items, no search
      expect(wrapper.vm.searchInput).toBe('')
      expect(wrapper.vm.debouncedSearch).toBe('')
      expect(wrapper.vm.filteredItems.length).toBe(20) // Should show exactly 20 items
      expect(wrapper.vm.allItems.length).toBeGreaterThan(20) // We have more items available
    })

    it('has empty results when search yields no matches', async () => {
      const wrapper = mountItemSelector()

      await triggerSearch(wrapper, 'nonexistentitem123')

      // Verify the state that would drive "No items found" message
      expect(wrapper.vm.filteredItems).toHaveLength(0)
      expect(wrapper.vm.searchInput).toBe('nonexistentitem123')
      expect(wrapper.vm.debouncedSearch).toBe('nonexistentitem123')

      // Verify autocomplete receives empty items array (triggers no-data slot)
      const autocomplete = wrapper.findComponent({ name: 'VAutocomplete' })
      expect(autocomplete.props('items')).toHaveLength(0)
    })
  })

  describe('Component Props', () => {
    it('uses default placeholder text', () => {
      const wrapper = mountItemSelector()

      // Check the props directly since Vuetify might not render placeholder as HTML attribute
      expect(wrapper.props('placeholder')).toBe('Search for an item...')
    })

    it('uses custom placeholder when provided', () => {
      const customPlaceholder = 'Choose an item...'
      const wrapper = mountItemSelector({
        placeholder: customPlaceholder,
      })

      expect(wrapper.props('placeholder')).toBe(customPlaceholder)
    })

    it('disables component when disabled prop is true', () => {
      const wrapper = mountItemSelector({
        disabled: true,
      })

      expect(wrapper.props('disabled')).toBe(true)
    })
  })

  describe('Debounced Search', () => {
    it('debounces search input updates', async () => {
      const wrapper = mountItemSelector()

      // Rapidly change search input
      setComponentData(wrapper, { searchInput: 'iron' })

      // Before debounce timeout, debouncedSearch should still be empty
      expect(wrapper.vm.debouncedSearch).toBe('')

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 250))
      expect(wrapper.vm.debouncedSearch).toBe('iron')
    })
  })
})
