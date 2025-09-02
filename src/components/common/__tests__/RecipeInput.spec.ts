import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import RecipeInput from '@/components/common/RecipeInput.vue'
import { useDataStore } from '@/stores/data'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { itemDatabase, buildingDatabase, recipeDatabase } from '@/__tests__/fixtures/data'
import { type RecipeData } from '@/__tests__/fixtures/types/dataStore'
import { type RecipeOption } from '@/types/data'
import type { RecipeEntry } from '@/types/factory'
import { getStubs, SupportedStubs } from '@/__tests__/componentStubs'

// Import the component test setup
import '@/components/__tests__/component-setup'

// Mock the data store
vi.mock('@/stores/data', () => ({
  useDataStore: vi.fn(),
}))

const multiBuildingRecipe = 'Recipe_PureCateriumIngot_C'
const fakeBuildingOptions = ['Desc_OilRefinery_C', 'Desc_Blender_C']

describe('RecipeInput', () => {
  let mockDataStore: ReturnType<typeof useDataStore>
  let pinia: Pinia

  // Add producedIn field to existing recipes for testing
  const mockRecipes = Object.keys(recipeDatabase)
    .slice(0, 10)
    .reduce(
      (acc, key) => {
        acc[key] = {
          ...recipeDatabase[key],
          producedIn:
            key === multiBuildingRecipe
              ? fakeBuildingOptions // Multi-building recipe for testing
              : (recipeDatabase[key] as RecipeData).producedIn,
          time: 2,
        }
        return acc
      },
      {} as Record<string, RecipeData>,
    )

  beforeEach(() => {
    vi.clearAllMocks()

    pinia = createPinia()
    setActivePinia(pinia)

    mockDataStore = {
      recipes: mockRecipes,
      buildings: buildingDatabase,
      items: itemDatabase,
      getRecipeDisplayName: vi.fn((recipeName: string) => {
        return (
          recipeDatabase[recipeName]?.name || recipeName.replace('Recipe_', '').replace('_C', '')
        )
      }),
      getBuildingDisplayName: vi.fn((buildingName: string) => {
        return buildingDatabase[buildingName]?.name || buildingName
      }),
      recipeProducts: vi.fn(
        (recipeName: string) =>
          recipeDatabase[recipeName]?.products || [{ item: 'Desc_IronIngot_C', amount: 1 }],
      ),
    } as unknown as ReturnType<typeof useDataStore>
    vi.mocked(useDataStore).mockImplementation(() => mockDataStore)
  })

  const triggerSearch = async (wrapper: ReturnType<typeof mount>, searchText: string) => {
    wrapper.vm.searchInput = searchText
    // Wait for debounced search (200ms + extra time)
    await new Promise((resolve) => setTimeout(resolve, 250))
    await wrapper.vm.$nextTick()
  }

  const mountRecipeInput = (props = {}) => {
    return mount(RecipeInput, {
      props: {
        modelValue: [],
        ...props,
      },
      global: {
        stubs: getStubs(SupportedStubs.CachedIcon),
      },
    })
  }

  describe('Recipe Search and Filtering', () => {
    it('filters recipes based on search text', async () => {
      const wrapper = mountRecipeInput()

      await triggerSearch(wrapper, 'ingot')

      const filteredOptions = wrapper.vm.recipeOptions
      expect(filteredOptions.length).toBeGreaterThan(0)
      expect(
        filteredOptions.every((option: RecipeOption) =>
          option.title.toLowerCase().includes('ingot'),
        ),
      ).toBe(true)
    })

    it('limits recipe options to 20 results', () => {
      const wrapper = mountRecipeInput()

      const filteredOptions = wrapper.vm.recipeOptions
      expect(filteredOptions.length).toBeLessThanOrEqual(20)
    })

    it('excludes already selected recipes from options', () => {
      const firstRecipeKey = Object.keys(mockRecipes)[0]
      const selectedRecipes: RecipeEntry[] = [
        {
          recipe: firstRecipeKey,
          building: 'Desc_ConstructorMk1_C',
          count: 2,
          icon: 'desc-constructormk1-c',
        },
      ]

      const wrapper = mountRecipeInput({ modelValue: selectedRecipes })

      const allOptions = wrapper.vm.allRecipeOptions
      expect(allOptions.every((option: RecipeOption) => option.value !== firstRecipeKey)).toBe(true)
    })

    it('sorts recipe options alphabetically by title', () => {
      const wrapper = mountRecipeInput()

      const allOptions = wrapper.vm.allRecipeOptions
      const titles = allOptions.map((option: RecipeOption) => option.title)
      const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b))

      expect(titles).toEqual(sortedTitles)
    })

    it('debounces search input updates', async () => {
      const wrapper = mountRecipeInput()

      // Rapidly change search input
      wrapper.vm.searchInput = 'ingot'

      // Before debounce timeout, debouncedSearch should still be empty
      expect(wrapper.vm.debouncedSearch).toBe('')

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 250))
      expect(wrapper.vm.debouncedSearch).toBe('ingot')
    })
  })

  describe('Add Button Validation', () => {
    it('disables add button when no recipe is selected', () => {
      const wrapper = mountRecipeInput()

      expect(wrapper.vm.canAddRecipe).toBe(false)
      expect(wrapper.vm.selectedRecipe).toBe('')
    })

    it('disables add button when no building is selected', async () => {
      const wrapper = mountRecipeInput()

      // Use multi-building recipe to ensure building selection is required
      wrapper.vm.selectedRecipe = multiBuildingRecipe
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.canAddRecipe).toBe(false)
    })

    it('disables add button for zero or negative building count', async () => {
      const wrapper = mountRecipeInput()

      const firstRecipeKey = Object.keys(mockRecipes)[0]
      wrapper.vm.selectedRecipe = firstRecipeKey
      wrapper.vm.selectedBuilding = 'Desc_ConstructorMk1_C'
      wrapper.vm.buildingCount = 0
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.canAddRecipe).toBe(false)

      wrapper.vm.buildingCount = -5
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.canAddRecipe).toBe(false)

      wrapper.vm.buildingCount = 3
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.canAddRecipe).toBe(true)
    })

    it('enables add button when all fields are valid', async () => {
      const wrapper = mountRecipeInput()

      const firstRecipeKey = Object.keys(mockRecipes)[0]
      wrapper.vm.selectedRecipe = firstRecipeKey
      wrapper.vm.selectedBuilding = 'Desc_ConstructorMk1_C'
      wrapper.vm.buildingCount = 2
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.canAddRecipe).toBe(true)
    })
  })

  describe('Building Selection', () => {
    it('auto-selects building when recipe has only one building option', async () => {
      const wrapper = mountRecipeInput()

      const singleBuildingRecipe = Object.keys(mockRecipes).find(
        (key) => mockRecipes[key].producedIn.length === 1,
      )!

      wrapper.vm.selectedRecipe = singleBuildingRecipe
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.buildingOptions).toHaveLength(1)
      expect(wrapper.vm.selectedBuilding).toBe(mockRecipes[singleBuildingRecipe].producedIn[0])
    })

    it('does not auto-select when recipe has multiple building options', async () => {
      const wrapper = mountRecipeInput()

      wrapper.vm.selectedRecipe = multiBuildingRecipe // Has multiple buildings
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.buildingOptions.length).toBeGreaterThan(1)
      expect(wrapper.vm.selectedBuilding).toBe('')
    })

    it('provides correct building options for selected recipe', async () => {
      const wrapper = mountRecipeInput()

      wrapper.vm.selectedRecipe = multiBuildingRecipe
      await wrapper.vm.$nextTick()

      const buildingOptions = wrapper.vm.buildingOptions
      expect(buildingOptions).toHaveLength(2)
      expect(buildingOptions.map((opt: RecipeOption) => opt.value)).toEqual(fakeBuildingOptions)
    })

    it('clears building selection when recipe changes to multi-building recipe', async () => {
      const wrapper = mountRecipeInput()

      // Set up initial recipe with auto-selected building
      const singleBuildingRecipe = Object.keys(mockRecipes).find(
        (key) => mockRecipes[key].producedIn.length === 1,
      )!

      wrapper.vm.selectedRecipe = singleBuildingRecipe
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.selectedBuilding).toBe(mockRecipes[singleBuildingRecipe].producedIn[0])

      // Change to multi-building recipe
      wrapper.vm.selectedRecipe = multiBuildingRecipe
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedBuilding).toBe('')
    })

    it('sets building selectionwhen recipe changes to single-building recipe ', () => {
      // TODO: implement
    })
  })

  describe('Recipe Addition and Removal', () => {
    it('adds recipe when add button is clicked', async () => {
      const wrapper = mountRecipeInput()

      const firstRecipeKey = Object.keys(mockRecipes)[0]
      const buildingKey = mockRecipes[firstRecipeKey].producedIn[0]
      wrapper.vm.selectedRecipe = firstRecipeKey
      wrapper.vm.selectedBuilding = buildingKey
      wrapper.vm.buildingCount = 3
      await wrapper.vm.$nextTick()

      wrapper.vm.addRecipe()
      await nextTick()

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted![0][0]).toEqual([
        {
          recipe: firstRecipeKey,
          building: buildingKey,
          count: 3,
          icon: buildingDatabase[buildingKey].icon,
        },
      ])
    })

    it('resets form after adding recipe', async () => {
      const wrapper = mountRecipeInput()

      const firstRecipeKey = Object.keys(mockRecipes)[0]
      wrapper.vm.selectedRecipe = firstRecipeKey
      wrapper.vm.selectedBuilding = 'Desc_ConstructorMk1_C'
      wrapper.vm.buildingCount = 3
      await wrapper.vm.$nextTick()

      wrapper.vm.addRecipe()
      await nextTick()

      expect(wrapper.vm.selectedRecipe).toBe('')
      expect(wrapper.vm.selectedBuilding).toBe('')
      expect(wrapper.vm.buildingCount).toBe(1)
    })

    it('removes recipe when remove button is clicked', async () => {
      const firstRecipeKey = Object.keys(mockRecipes)[0]
      const secondRecipeKey = Object.keys(mockRecipes)[1]

      const existingRecipes: RecipeEntry[] = [
        {
          recipe: firstRecipeKey,
          building: 'Desc_ConstructorMk1_C',
          count: 2,
          icon: 'desc-constructormk1-c',
        },
        {
          recipe: secondRecipeKey,
          building: 'Desc_ConstructorMk1_C',
          count: 1,
          icon: 'desc-constructormk1-c',
        },
      ]

      const wrapper = mountRecipeInput({ modelValue: existingRecipes })

      wrapper.vm.removeRecipe(0)
      await nextTick()

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted![0][0]).toEqual([
        {
          recipe: secondRecipeKey,
          building: 'Desc_ConstructorMk1_C',
          count: 1,
          icon: 'desc-constructormk1-c',
        },
      ])
    })

    it('displays existing recipes correctly', () => {
      const firstRecipeKey = Object.keys(mockRecipes)[0]
      const existingRecipes: RecipeEntry[] = [
        {
          recipe: firstRecipeKey,
          building: 'Desc_ConstructorMk1_C',
          count: 2,
          icon: 'desc-constructormk1-c',
        },
      ]

      const wrapper = mountRecipeInput({ modelValue: existingRecipes })

      expect(wrapper.text()).toContain('Selected Recipes')
      expect(wrapper.text()).toContain('2x Constructor')
    })
  })

  describe('No Results Display', () => {
    it('has empty state when no recipes are available', () => {
      mockDataStore.recipes = {}

      const wrapper = mountRecipeInput()

      expect(wrapper.vm.allRecipeOptions).toHaveLength(0)
      expect(wrapper.vm.recipeOptions).toHaveLength(0)
    })

    it('shows initial recipes when no search text is entered', () => {
      const wrapper = mountRecipeInput()

      expect(wrapper.vm.searchInput).toBe('')
      expect(wrapper.vm.debouncedSearch).toBe('')
      expect(wrapper.vm.recipeOptions.length).toBeGreaterThan(0)
    })

    it('has empty results when search yields no matches', async () => {
      const wrapper = mountRecipeInput()

      await triggerSearch(wrapper, 'nonexistentrecipe123')

      expect(wrapper.vm.recipeOptions).toHaveLength(0)
      expect(wrapper.vm.searchInput).toBe('nonexistentrecipe123')
      expect(wrapper.vm.debouncedSearch).toBe('nonexistentrecipe123')
    })
  })
})
