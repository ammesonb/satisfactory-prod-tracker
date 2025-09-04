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
import {
  getStubs,
  SupportedStubs,
  setComponentData,
  setComponentDataAndTick,
  getVmProperty,
} from '@/__tests__/componentStubs'

vi.mock('@/stores/data', () => ({
  useDataStore: vi.fn(),
}))

const multiBuildingRecipe = 'Recipe_PureCateriumIngot_C'
const fakeBuildingOptions = ['Desc_OilRefinery_C', 'Desc_Blender_C']

// Component property constants
const COMPONENT_PROPS = {
  RECIPE_OPTIONS: 'recipeOptions',
  ALL_RECIPE_OPTIONS: 'allRecipeOptions',
  DEBOUNCED_SEARCH: 'debouncedSearch',
  SEARCH_INPUT: 'searchInput',
  CAN_ADD_RECIPE: 'canAddRecipe',
  SELECTED_RECIPE: 'selectedRecipe',
  SELECTED_BUILDING: 'selectedBuilding',
  BUILDING_COUNT: 'buildingCount',
  BUILDING_OPTIONS: 'buildingOptions',
} as const

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
    setComponentData(wrapper, { [COMPONENT_PROPS.SEARCH_INPUT]: searchText })
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

      const filteredOptions = getVmProperty(
        wrapper,
        COMPONENT_PROPS.RECIPE_OPTIONS,
      ) as RecipeOption[]
      expect(filteredOptions.length).toBeGreaterThan(0)
      expect(
        filteredOptions.every((option: RecipeOption) =>
          option.title.toLowerCase().includes('ingot'),
        ),
      ).toBe(true)
    })

    it('limits recipe options to 20 results', () => {
      const wrapper = mountRecipeInput()

      const filteredOptions = getVmProperty(
        wrapper,
        COMPONENT_PROPS.RECIPE_OPTIONS,
      ) as RecipeOption[]
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

      const allOptions = getVmProperty(
        wrapper,
        COMPONENT_PROPS.ALL_RECIPE_OPTIONS,
      ) as RecipeOption[]
      expect(allOptions.every((option: RecipeOption) => option.value !== firstRecipeKey)).toBe(true)
    })

    it('sorts recipe options alphabetically by title', () => {
      const wrapper = mountRecipeInput()

      const allOptions = getVmProperty(
        wrapper,
        COMPONENT_PROPS.ALL_RECIPE_OPTIONS,
      ) as RecipeOption[]
      const titles = allOptions.map((option: RecipeOption) => option.title)
      const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b))

      expect(titles).toEqual(sortedTitles)
    })

    it('debounces search input updates', async () => {
      const wrapper = mountRecipeInput()

      // Rapidly change search input
      setComponentData(wrapper, { [COMPONENT_PROPS.SEARCH_INPUT]: 'ingot' })

      // Before debounce timeout, debouncedSearch should still be empty
      expect(getVmProperty(wrapper, COMPONENT_PROPS.DEBOUNCED_SEARCH)).toBe('')

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 250))
      expect(getVmProperty(wrapper, COMPONENT_PROPS.DEBOUNCED_SEARCH)).toBe('ingot')
    })
  })

  describe('Add Button Validation', () => {
    it('disables add button when no recipe is selected', () => {
      const wrapper = mountRecipeInput()

      expect(getVmProperty(wrapper, 'canAddRecipe')).toBe(false)
      expect(getVmProperty(wrapper, 'selectedRecipe')).toBe('')
    })

    it('disables add button when no building is selected', async () => {
      const wrapper = mountRecipeInput()

      // Use multi-building recipe to ensure building selection is required
      await setComponentDataAndTick(wrapper, {
        [COMPONENT_PROPS.SELECTED_RECIPE]: multiBuildingRecipe,
      })

      expect(getVmProperty(wrapper, COMPONENT_PROPS.CAN_ADD_RECIPE)).toBe(false)
    })

    it('disables add button for zero or negative building count', async () => {
      const wrapper = mountRecipeInput()

      const firstRecipeKey = Object.keys(mockRecipes)[0]
      await setComponentDataAndTick(wrapper, {
        [COMPONENT_PROPS.SELECTED_RECIPE]: firstRecipeKey,
        [COMPONENT_PROPS.SELECTED_BUILDING]: 'Desc_ConstructorMk1_C',
        [COMPONENT_PROPS.BUILDING_COUNT]: 0,
      })

      expect(getVmProperty(wrapper, COMPONENT_PROPS.CAN_ADD_RECIPE)).toBe(false)

      await setComponentDataAndTick(wrapper, {
        [COMPONENT_PROPS.BUILDING_COUNT]: -5,
      })

      expect(getVmProperty(wrapper, COMPONENT_PROPS.CAN_ADD_RECIPE)).toBe(false)

      await setComponentDataAndTick(wrapper, {
        [COMPONENT_PROPS.BUILDING_COUNT]: 3,
      })

      expect(getVmProperty(wrapper, COMPONENT_PROPS.CAN_ADD_RECIPE)).toBe(true)
    })

    it('enables add button when all fields are valid', async () => {
      const wrapper = mountRecipeInput()

      const firstRecipeKey = Object.keys(mockRecipes)[0]
      await setComponentDataAndTick(wrapper, {
        [COMPONENT_PROPS.SELECTED_RECIPE]: firstRecipeKey,
        [COMPONENT_PROPS.SELECTED_BUILDING]: 'Desc_ConstructorMk1_C',
        [COMPONENT_PROPS.BUILDING_COUNT]: 2,
      })

      expect(getVmProperty(wrapper, COMPONENT_PROPS.CAN_ADD_RECIPE)).toBe(true)
    })
  })

  describe('Building Selection', () => {
    it('auto-selects building when recipe has only one building option', async () => {
      const wrapper = mountRecipeInput()

      const singleBuildingRecipe = Object.keys(mockRecipes).find(
        (key) => mockRecipes[key].producedIn.length === 1,
      )!

      await setComponentDataAndTick(wrapper, {
        [COMPONENT_PROPS.SELECTED_RECIPE]: singleBuildingRecipe,
      })

      expect(getVmProperty(wrapper, COMPONENT_PROPS.BUILDING_OPTIONS)).toHaveLength(1)
      expect(getVmProperty(wrapper, COMPONENT_PROPS.SELECTED_BUILDING)).toBe(
        mockRecipes[singleBuildingRecipe].producedIn[0],
      )
    })

    it('does not auto-select when recipe has multiple building options', async () => {
      const wrapper = mountRecipeInput()

      await setComponentDataAndTick(wrapper, {
        [COMPONENT_PROPS.SELECTED_RECIPE]: multiBuildingRecipe,
      }) // Has multiple buildings

      expect(getVmProperty(wrapper, COMPONENT_PROPS.BUILDING_OPTIONS).length).toBeGreaterThan(1)
      expect(getVmProperty(wrapper, COMPONENT_PROPS.SELECTED_BUILDING)).toBe('')
    })

    it('provides correct building options for selected recipe', async () => {
      const wrapper = mountRecipeInput()

      await setComponentDataAndTick(wrapper, {
        [COMPONENT_PROPS.SELECTED_RECIPE]: multiBuildingRecipe,
      })

      const buildingOptions = getVmProperty(
        wrapper,
        COMPONENT_PROPS.BUILDING_OPTIONS,
      ) as RecipeOption[]
      expect(buildingOptions).toHaveLength(2)
      expect(buildingOptions.map((opt: RecipeOption) => opt.value)).toEqual(fakeBuildingOptions)
    })

    it('clears building selection when recipe changes to multi-building recipe', async () => {
      const wrapper = mountRecipeInput()

      // Set up initial recipe with auto-selected building
      const singleBuildingRecipe = Object.keys(mockRecipes).find(
        (key) => mockRecipes[key].producedIn.length === 1,
      )!

      await setComponentDataAndTick(wrapper, {
        [COMPONENT_PROPS.SELECTED_RECIPE]: singleBuildingRecipe,
      })
      expect(getVmProperty(wrapper, COMPONENT_PROPS.SELECTED_BUILDING)).toBe(
        mockRecipes[singleBuildingRecipe].producedIn[0],
      )

      // Change to multi-building recipe
      await setComponentDataAndTick(wrapper, {
        [COMPONENT_PROPS.SELECTED_RECIPE]: multiBuildingRecipe,
      })

      expect(getVmProperty(wrapper, COMPONENT_PROPS.SELECTED_BUILDING)).toBe('')
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
      await setComponentDataAndTick(wrapper, {
        [COMPONENT_PROPS.SELECTED_RECIPE]: firstRecipeKey,
        [COMPONENT_PROPS.SELECTED_BUILDING]: buildingKey,
        [COMPONENT_PROPS.BUILDING_COUNT]: 3,
      })

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
      await setComponentDataAndTick(wrapper, {
        [COMPONENT_PROPS.SELECTED_RECIPE]: firstRecipeKey,
        [COMPONENT_PROPS.SELECTED_BUILDING]: 'Desc_ConstructorMk1_C',
        [COMPONENT_PROPS.BUILDING_COUNT]: 3,
      })

      wrapper.vm.addRecipe()
      await nextTick()

      expect(getVmProperty(wrapper, COMPONENT_PROPS.SELECTED_RECIPE)).toBe('')
      expect(getVmProperty(wrapper, COMPONENT_PROPS.SELECTED_BUILDING)).toBe('')
      expect(getVmProperty(wrapper, COMPONENT_PROPS.BUILDING_COUNT)).toBe(1)
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

      expect(getVmProperty(wrapper, COMPONENT_PROPS.ALL_RECIPE_OPTIONS)).toHaveLength(0)
      expect(getVmProperty(wrapper, COMPONENT_PROPS.RECIPE_OPTIONS)).toHaveLength(0)
    })

    it('shows initial recipes when no search text is entered', () => {
      const wrapper = mountRecipeInput()

      expect(getVmProperty(wrapper, COMPONENT_PROPS.SEARCH_INPUT)).toBe('')
      expect(getVmProperty(wrapper, COMPONENT_PROPS.DEBOUNCED_SEARCH)).toBe('')
      expect(
        (getVmProperty(wrapper, COMPONENT_PROPS.RECIPE_OPTIONS) as RecipeOption[]).length,
      ).toBeGreaterThan(0)
    })

    it('has empty results when search yields no matches', async () => {
      const wrapper = mountRecipeInput()

      await triggerSearch(wrapper, 'nonexistentrecipe123')

      expect(getVmProperty(wrapper, COMPONENT_PROPS.RECIPE_OPTIONS)).toHaveLength(0)
      expect(getVmProperty(wrapper, COMPONENT_PROPS.SEARCH_INPUT)).toBe('nonexistentrecipe123')
      expect(getVmProperty(wrapper, COMPONENT_PROPS.DEBOUNCED_SEARCH)).toBe('nonexistentrecipe123')
    })
  })
})
