import { EXTERNAL_RECIPE } from '@/logistics/constants'
import type { Building, Item, Recipe } from '@/types/data'
import type { IDataStore } from '@/types/stores'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock fetch
global.fetch = vi.fn()

// Import the real store implementation directly, bypassing the global mock
vi.doMock('@/stores/data', async () => {
  return await vi.importActual('@/stores/data')
})

const { useDataStore } = await import('../data')

describe('useDataStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Clear any persisted state from previous tests
    const store = useDataStore()
    store.$reset()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useDataStore()

      expect(store.items).toEqual({})
      expect(store.recipes).toEqual({})
      expect(store.buildings).toEqual({})
      expect(store.isLoading).toBe(true)
    })
  })

  // Helper functions for testing - these were removed from the actual store
  const addItemHelper = (store: IDataStore, item: Item) => {
    store.items[item.className] = item
  }

  const addRecipeHelper = (store: IDataStore, recipe: Recipe) => {
    store.recipes[recipe.className] = recipe
  }

  const addBuildingHelper = (store: IDataStore, building: Building) => {
    store.buildings[building.className] = building
  }

  describe('actions', () => {
    describe('recipeIngredients', () => {
      it('should return scaled ingredients for recipe', () => {
        const store = useDataStore()
        const mockRecipe: Recipe = {
          slug: 'iron-ingot',
          name: 'Iron Ingot',
          className: 'Recipe_IronIngot_C',
          alternate: false,
          time: 2,
          inHand: false,
          forBuilding: false,
          inWorkshop: false,
          inMachine: true,
          manualTimeMultiplier: 1,
          ingredients: [{ item: 'Desc_OreIron_C', amount: 1 }],
          products: [{ item: 'Desc_IronIngot_C', amount: 1 }],
          producedIn: ['Desc_SmelterMk1_C'],
          isVariablePower: false,
          minPower: 0,
          maxPower: 0,
        }

        addRecipeHelper(store, mockRecipe)

        const ingredients = store.recipeIngredients(mockRecipe.className)
        expect(ingredients).toEqual([
          { item: mockRecipe.ingredients[0].item, amount: 30 }, // 1 * (60/2) = 30 per minute
        ])
      })

      it('should return empty array for external recipe', () => {
        const store = useDataStore()
        const ingredients = store.recipeIngredients(EXTERNAL_RECIPE)
        expect(ingredients).toEqual([])
      })

      it('should throw error for non-existent recipe', () => {
        const store = useDataStore()
        expect(() => store.recipeIngredients('NonExistent')).toThrow(
          'Recipe not found: NonExistent',
        )
      })
    })

    describe('recipeProducts', () => {
      it('should return scaled products for recipe', () => {
        const store = useDataStore()
        const mockRecipe: Recipe = {
          slug: 'iron-ingot',
          name: 'Iron Ingot',
          className: 'Recipe_IronIngot_C',
          alternate: false,
          time: 2,
          inHand: false,
          forBuilding: false,
          inWorkshop: false,
          inMachine: true,
          manualTimeMultiplier: 1,
          ingredients: [{ item: 'Desc_OreIron_C', amount: 1 }],
          products: [{ item: 'Desc_IronIngot_C', amount: 1 }],
          producedIn: ['Desc_SmelterMk1_C'],
          isVariablePower: false,
          minPower: 0,
          maxPower: 0,
        }

        addRecipeHelper(store, mockRecipe)

        const products = store.recipeProducts(mockRecipe.className)
        expect(products).toEqual([
          { item: mockRecipe.products[0].item, amount: 30 }, // 1 * (60/2) = 30 per minute
        ])
      })

      it('should return empty array for external recipe', () => {
        const store = useDataStore()
        const products = store.recipeProducts(EXTERNAL_RECIPE)
        expect(products).toEqual([])
      })

      it('should throw error for non-existent recipe', () => {
        const store = useDataStore()
        expect(() => store.recipeProducts('NonExistent')).toThrow('Recipe not found: NonExistent')
      })
    })

    describe('getIcon', () => {
      it('should resolve icon for building', () => {
        const store = useDataStore()
        const mockBuilding: Building = {
          slug: 'smelter-mk1',
          icon: '/icons/smelter.png',
          name: 'Smelter Mk.1',
          description: 'Basic smelter',
          className: 'Desc_SmelterMk1_C',
          categories: ['production'],
          buildMenuPriority: 1,
          metadata: {},
          size: { width: 6, length: 9, height: 9 },
        }

        addBuildingHelper(store, mockBuilding)
        expect(store.getIcon(mockBuilding.className)).toBe(mockBuilding.icon)
      })

      it('should resolve icon for item', () => {
        const store = useDataStore()
        const mockItem: Item = {
          slug: 'iron-ore',
          icon: '/icons/iron-ore.png',
          name: 'Iron Ore',
          description: 'Basic iron ore',
          sinkPoints: 1,
          className: 'Desc_OreIron_C',
          stackSize: 100,
          energyValue: 0,
          radioactiveDecay: 0,
          liquid: false,
          fluidColor: { r: 0, g: 0, b: 0, a: 1 },
        }

        addItemHelper(store, mockItem)
        expect(store.getIcon(mockItem.className)).toBe(mockItem.icon)
      })

      it('should resolve icon for recipe using first product', () => {
        const store = useDataStore()
        const mockItem: Item = {
          slug: 'iron-ingot',
          icon: '/icons/iron-ingot.png',
          name: 'Iron Ingot',
          description: 'Smelted iron',
          sinkPoints: 2,
          className: 'Desc_IronIngot_C',
          stackSize: 100,
          energyValue: 0,
          radioactiveDecay: 0,
          liquid: false,
          fluidColor: { r: 0, g: 0, b: 0, a: 1 },
        }

        const mockItem2: Item = {
          slug: 'water',
          icon: '/icons/water.png',
          name: 'Water',
          description: 'Basic water',
          sinkPoints: 1,
          className: 'Desc_Water_C',
          stackSize: 100,
          energyValue: 0,
          radioactiveDecay: 0,
          liquid: true,
          fluidColor: { r: 0, g: 0, b: 0, a: 1 },
        }

        const mockRecipe: Recipe = {
          slug: 'iron-ingot',
          name: 'Iron Ingot Recipe',
          className: 'Recipe_IronIngot_C',
          alternate: false,
          time: 2,
          inHand: false,
          forBuilding: false,
          inWorkshop: false,
          inMachine: true,
          manualTimeMultiplier: 1,
          ingredients: [{ item: 'Desc_OreIron_C', amount: 1 }],
          products: [
            { item: 'Desc_IronIngot_C', amount: 1 },
            { item: 'Desc_Water_C', amount: 1 },
          ],
          producedIn: ['Desc_SmelterMk1_C'],
          isVariablePower: false,
          minPower: 0,
          maxPower: 0,
        }

        addItemHelper(store, mockItem)
        addItemHelper(store, mockItem2)
        addRecipeHelper(store, mockRecipe)

        expect(store.getIcon(mockRecipe.className)).toBe(mockItem.icon)
      })

      it('should throw error for recipe with no products', () => {
        const store = useDataStore()
        const mockRecipe: Recipe = {
          slug: 'empty-recipe',
          name: 'Empty Recipe',
          className: 'Recipe_Empty_C',
          alternate: false,
          time: 2,
          inHand: false,
          forBuilding: false,
          inWorkshop: false,
          inMachine: true,
          manualTimeMultiplier: 1,
          ingredients: [{ item: 'Desc_OreIron_C', amount: 1 }],
          products: [], // No products
          producedIn: ['Desc_SmelterMk1_C'],
          isVariablePower: false,
          minPower: 0,
          maxPower: 0,
        }

        addRecipeHelper(store, mockRecipe)

        expect(() => store.getIcon(mockRecipe.className)).toThrow(
          'Recipe Recipe_Empty_C has no products, please open a bug ticket so an icon can be hard-coded for it.',
        )
      })

      it('should throw error for non-existent object', () => {
        const store = useDataStore()

        expect(() => store.getIcon('NonExistent')).toThrow('Could not resolve icon: NonExistent')
      })

      it('should resolve icon for external recipe using belt item', () => {
        const store = useDataStore()
        const mockBeltItem: Item = {
          slug: 'conveyor-belt-mk1',
          icon: '/icons/conveyor-belt-mk1.png',
          name: 'Conveyor Belt Mk.1',
          description: 'Basic conveyor belt',
          sinkPoints: 2,
          className: 'Desc_ConveyorBeltMk1_C',
          stackSize: 50,
          energyValue: 0,
          radioactiveDecay: 0,
          liquid: false,
          fluidColor: { r: 0, g: 0, b: 0, a: 1 },
        }

        addItemHelper(store, mockBeltItem)

        expect(store.getIcon(EXTERNAL_RECIPE)).toBe(mockBeltItem.icon)
      })
    })

    describe('loadData', () => {
      it('should load data from fetch and update state', async () => {
        const mockData = {
          items: { 'test-item': { name: 'Test Item' } },
          recipes: { 'test-recipe': { name: 'Test Recipe' } },
          buildings: { 'test-building': { name: 'Test Building' } },
        }

        vi.mocked(fetch).mockResolvedValue({
          json: () => Promise.resolve(mockData),
        } as Response)

        const store = useDataStore()
        expect(store.isLoading).toBe(true)

        await store.loadData()

        // Wait for the promise to resolve
        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(fetch).toHaveBeenCalledWith('data.json')
        expect(store.items).toEqual(mockData.items)
        expect(store.recipes).toEqual(mockData.recipes)
        expect(store.buildings).toEqual(mockData.buildings)
        expect(store.isLoading).toBe(false)
      })
    })
  })

  describe('getters', () => {
    describe('getItemDisplayName', () => {
      it('should return formatted item display name', () => {
        const store = useDataStore()
        const mockItem: Item = {
          slug: 'iron-ore',
          icon: '/icons/iron-ore.png',
          name: 'Iron Ore',
          description: 'Basic iron ore',
          sinkPoints: 1,
          className: 'Desc_OreIron_C',
          stackSize: 100,
          energyValue: 0,
          radioactiveDecay: 0,
          liquid: false,
          fluidColor: { r: 0, g: 0, b: 0, a: 1 },
        }

        addItemHelper(store, mockItem)
        expect(store.getItemDisplayName(mockItem.className)).toBe(mockItem.name)
      })

      it('should return external recipe name for external recipe', () => {
        const store = useDataStore()
        expect(store.getItemDisplayName(EXTERNAL_RECIPE)).toBe(EXTERNAL_RECIPE)
      })

      it('should throw error for non-existent item', () => {
        const store = useDataStore()
        expect(() => store.getItemDisplayName('NonExistent')).toThrow('Item not found: NonExistent')
      })
    })

    describe('getRecipeDisplayName', () => {
      it('should return formatted recipe display name', () => {
        const store = useDataStore()
        const mockRecipe: Recipe = {
          slug: 'iron-ingot',
          name: 'Iron Ingot',
          className: 'Recipe_IronIngot_C',
          alternate: false,
          time: 2,
          inHand: false,
          forBuilding: false,
          inWorkshop: false,
          inMachine: true,
          manualTimeMultiplier: 1,
          ingredients: [{ item: 'Desc_OreIron_C', amount: 1 }],
          products: [{ item: 'Desc_IronIngot_C', amount: 1 }],
          producedIn: ['Desc_SmelterMk1_C'],
          isVariablePower: false,
          minPower: 0,
          maxPower: 0,
        }

        addRecipeHelper(store, mockRecipe)
        expect(store.getRecipeDisplayName(mockRecipe.className)).toBe(mockRecipe.name)
      })

      it('should remove "Alternate: " prefix from recipe name', () => {
        const store = useDataStore()
        const mockRecipe: Recipe = {
          slug: 'alt-iron-ingot',
          name: 'Alternate: Iron Ingot',
          className: 'Recipe_IronIngot_C',
          alternate: true,
          time: 2,
          inHand: false,
          forBuilding: false,
          inWorkshop: false,
          inMachine: true,
          manualTimeMultiplier: 1,
          ingredients: [{ item: 'Desc_OreIron_C', amount: 1 }],
          products: [{ item: 'Desc_IronIngot_C', amount: 1 }],
          producedIn: ['Desc_SmelterMk1_C'],
          isVariablePower: false,
          minPower: 0,
          maxPower: 0,
        }

        addRecipeHelper(store, mockRecipe)
        expect(store.getRecipeDisplayName(mockRecipe.className)).toBe(
          mockRecipe.name.replace('Alternate: ', ''),
        )
      })

      it('should return external recipe name for external recipe', () => {
        const store = useDataStore()
        expect(store.getRecipeDisplayName(EXTERNAL_RECIPE)).toBe(EXTERNAL_RECIPE)
      })

      it('should throw error for non-existent recipe', () => {
        const store = useDataStore()
        expect(() => store.getRecipeDisplayName('NonExistent')).toThrow(
          'Recipe not found: NonExistent',
        )
      })
    })

    describe('getBuildingDisplayName', () => {
      it('should return formatted building display name', () => {
        const store = useDataStore()
        const mockBuilding: Building = {
          slug: 'smelter-mk1',
          icon: '/icons/smelter.png',
          name: 'Smelter Mk.1',
          description: 'Basic smelter',
          className: 'Desc_SmelterMk1_C',
          categories: ['production'],
          buildMenuPriority: 1,
          metadata: {},
          size: { width: 6, length: 9, height: 9 },
        }

        addBuildingHelper(store, mockBuilding)
        expect(store.getBuildingDisplayName(mockBuilding.className)).toBe(mockBuilding.name)
      })

      it('should throw error for non-existent building', () => {
        const store = useDataStore()
        expect(() => store.getBuildingDisplayName('NonExistent')).toThrow(
          'Building not found: NonExistent',
        )
      })
    })

    describe('getRecipeProductionBuildings', () => {
      it('should return production buildings for recipe', () => {
        const store = useDataStore()
        const mockRecipe: Recipe = {
          slug: 'iron-ingot',
          name: 'Iron Ingot',
          className: 'Recipe_IronIngot_C',
          alternate: false,
          time: 2,
          inHand: false,
          forBuilding: false,
          inWorkshop: false,
          inMachine: true,
          manualTimeMultiplier: 1,
          ingredients: [{ item: 'Desc_OreIron_C', amount: 1 }],
          products: [{ item: 'Desc_IronIngot_C', amount: 1 }],
          producedIn: ['Desc_SmelterMk1_C', 'Desc_SmelterMk2_C'],
          isVariablePower: false,
          minPower: 0,
          maxPower: 0,
        }

        addRecipeHelper(store, mockRecipe)
        expect(store.getRecipeProductionBuildings(mockRecipe.className)).toEqual(
          mockRecipe.producedIn,
        )
      })

      it('should return empty array for non-existent recipe', () => {
        const store = useDataStore()
        expect(store.getRecipeProductionBuildings('NonExistent')).toEqual([])
      })
    })
  })
})
