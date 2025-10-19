import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockCurrentFactory, mockFactoryStore } from '@/__tests__/fixtures/composables/factoryStore'
import { makeFactory, makeFloor } from '@/__tests__/fixtures/data'
import {
  createMockDataStore,
  mockGetIcon,
  mockGetItemDisplayName,
  mockGetRecipeDisplayName,
} from '@/__tests__/fixtures/stores/dataStore'
import { useFloorManagement } from '@/composables/useFloorManagement'
import type { ItemOption } from '@/types/data'

vi.mock('@/composables/useStores', () => ({
  getStores: vi.fn(() => ({
    dataStore: createMockDataStore(),
    factoryStore: mockFactoryStore,
  })),
}))

describe('useFloorManagement', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Reset mock state
    mockCurrentFactory.value = null
  })

  describe('getFloorDisplayName', () => {
    it('returns floor number only when floor has no name', () => {
      const { getFloorDisplayName } = useFloorManagement()
      const floor = makeFloor([])

      expect(getFloorDisplayName(1, floor)).toBe('Floor 1')
    })

    it('returns floor number with name when floor has name', () => {
      const { getFloorDisplayName } = useFloorManagement()
      const floor = makeFloor([], { name: 'Smelting' })

      expect(getFloorDisplayName(1, floor)).toBe('Floor 1 - Smelting')
    })

    it('formats display name for different floor indices', () => {
      const { getFloorDisplayName } = useFloorManagement()
      const floor = makeFloor([], { name: 'Production' })

      expect(getFloorDisplayName(5, floor)).toBe('Floor 5 - Production')
      expect(getFloorDisplayName(10, floor)).toBe('Floor 10 - Production')
    })
  })

  describe('currentFactoryFloors', () => {
    it('returns empty array when no factory is selected', () => {
      const { currentFactoryFloors } = useFloorManagement()

      expect(currentFactoryFloors.value).toEqual([])
    })

    it('returns floor info for all floors in current factory', () => {
      const floor1 = makeFloor(['Recipe_A'], { name: 'Smelting' })
      const floor2 = makeFloor(['Recipe_B', 'Recipe_C'], { name: 'Production' })
      const factory = makeFactory('Test Factory', [floor1, floor2])

      mockCurrentFactory.value = factory

      const { currentFactoryFloors } = useFloorManagement()

      expect(currentFactoryFloors.value).toHaveLength(2)
      expect(currentFactoryFloors.value[0]).toEqual({
        index: 0,
        floor: floor1,
        displayName: 'Floor 1 - Smelting',
        recipeCount: 1,
      })
      expect(currentFactoryFloors.value[1]).toEqual({
        index: 1,
        floor: floor2,
        displayName: 'Floor 2 - Production',
        recipeCount: 2,
      })
    })
  })

  describe('getEligibleFloors', () => {
    it('returns all floors with specified floor disabled', () => {
      const factory = makeFactory('Test Factory', [
        makeFloor([], { name: 'A' }),
        makeFloor([], { name: 'B' }),
      ])
      mockCurrentFactory.value = factory

      const { getEligibleFloors } = useFloorManagement()
      const eligibleFloors = getEligibleFloors(0)

      expect(eligibleFloors).toHaveLength(2)
      expect(eligibleFloors[0]).toEqual({
        value: 0,
        title: 'Floor 1 - A',
        disabled: true,
      })
      expect(eligibleFloors[1]).toEqual({
        value: 1,
        title: 'Floor 2 - B',
        disabled: false,
      })
    })
  })

  describe('updateFloorName', () => {
    it('updates floor name in factory store', () => {
      const factory = makeFactory('Test Factory', [makeFloor([], { name: 'Old Name' })])
      mockCurrentFactory.value = factory

      const { updateFloorName } = useFloorManagement()
      updateFloorName(0, 'New Name')

      expect(mockCurrentFactory.value!.floors[0].name).toBe('New Name')
    })

    it('sets floor name to undefined', () => {
      const factory = makeFactory('Test Factory', [makeFloor([], { name: 'Old Name' })])
      mockCurrentFactory.value = factory

      const { updateFloorName } = useFloorManagement()
      updateFloorName(0, undefined)

      expect(mockCurrentFactory.value!.floors[0].name).toBeUndefined()
    })

    it('does nothing when factory does not exist', () => {
      const { updateFloorName } = useFloorManagement()

      expect(() => updateFloorName(0, 'New Name')).not.toThrow()
    })

    it('does nothing when floor index is out of bounds', () => {
      const factory = makeFactory('Test Factory', [makeFloor([])])
      mockCurrentFactory.value = factory

      const { updateFloorName } = useFloorManagement()

      expect(() => updateFloorName(99, 'New Name')).not.toThrow()
    })
  })

  describe('updateFloorIcon', () => {
    it('updates floor icon in factory store', () => {
      const factory = makeFactory('Test Factory', [makeFloor([])])
      mockCurrentFactory.value = factory

      const { updateFloorIcon } = useFloorManagement()
      updateFloorIcon(0, 'Desc_IronIngot_C')

      expect(mockCurrentFactory.value!.floors[0].iconItem).toBe('Desc_IronIngot_C')
    })

    it('sets floor icon to undefined', () => {
      const factory = makeFactory('Test Factory', [makeFloor([], { iconItem: 'Desc_IronIngot_C' })])
      mockCurrentFactory.value = factory

      const { updateFloorIcon } = useFloorManagement()
      updateFloorIcon(0, undefined)

      expect(mockCurrentFactory.value!.floors[0].iconItem).toBeUndefined()
    })

    it('does nothing when factory does not exist', () => {
      const { updateFloorIcon } = useFloorManagement()

      expect(() => updateFloorIcon(0, 'Desc_IronIngot_C')).not.toThrow()
    })
  })

  describe('updateFloors', () => {
    it('updates multiple floor properties at once', () => {
      const factory = makeFactory('Test Factory', [makeFloor([]), makeFloor([])])
      mockCurrentFactory.value = factory

      const { updateFloors } = useFloorManagement()
      updateFloors([
        { index: 0, name: 'Floor A', iconItem: 'ItemA' },
        { index: 1, name: 'Floor B', iconItem: 'ItemB' },
      ])

      expect(mockCurrentFactory.value!.floors[0].name).toBe('Floor A')
      expect(mockCurrentFactory.value!.floors[0].iconItem).toBe('ItemA')
      expect(mockCurrentFactory.value!.floors[1].name).toBe('Floor B')
      expect(mockCurrentFactory.value!.floors[1].iconItem).toBe('ItemB')
    })

    it('only updates specified properties', () => {
      const factory = makeFactory('Test Factory', [
        makeFloor([], { name: 'Original', iconItem: 'OriginalIcon' }),
      ])
      mockCurrentFactory.value = factory

      const { updateFloors } = useFloorManagement()
      updateFloors([{ index: 0, name: 'Updated' }])

      expect(mockCurrentFactory.value!.floors[0].name).toBe('Updated')
      expect(mockCurrentFactory.value!.floors[0].iconItem).toBe('OriginalIcon')
    })

    it('skips invalid floor indices', () => {
      const factory = makeFactory('Test Factory', [makeFloor([], {})])
      mockCurrentFactory.value = factory

      const { updateFloors } = useFloorManagement()

      expect(() =>
        updateFloors([
          { index: 0, name: 'Valid' },
          { index: 99, name: 'Invalid' },
        ]),
      ).not.toThrow()
    })
  })

  describe('moveRecipe', () => {
    it('moves recipe from source floor to target floor', () => {
      const factory = makeFactory('Test Factory', [
        makeFloor(['Recipe_A', 'Recipe_B']),
        makeFloor(['Recipe_C']),
      ])
      mockCurrentFactory.value = factory

      const { moveRecipe } = useFloorManagement()
      moveRecipe('Recipe_A', 0, 1)

      expect(mockCurrentFactory.value!.floors[0].recipes).toHaveLength(1)
      expect(mockCurrentFactory.value!.floors[0].recipes[0].recipe.name).toBe('Recipe_B')
      expect(mockCurrentFactory.value!.floors[1].recipes).toHaveLength(2)
      expect(mockCurrentFactory.value!.floors[1].recipes[1].recipe.name).toBe('Recipe_A')
    })

    it('updates recipe batchNumber to target floor index', () => {
      const factory = makeFactory('Test Factory', [makeFloor(['Recipe_A']), makeFloor([])])
      mockCurrentFactory.value = factory

      const { moveRecipe } = useFloorManagement()
      moveRecipe('Recipe_A', 0, 1)

      expect(mockCurrentFactory.value!.floors[1].recipes[0].batchNumber).toBe(1)
    })

    it('does nothing when source and target are same', () => {
      const factory = makeFactory('Test Factory', [makeFloor(['Recipe_A'])])
      mockCurrentFactory.value = factory

      const { moveRecipe } = useFloorManagement()
      moveRecipe('Recipe_A', 0, 0)

      expect(mockCurrentFactory.value!.floors[0].recipes).toHaveLength(1)
    })

    it('does nothing when recipe not found', () => {
      const factory = makeFactory('Test Factory', [makeFloor(['Recipe_A']), makeFloor([])])
      mockCurrentFactory.value = factory

      const { moveRecipe } = useFloorManagement()
      moveRecipe('Recipe_NonExistent', 0, 1)

      expect(mockCurrentFactory.value!.floors[0].recipes).toHaveLength(1)
      expect(mockCurrentFactory.value!.floors[1].recipes).toHaveLength(0)
    })
  })

  describe('Floor Editor Modal', () => {
    it('initializes with closed modal', () => {
      const { showFloorEditor, editFloorIndex } = useFloorManagement()

      expect(showFloorEditor.value).toBe(false)
      expect(editFloorIndex.value).toBe(null)
    })

    it('opens modal for specific floor', () => {
      const { showFloorEditor, editFloorIndex, openFloorEditor } = useFloorManagement()

      openFloorEditor(2)

      expect(showFloorEditor.value).toBe(true)
      expect(editFloorIndex.value).toBe(2)
    })

    it('opens modal for all floors when no index provided', () => {
      const { showFloorEditor, editFloorIndex, openFloorEditor } = useFloorManagement()

      openFloorEditor()

      expect(showFloorEditor.value).toBe(true)
      expect(editFloorIndex.value).toBe(null)
    })

    it('closes modal and resets edit index', () => {
      const { showFloorEditor, editFloorIndex, openFloorEditor, closeFloorEditor } =
        useFloorManagement()

      openFloorEditor(2)
      closeFloorEditor()

      expect(showFloorEditor.value).toBe(false)
      expect(editFloorIndex.value).toBe(null)
    })
  })

  describe('getFloorFormsTemplate', () => {
    it('returns empty array when no factory exists', () => {
      const { getFloorFormsTemplate } = useFloorManagement()

      expect(getFloorFormsTemplate()).toEqual([])
    })

    it('returns form for single floor when editFloorIndex is set', () => {
      const factory = makeFactory('Test Factory', [
        makeFloor([], { name: 'Smelting', iconItem: 'Desc_IronIngot_C' }),
        makeFloor([], { name: 'Production' }),
      ])
      mockCurrentFactory.value = factory

      const { openFloorEditor, getFloorFormsTemplate } = useFloorManagement()
      openFloorEditor(0)

      const forms = getFloorFormsTemplate()

      expect(forms).toHaveLength(1)
      expect(forms[0].index).toBe(0)
      expect(forms[0].name).toBe('Smelting')
      expect(forms[0].item?.value).toBe('Desc_IronIngot_C')
    })

    it('returns forms for all floors when editFloorIndex is null', () => {
      const factory = makeFactory('Test Factory', [
        makeFloor([], { name: 'A' }),
        makeFloor([], { name: 'B' }),
      ])
      mockCurrentFactory.value = factory

      const { openFloorEditor, getFloorFormsTemplate } = useFloorManagement()
      openFloorEditor() // No index = all floors

      const forms = getFloorFormsTemplate()

      expect(forms).toHaveLength(2)
      expect(forms[0].index).toBe(0)
      expect(forms[1].index).toBe(1)
    })

    it('creates ItemOption with dataStore getters', () => {
      const factory = makeFactory('Test Factory', [
        makeFloor([], { name: 'Test', iconItem: 'TestItem' }),
      ])
      mockCurrentFactory.value = factory

      const { openFloorEditor, getFloorFormsTemplate } = useFloorManagement()
      openFloorEditor(0)

      const forms = getFloorFormsTemplate()

      expect(forms[0].item?.value).toBe('TestItem')
      expect(forms[0].item?.type).toBe('item')
      expect(mockGetItemDisplayName).toHaveBeenCalledWith('TestItem')
      expect(mockGetIcon).toHaveBeenCalledWith('TestItem')
    })

    it('handles floor without icon', () => {
      const factory = makeFactory('Test Factory', [makeFloor([], { name: 'Test' })])
      mockCurrentFactory.value = factory

      const { openFloorEditor, getFloorFormsTemplate } = useFloorManagement()
      openFloorEditor(0)

      const forms = getFloorFormsTemplate()

      expect(forms[0].item).toBeUndefined()
      expect(forms[0].originalItem).toBeUndefined()
    })
  })

  describe('hasFloorFormChanges', () => {
    const ITEM_A: ItemOption = { value: 'A', name: 'A', icon: 'a', type: 'item' }
    const ITEM_B: ItemOption = { value: 'B', name: 'B', icon: 'b', type: 'item' }

    it('returns false when no changes', () => {
      const { hasFloorFormChanges } = useFloorManagement()

      const forms = [
        {
          index: 0,
          name: 'Test',
          item: ITEM_A,
          originalName: 'Test',
          originalItem: ITEM_A,
        },
      ]

      expect(hasFloorFormChanges(forms)).toBe(false)
    })

    it('returns true when name changed', () => {
      const { hasFloorFormChanges } = useFloorManagement()

      const forms = [
        {
          index: 0,
          name: 'New',
          item: ITEM_A,
          originalName: 'Old',
          originalItem: ITEM_A,
        },
      ]

      expect(hasFloorFormChanges(forms)).toBe(true)
    })

    it('returns true when item value changed', () => {
      const { hasFloorFormChanges } = useFloorManagement()

      const forms = [
        {
          index: 0,
          name: 'Test',
          item: ITEM_B,
          originalName: 'Test',
          originalItem: ITEM_A,
        },
      ]

      expect(hasFloorFormChanges(forms)).toBe(true)
    })

    it('returns true when at least one form changed', () => {
      const { hasFloorFormChanges } = useFloorManagement()

      const forms = [
        {
          index: 0,
          name: 'Test',
          item: ITEM_A,
          originalName: 'Test',
          originalItem: ITEM_A,
        },
        {
          index: 1,
          name: 'Changed',
          item: ITEM_A,
          originalName: 'Original',
          originalItem: ITEM_A,
        },
      ]

      expect(hasFloorFormChanges(forms)).toBe(true)
    })
  })

  describe('updateFloorsFromForms', () => {
    const ITEM_A: ItemOption = { value: 'ItemA', name: 'A', icon: 'a', type: 'item' }
    const ITEM_B: ItemOption = { value: 'ItemB', name: 'B', icon: 'b', type: 'item' }

    it('only updates changed floors', () => {
      const factory = makeFactory('Test Factory', [
        makeFloor([], { name: 'A', iconItem: 'ItemA' }),
        makeFloor([], { name: 'B', iconItem: 'ItemB' }),
      ])
      mockCurrentFactory.value = factory

      const { updateFloorsFromForms } = useFloorManagement()

      const forms = [
        {
          index: 0,
          name: 'A',
          item: ITEM_A,
          originalName: 'A',
          originalItem: ITEM_A,
        },
        {
          index: 1,
          name: 'B_Updated',
          item: ITEM_B,
          originalName: 'B',
          originalItem: ITEM_B,
        },
      ]

      updateFloorsFromForms(forms)

      expect(mockCurrentFactory.value!.floors[0].name).toBe('A')
      expect(mockCurrentFactory.value!.floors[1].name).toBe('B_Updated')
    })

    it('extracts item value from ItemOption', () => {
      const factory = makeFactory('Test Factory', [makeFloor([])])
      mockCurrentFactory.value = factory

      const { updateFloorsFromForms } = useFloorManagement()

      const forms = [
        {
          index: 0,
          name: 'Test',
          item: ITEM_A,
          originalName: undefined,
          originalItem: undefined,
        },
      ]

      updateFloorsFromForms(forms)

      expect(mockCurrentFactory.value!.floors[0].iconItem).toBe('ItemA')
    })
  })

  describe('floorMatches', () => {
    it('matches by floor display name', () => {
      const { floorMatches } = useFloorManagement()
      const floor = { ...makeFloor([], { name: 'Smelting' }), originalIndex: 0 }

      expect(floorMatches(floor, 'smelt')).toBe(true)
      expect(floorMatches(floor, 'FLOOR 1')).toBe(true)
    })

    it('calls getRecipeDisplayName for recipe matching', () => {
      const { floorMatches } = useFloorManagement()
      const floor = { ...makeFloor(['Recipe_Test']), originalIndex: 0 }

      floorMatches(floor, 'something')

      expect(mockGetRecipeDisplayName).toHaveBeenCalledWith('Recipe_Test')
    })

    it('is case insensitive', () => {
      const { floorMatches } = useFloorManagement()
      const floor = { ...makeFloor([], { name: 'Test' }), originalIndex: 0 }

      expect(floorMatches(floor, 'TEST')).toBe(true)
      expect(floorMatches(floor, 'TeSt')).toBe(true)
    })

    it('returns false when no match', () => {
      const { floorMatches } = useFloorManagement()
      const floor = { ...makeFloor([], { name: 'Smelting' }), originalIndex: 0 }

      expect(floorMatches(floor, 'production')).toBe(false)
    })
  })
})
