import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useRecipeInputForm } from '../useRecipeInputForm'
import type { ItemOption } from '@/types/data'
import type { RecipeEntry } from '@/types/factory'

const buildings = ['Build_SmelterMk1_C', 'Build_FoundryMk1_C']

vi.mock('@/stores', () => ({
  useDataStore: vi.fn(() => ({
    getRecipeProductionBuildings: vi.fn((recipe: string) => {
      if (recipe === 'Recipe_IronIngot_C') {
        return buildings
      }
      return []
    }),
    getIcon: vi.fn((building: string) => `icon-${building.toLowerCase()}`),
  })),
}))

describe('useRecipeInputForm', () => {
  let form: ReturnType<typeof useRecipeInputForm>

  const mockRecipe: ItemOption = {
    value: 'Recipe_IronIngot_C',
    name: 'Iron Ingot',
    icon: 'iron-ingot',
    type: 'recipe',
  }

  const mockBuilding: ItemOption = {
    value: 'Build_SmelterMk1_C',
    name: 'Smelter',
    icon: 'smelter',
    type: 'building',
  }

  beforeEach(() => {
    form = useRecipeInputForm()
  })

  describe('Initial State', () => {
    it('initializes with default values', () => {
      expect(form.selectedRecipe.value).toBeUndefined()
      expect(form.selectedBuilding.value).toBeUndefined()
      expect(form.buildingCount.value).toBe(1)
      expect(form.errorMessage.value).toBe('')
      expect(form.selectedRecipes.value).toEqual([])
    })

    it('initializes with empty production buildings', () => {
      expect(form.productionBuildings.value).toEqual([])
    })

    it('initializes as invalid', () => {
      expect(form.isValid.value).toBe(false)
    })

    it('has no validation error initially', () => {
      expect(form.validationError.value).toBeNull()
    })

    it('has empty display error initially', () => {
      expect(form.displayError.value).toBe('')
    })
  })

  describe('Recipe Selection', () => {
    it('updates selected recipe and clears building when recipe changes', () => {
      form.selectedBuilding.value = mockBuilding

      form.changeRecipe(mockRecipe)

      expect(form.selectedRecipe.value).toStrictEqual(mockRecipe)
      expect(form.selectedBuilding.value).toBeUndefined()
    })

    it('updates production buildings when recipe is selected', () => {
      form.changeRecipe(mockRecipe)

      expect(form.productionBuildings.value).toEqual(buildings)
    })

    it('clears production buildings when recipe is cleared', () => {
      form.changeRecipe(mockRecipe)
      expect(form.productionBuildings.value).toEqual(buildings)

      form.changeRecipe(undefined)

      expect(form.productionBuildings.value).toEqual([])
    })
  })

  describe('Form Validation', () => {
    it('shows no validation error when no recipe is selected', () => {
      expect(form.validationError.value).toBeNull()
    })

    it('requires building selection when recipe is selected', () => {
      form.selectedRecipe.value = mockRecipe

      expect(form.validationError.value).toBe('Please select a building to produce Iron Ingot')
    })

    it('requires building count when building is selected', () => {
      form.selectedRecipe.value = mockRecipe
      form.selectedBuilding.value = mockBuilding
      form.buildingCount.value = 0

      expect(form.validationError.value).toBe('Please enter production count of Iron Ingot')
    })

    it('requires positive building count', () => {
      form.selectedRecipe.value = mockRecipe
      form.selectedBuilding.value = mockBuilding
      form.buildingCount.value = -1

      expect(form.validationError.value).toBe(
        'Production count of Iron Ingot must be a positive number',
      )
    })

    it('is valid when all fields are correctly filled', () => {
      form.selectedRecipe.value = mockRecipe
      form.selectedBuilding.value = mockBuilding
      form.buildingCount.value = 2

      expect(form.validationError.value).toBeNull()
      expect(form.isValid.value).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('sets error message', () => {
      form.setError('Test error')

      expect(form.errorMessage.value).toBe('Test error')
      expect(form.displayError.value).toBe('Test error')
    })

    it('clears error message', () => {
      form.setError('Test error')
      form.clearError()

      expect(form.errorMessage.value).toBe('')
    })

    it('displays validation error when no error message is set', () => {
      form.selectedRecipe.value = mockRecipe

      expect(form.displayError.value).toBe('Please select a building to produce Iron Ingot')
    })

    it('prioritizes error message over validation error', () => {
      form.selectedRecipe.value = mockRecipe
      form.setError('Custom error')

      expect(form.displayError.value).toBe('Custom error')
    })
  })

  describe('Form Reset', () => {
    it('resets all form fields to default values', () => {
      form.selectedRecipe.value = mockRecipe
      form.selectedBuilding.value = mockBuilding
      form.buildingCount.value = 5
      form.setError('Test error')

      form.reset()

      expect(form.selectedRecipe.value).toBeUndefined()
      expect(form.selectedBuilding.value).toBeUndefined()
      expect(form.buildingCount.value).toBe(1)
      expect(form.errorMessage.value).toBe('')
    })
  })

  describe('Recipe Entry Conversion', () => {
    it('converts valid form to recipe entry', () => {
      form.selectedRecipe.value = mockRecipe
      form.selectedBuilding.value = mockBuilding
      form.buildingCount.value = 3

      const entry = form.toRecipeEntry()

      expect(entry).toEqual({
        recipe: 'Recipe_IronIngot_C',
        building: 'Build_SmelterMk1_C',
        count: 3,
        icon: 'icon-build_smeltermk1_c',
      })
    })

    it('throws error when form is invalid', () => {
      form.selectedRecipe.value = mockRecipe

      expect(() => form.toRecipeEntry()).toThrow('Please select a building to produce Iron Ingot')
    })

    it('throws generic error when no validation error exists', () => {
      expect(() => form.toRecipeEntry()).toThrow('Form validation failed')
    })
  })

  describe('Recipe List Management', () => {
    const mockRecipeEntry: RecipeEntry = {
      recipe: 'Recipe_IronIngot_C',
      building: 'Build_SmelterMk1_C',
      count: 2,
      icon: 'icon-build_smeltermk1_c',
    }

    it('adds valid recipe to list and resets form', () => {
      form.selectedRecipe.value = mockRecipe
      form.selectedBuilding.value = mockBuilding
      form.buildingCount.value = 2

      form.addRecipe()

      expect(form.selectedRecipes.value).toHaveLength(1)
      expect(form.selectedRecipes.value[0]).toEqual(mockRecipeEntry)
      expect(form.selectedRecipe.value).toBeUndefined()
      expect(form.selectedBuilding.value).toBeUndefined()
      expect(form.buildingCount.value).toBe(1)
    })

    it('removes recipe by index', () => {
      form.selectedRecipes.value = [
        mockRecipeEntry,
        { ...mockRecipeEntry, recipe: 'Recipe_CopperIngot_C' },
      ]

      form.removeRecipe(0)

      expect(form.selectedRecipes.value).toHaveLength(1)
      expect(form.selectedRecipes.value[0].recipe).toBe('Recipe_CopperIngot_C')
    })

    it('tracks recipe keys from selected recipes', () => {
      const recipe1: RecipeEntry = { ...mockRecipeEntry, recipe: 'Recipe_IronIngot_C' }
      const recipe2: RecipeEntry = { ...mockRecipeEntry, recipe: 'Recipe_CopperIngot_C' }

      form.selectedRecipes.value = [recipe1, recipe2]

      expect(form.recipeKeys.value).toEqual(['Recipe_IronIngot_C', 'Recipe_CopperIngot_C'])
    })

    it('updates recipe keys when recipes change', () => {
      expect(form.recipeKeys.value).toEqual([])

      form.selectedRecipes.value = [mockRecipeEntry]

      expect(form.recipeKeys.value).toEqual(['Recipe_IronIngot_C'])
    })
  })

  describe('Building Count Validation', () => {
    beforeEach(() => {
      form.selectedRecipe.value = mockRecipe
      form.selectedBuilding.value = mockBuilding
    })

    it('accepts positive integers', () => {
      form.buildingCount.value = 5

      expect(form.validationError.value).toBeNull()
      expect(form.isValid.value).toBe(true)
    })

    it('accepts positive decimals', () => {
      form.buildingCount.value = 2.5

      expect(form.validationError.value).toBeNull()
      expect(form.isValid.value).toBe(true)
    })

    it('rejects zero', () => {
      form.buildingCount.value = 0

      expect(form.validationError.value).toBe('Please enter production count of Iron Ingot')
      expect(form.isValid.value).toBe(false)
    })

    it('rejects negative numbers', () => {
      form.buildingCount.value = -1

      expect(form.validationError.value).toBe(
        'Production count of Iron Ingot must be a positive number',
      )
      expect(form.isValid.value).toBe(false)
    })
  })
})
