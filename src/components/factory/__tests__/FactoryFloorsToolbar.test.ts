import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import FactoryFloorsToolbar from '../FactoryFloorsToolbar.vue'
import { useFactoryStore } from '@/stores/factory'
import { recipeDatabase } from '@/__tests__/fixtures/data/recipes'
import { linkToString, type RecipeNode } from '@/logistics/graph-node'
import type { Factory, Floor } from '@/types/factory'

const mockExpandFloor = vi.fn()
const mockCollapseFloor = vi.fn()

vi.mock('@/composables/useFloorNavigation', () => ({
  useFloorNavigation: () => ({
    expandFloor: mockExpandFloor,
    collapseFloor: mockCollapseFloor,
  }),
}))

const createMockRecipe = (
  recipeKey: string,
  batchNumber: number,
  built = true,
  expanded = false,
): RecipeNode => {
  const recipe = recipeDatabase[recipeKey]
  return {
    recipe: {
      name: recipe.name,
      time: recipe.time,
      ingredients: recipe.ingredients,
      products: recipe.products,
      producedIn: Array.isArray(recipe.producedIn) ? recipe.producedIn[0] : '',
    },
    built,
    expanded,
    batchNumber,
    inputs: [],
    outputs: [],
    availableProducts: [],
    requiredIngredients: [],
  }
}

const createMockFactory = (name: string): Factory => {
  const completeRecipe1 = createMockRecipe('Recipe_IngotIron_C', 0, true, false)
  const incompleteRecipe1 = createMockRecipe('Recipe_IronPlate_C', 0, true, true)
  const completeRecipe2 = createMockRecipe('Recipe_Fake_CopperIngot_C', 1, true, false)
  const incompleteRecipe2 = createMockRecipe('Recipe_IronRod_C', 1, true, true)

  return {
    name,
    icon: 'mdi-factory',
    floors: [
      { name: 'Smelting Floor', recipes: [completeRecipe1, incompleteRecipe1] },
      { name: 'Processing Floor', recipes: [completeRecipe2, incompleteRecipe2] },
    ],
    recipeLinks: {
      [linkToString({
        source: 'external',
        sink: 'Iron Ingot',
        material: 'Desc_OreIron_C',
        amount: 30,
      })]: true,
      [linkToString({
        source: 'Iron Ingot',
        sink: 'external',
        material: 'Desc_IronIngot_C',
        amount: 30,
      })]: true,
      [linkToString({
        source: 'external',
        sink: 'Recipe_Fake_CopperIngot_C',
        material: 'Desc_OreCopper_C',
        amount: 1,
      })]: true,
      [linkToString({
        source: 'Recipe_Fake_CopperIngot_C',
        sink: 'external',
        material: 'Desc_CopperIngot_C',
        amount: 1,
      })]: true,
      [linkToString({
        source: 'external',
        sink: 'Iron Plate',
        material: 'Desc_IronIngot_C',
        amount: 30,
      })]: false,
      [linkToString({
        source: 'Iron Plate',
        sink: 'external',
        material: 'Desc_IronPlate_C',
        amount: 20,
      })]: true,
      [linkToString({
        source: 'external',
        sink: 'Iron Rod',
        material: 'Desc_IronIngot_C',
        amount: 15,
      })]: true,
      [linkToString({
        source: 'Iron Rod',
        sink: 'external',
        material: 'Desc_IronRod_C',
        amount: 15,
      })]: false,
    },
  }
}

