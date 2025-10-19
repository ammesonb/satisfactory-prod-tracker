import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'

import {
  mockCurrentFactory,
  mockFactoryStore,
  mockGetRecipeByName,
} from '@/__tests__/fixtures/composables/factoryStore'
import { makeMaterial, makeRecipeNode } from '@/__tests__/fixtures/data'
import { createMockDataStore } from '@/__tests__/fixtures/stores/dataStore'
import { useLinkData } from '@/composables/useLinkData'
import { EXTERNAL_RECIPE } from '@/logistics/constants'
import type { Factory } from '@/types/factory'

vi.mock('@/composables/useStores', () => ({
  getStores: vi.fn(() => ({
    dataStore: createMockDataStore(),
    factoryStore: mockFactoryStore,
  })),
}))

describe('useLinkData', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockCurrentFactory.value = null
  })

  describe('linkId', () => {
    it('generates unique identifier for material link', () => {
      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C'),
      )
      const type = computed(() => 'input' as const)

      const { linkId } = useLinkData(link, type)

      expect(linkId.value).toContain('Desc_IronIngot_C')
      expect(linkId.value).toContain('Recipe_IronIngot_C')
    })
  })

  describe('materialItem', () => {
    it('returns material item data', () => {
      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C'),
      )
      const type = computed(() => 'input' as const)

      const { materialItem } = useLinkData(link, type)

      expect(materialItem.value.name).toBe('Iron Ingot')
    })
  })

  describe('linkTarget', () => {
    it('returns source for input type', () => {
      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C'),
      )
      const type = computed(() => 'input' as const)

      const { linkTarget } = useLinkData(link, type)

      expect(linkTarget.value).toBe('Recipe_IronIngot_C')
    })

    it('returns sink for output type', () => {
      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C'),
      )
      const type = computed(() => 'output' as const)

      const { linkTarget } = useLinkData(link, type)

      expect(linkTarget.value).toBe('Recipe_IronPlate_C')
    })
  })

  describe('isRecipe', () => {
    it('returns true for recipe targets', () => {
      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', 'Recipe_Fake_IronIngot_C', 'Recipe_IronPlate_C'),
      )
      const type = computed(() => 'input' as const)

      const { isRecipe } = useLinkData(link, type)

      expect(isRecipe.value).toBe(true)
    })

    it('returns false for non-recipe targets', () => {
      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', 'Desc_OreIron_C', 'Recipe_IronPlate_C'),
      )
      const type = computed(() => 'input' as const)

      const { isRecipe } = useLinkData(link, type)

      expect(isRecipe.value).toBe(false)
    })
  })

  describe('targetRecipe', () => {
    it('returns recipe node for recipe targets', () => {
      const recipe = makeRecipeNode('Recipe_Fake_IronIngot_C', 2)
      mockCurrentFactory.value = {
        name: 'Test Factory',
        floors: [
          {
            recipes: [recipe],
          },
        ],
      } as unknown as Factory
      mockGetRecipeByName.mockReturnValue(recipe)

      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', 'Recipe_Fake_IronIngot_C', 'Recipe_IronPlate_C'),
      )
      const type = computed(() => 'input' as const)

      const { targetRecipe } = useLinkData(link, type)

      expect(targetRecipe.value).toEqual(recipe)
    })

    it('returns null for non-recipe targets', () => {
      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', 'Desc_OreIron_C', 'Recipe_IronPlate_C'),
      )
      const type = computed(() => 'input' as const)

      const { targetRecipe } = useLinkData(link, type)

      expect(targetRecipe.value).toBeNull()
    })
  })

  describe('displayName', () => {
    it('returns empty string for empty targets', () => {
      const link = computed(() => makeMaterial('Desc_IronIngot_C', '', 'Recipe_IronPlate_C'))
      const type = computed(() => 'input' as const)

      const { displayName } = useLinkData(link, type)

      expect(displayName.value).toBe('')
    })

    it('formats recipe names with floor number', () => {
      const recipe = makeRecipeNode('Recipe_Fake_IronIngot_C', 2)
      mockCurrentFactory.value = {
        name: 'Test Factory',
        floors: [{ recipes: [recipe] }],
      } as unknown as Factory
      mockGetRecipeByName.mockReturnValue(recipe)

      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', 'Recipe_Fake_IronIngot_C', 'Recipe_IronPlate_C'),
      )
      const type = computed(() => 'input' as const)

      const { displayName } = useLinkData(link, type)

      expect(displayName.value).toBe('Recipe_Fake_IronIngot_C (Floor 3)')
    })

    it('calculates floor number as batchNumber + 1', () => {
      const recipe = makeRecipeNode('Recipe_Fake_IronIngot_C', 0)
      mockCurrentFactory.value = {
        name: 'Test Factory',
        floors: [{ recipes: [recipe] }],
      } as unknown as Factory
      mockGetRecipeByName.mockReturnValue(recipe)

      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', 'Recipe_Fake_IronIngot_C', 'Recipe_IronPlate_C'),
      )
      const type = computed(() => 'input' as const)

      const { displayName } = useLinkData(link, type)

      expect(displayName.value).toBe('Recipe_Fake_IronIngot_C (Floor 1)')
    })

    it('adds resource suffix for input items', () => {
      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', 'Desc_OreIron_C', 'Recipe_IronPlate_C'),
      )
      const type = computed(() => 'input' as const)

      const { displayName } = useLinkData(link, type)

      expect(displayName.value).toBe('Iron Ore (Resource)')
    })

    it('adds surplus suffix for output items', () => {
      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Desc_IronIngot_C'),
      )
      const type = computed(() => 'output' as const)

      const { displayName } = useLinkData(link, type)

      expect(displayName.value).toBe('Iron Ingot Surplus')
    })

    it('omits suffix for external recipe inputs', () => {
      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', EXTERNAL_RECIPE, 'Recipe_IronPlate_C'),
      )
      const type = computed(() => 'input' as const)

      const { displayName } = useLinkData(link, type)

      expect(displayName.value).toBe(EXTERNAL_RECIPE)
    })

    it('omits suffix for external recipe outputs', () => {
      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', EXTERNAL_RECIPE),
      )
      const type = computed(() => 'output' as const)

      const { displayName } = useLinkData(link, type)

      expect(displayName.value).toBe(EXTERNAL_RECIPE)
    })
  })

  describe('transportIcon', () => {
    it('returns belt icon for solid materials', () => {
      const link = computed(() =>
        makeMaterial('Desc_IronIngot_C', 'Recipe_IronIngot_C', 'Recipe_IronPlate_C'),
      )
      const type = computed(() => 'input' as const)

      const { transportIcon } = useLinkData(link, type)

      expect(transportIcon.value).toBe('desc-conveyorbeltmk1-c')
    })

    it('returns pipeline icon for fluid materials', () => {
      const link = computed(() =>
        makeMaterial('Desc_Water_C', 'Desc_Water_C', 'Recipe_IronIngot_C'),
      )
      const type = computed(() => 'input' as const)

      const { transportIcon } = useLinkData(link, type)

      expect(transportIcon.value).toBe('desc-pipeline-c')
    })
  })
})