describe('FactoryFloorsToolbar', () => {
  let factoryStore: ReturnType<typeof useFactoryStore>

  // DOM interaction helpers
  const clickMenuOption = async (wrapper: VueWrapper, buttonColor: string, optionText: string) => {
    const button = wrapper.find(`[color="${buttonColor}"]`)
    await button.trigger('mouseenter')
    const option = wrapper
      .findAll('.v-list-item')
      .find((item: any) => item.text().includes(optionText))
    if (option) await option.trigger('click')
  }

  const getRecipesByComplete = (complete: boolean) => {
    return (
      factoryStore.currentFactory?.floors.flatMap((floor: Floor) =>
        floor.recipes.filter((recipe) => factoryStore.recipeComplete(recipe) === complete),
      ) || []
    )
  }

  beforeEach(() => {
    factoryStore = useFactoryStore()

    factoryStore.recipeComplete = vi.fn().mockImplementation((recipe: RecipeNode) => {
      return (
        recipe.recipe.name === 'Iron Ingot' || recipe.recipe.name === 'Recipe_Fake_CopperIngot_C'
      )
    })

    mockExpandFloor.mockClear()
    mockCollapseFloor.mockClear()

    const mockFactory = createMockFactory('Test Factory')
    factoryStore.factories['Test Factory'] = mockFactory
    factoryStore.setSelectedFactory('Test Factory')
  })

  const mountComponent = () => mount(FactoryFloorsToolbar)

  describe('complete recipes menu', () => {
    it('shows complete recipes when "Show recipes" is clicked', async () => {
      const wrapper = mountComponent()
      await clickMenuOption(wrapper, 'success', 'Show recipes')

      getRecipesByComplete(true).forEach((recipe: RecipeNode) => {
        expect(recipe.expanded).toBe(true)
      })
      expect(mockExpandFloor).toHaveBeenCalled()
    })

    it('hides complete recipes when "Hide recipes" is clicked', async () => {
      getRecipesByComplete(true).forEach((recipe: RecipeNode) => (recipe.expanded = true))

      const wrapper = mountComponent()
      await clickMenuOption(wrapper, 'success', 'Hide recipes')

      getRecipesByComplete(true).forEach((recipe: RecipeNode) => {
        expect(recipe.expanded).toBe(false)
      })
      expect(mockCollapseFloor).toHaveBeenCalled()
    })
  })

  describe('incomplete recipes menu', () => {
    it('shows incomplete recipes when "Show recipes" is clicked', async () => {
      const wrapper = mountComponent()
      await clickMenuOption(wrapper, 'orange', 'Show recipes')

      getRecipesByComplete(false).forEach((recipe: RecipeNode) => {
        expect(recipe.expanded).toBe(true)
      })
      expect(mockExpandFloor).toHaveBeenCalled()
    })

    it('hides incomplete recipes when "Hide recipes" is clicked', async () => {
      getRecipesByComplete(false).forEach((recipe: RecipeNode) => (recipe.expanded = true))

      const wrapper = mountComponent()
      await clickMenuOption(wrapper, 'orange', 'Hide recipes')

      getRecipesByComplete(false).forEach((recipe: RecipeNode) => {
        expect(recipe.expanded).toBe(false)
      })
      expect(mockCollapseFloor).toHaveBeenCalled()
    })
  })

  describe('mixed scenarios', () => {
    it('handles showing complete recipes while incomplete are hidden', async () => {
      factoryStore.currentFactory!.floors.forEach((floor: Floor) => {
        floor.recipes.forEach((recipe: RecipeNode) => {
          recipe.expanded = !factoryStore.recipeComplete(recipe)
        })
      })

      const wrapper = mountComponent()
      await clickMenuOption(wrapper, 'success', 'Show recipes')

      factoryStore.currentFactory!.floors.forEach((floor: Floor) => {
        floor.recipes.forEach((recipe: RecipeNode) => {
          expect(recipe.expanded).toBe(true)
        })
      })
    })
  })

  describe('edit floors button', () => {
    it('emits edit-all-floors event when clicked', async () => {
      const wrapper = mountComponent()
      await wrapper.find('[color="secondary"]').trigger('click')

      expect(wrapper.emitted('edit-all-floors')).toBeTruthy()
      expect(wrapper.emitted('edit-all-floors')).toHaveLength(1)
    })

    it('displays correct text and icon', () => {
      const wrapper = mountComponent()
      const editButton = wrapper.find('[color="secondary"]')

      expect(editButton.exists()).toBe(true)
      expect(editButton.text()).toContain('Edit Floors')
    })
  })

  describe('floor expansion logic', () => {
    it('expands floors when recipes are shown', async () => {
      const wrapper = mountComponent()
      await clickMenuOption(wrapper, 'success', 'Show recipes')

      expect(mockExpandFloor).toHaveBeenCalled()
    })

    it('collapses floors when all recipes on a floor are hidden', async () => {
      factoryStore.currentFactory!.floors[0].recipes.forEach((recipe: RecipeNode) => {
        recipe.expanded = !factoryStore.recipeComplete(recipe)
      })

      const wrapper = mountComponent()
      await clickMenuOption(wrapper, 'orange', 'Hide recipes')

      expect(mockCollapseFloor).toHaveBeenCalled()
    })
  })
})
