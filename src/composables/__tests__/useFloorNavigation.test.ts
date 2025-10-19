import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { mockCurrentFactory, mockFactoryStore } from '@/__tests__/fixtures/composables/factoryStore'
import { makeFactory, makeFloor, makeRecipeNode } from '@/__tests__/fixtures/data'
import { useFloorNavigation } from '@/composables/useFloorNavigation'
import type { RecipeNode } from '@/logistics/graph-node'
import { ExpandRecipeState } from '@/utils/floors'

vi.mock('@/stores', () => ({
  useFactoryStore: vi.fn(() => mockFactoryStore),
}))

const createMockElement = (
  id: string,
  rect: { top: number; left?: number; width?: number; height?: number },
): HTMLDivElement => {
  const element = document.createElement('div')
  element.id = id

  const fullRect = {
    top: rect.top,
    bottom: rect.top + (rect.height ?? 100),
    left: rect.left ?? 0,
    right: (rect.left ?? 0) + (rect.width ?? 100),
    width: rect.width ?? 100,
    height: rect.height ?? 100,
    x: rect.left ?? 0,
    y: rect.top,
    toJSON: () => {},
  }

  element.getBoundingClientRect = vi.fn(() => fullRect)

  return element
}

describe('useFloorNavigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockCurrentFactory.value = null
    document.body.innerHTML = ''

    // Reset singleton state
    const { expandedFloors } = useFloorNavigation()
    expandedFloors.value = []
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Singleton State', () => {
    it('shares expandedFloors state across multiple instances', () => {
      const { expandedFloors: expandedFloors1, expandFloor: expandFloor1 } = useFloorNavigation()
      const { expandedFloors: expandedFloors2 } = useFloorNavigation()

      expandFloor1(0)

      expect(expandedFloors1.value).toEqual([0])
      expect(expandedFloors2.value).toEqual([0])
      expect(expandedFloors1.value).toBe(expandedFloors2.value)
    })
  })

  describe('initializeExpansion', () => {
    it('initializes with empty array when no factory', () => {
      const { expandedFloors, initializeExpansion } = useFloorNavigation()
      const isRecipeComplete = vi.fn()

      initializeExpansion(isRecipeComplete)

      expect(expandedFloors.value).toEqual([])
    })

    it('expands floors with incomplete recipes', () => {
      const recipe1 = makeRecipeNode('Recipe_A', 0)
      const recipe2 = makeRecipeNode('Recipe_B', 1)
      const recipe3 = makeRecipeNode('Recipe_C', 2)

      const factory = makeFactory('Test Factory', [
        makeFloor([recipe1]),
        makeFloor([recipe2]),
        makeFloor([recipe3]),
      ])
      mockCurrentFactory.value = factory

      const isRecipeComplete = vi.fn((recipe: RecipeNode) => {
        return recipe.recipe.name === 'Recipe_B'
      })

      const { expandedFloors, initializeExpansion } = useFloorNavigation()
      initializeExpansion(isRecipeComplete)

      expect(expandedFloors.value).toEqual([0, 2])
    })

    it('collapses floors with only complete recipes', () => {
      const recipe1 = makeRecipeNode('Recipe_A', 0)
      const recipe2 = makeRecipeNode('Recipe_B', 1)

      const factory = makeFactory('Test Factory', [makeFloor([recipe1]), makeFloor([recipe2])])
      mockCurrentFactory.value = factory

      const isRecipeComplete = vi.fn(() => true)

      const { expandedFloors, initializeExpansion } = useFloorNavigation()
      initializeExpansion(isRecipeComplete)

      expect(expandedFloors.value).toEqual([])
    })

    it('handles mixed complete and incomplete recipes on same floor', () => {
      const recipe1 = makeRecipeNode('Recipe_A', 0)
      const recipe2 = makeRecipeNode('Recipe_B', 0)

      const factory = makeFactory('Test Factory', [makeFloor([recipe1, recipe2])])
      mockCurrentFactory.value = factory

      const isRecipeComplete = vi.fn((recipe: RecipeNode) => {
        return recipe.recipe.name === 'Recipe_A'
      })

      const { expandedFloors, initializeExpansion } = useFloorNavigation()
      initializeExpansion(isRecipeComplete)

      expect(expandedFloors.value).toEqual([0])
    })
  })

  describe('expandFloor', () => {
    it('adds floor to expanded list', () => {
      const { expandedFloors, expandFloor } = useFloorNavigation()

      expandFloor(0)

      expect(expandedFloors.value).toEqual([0])
    })

    it('does not duplicate floor in expanded list', () => {
      const { expandedFloors, expandFloor } = useFloorNavigation()

      expandFloor(0)
      expandFloor(0)

      expect(expandedFloors.value).toEqual([0])
    })

    it('can expand multiple floors', () => {
      const { expandedFloors, expandFloor } = useFloorNavigation()

      expandFloor(0)
      expandFloor(1)
      expandFloor(2)

      expect(expandedFloors.value).toEqual([0, 1, 2])
    })
  })

  describe('collapseFloor', () => {
    it('removes floor from expanded list', () => {
      const { expandedFloors, expandFloor, collapseFloor } = useFloorNavigation()

      expandFloor(0)
      collapseFloor(0)

      expect(expandedFloors.value).toEqual([])
    })

    it('does nothing when floor not in expanded list', () => {
      const { expandedFloors, collapseFloor } = useFloorNavigation()

      collapseFloor(0)

      expect(expandedFloors.value).toEqual([])
    })

    it('only removes specified floor from list', () => {
      const { expandedFloors, expandFloor, collapseFloor } = useFloorNavigation()

      expandFloor(0)
      expandFloor(1)
      expandFloor(2)
      collapseFloor(1)

      expect(expandedFloors.value).toEqual([0, 2])
    })
  })

  describe('toggleFloor', () => {
    it('expands floor when collapsed', () => {
      const { expandedFloors, toggleFloor } = useFloorNavigation()

      toggleFloor(0)

      expect(expandedFloors.value).toEqual([0])
    })

    it('collapses floor when expanded', () => {
      const { expandedFloors, expandFloor, toggleFloor } = useFloorNavigation()

      expandFloor(0)
      toggleFloor(0)

      expect(expandedFloors.value).toEqual([])
    })

    it('toggles back and forth', () => {
      const { expandedFloors, toggleFloor } = useFloorNavigation()

      toggleFloor(0)
      expect(expandedFloors.value).toEqual([0])

      toggleFloor(0)
      expect(expandedFloors.value).toEqual([])

      toggleFloor(0)
      expect(expandedFloors.value).toEqual([0])
    })
  })

  describe('setRecipeExpansionFromCompletion', () => {
    it('does nothing when no factory', () => {
      const { setRecipeExpansionFromCompletion } = useFloorNavigation()
      const isRecipeComplete = vi.fn()

      expect(() => {
        setRecipeExpansionFromCompletion(ExpandRecipeState.All, true, isRecipeComplete)
      }).not.toThrow()
    })

    it('expands all recipes when affectsCompleted is All', () => {
      const recipe1 = makeRecipeNode('Recipe_A', 0, { expanded: false })
      const recipe2 = makeRecipeNode('Recipe_B', 1, { expanded: false })

      const factory = makeFactory('Test Factory', [makeFloor([recipe1]), makeFloor([recipe2])])
      mockCurrentFactory.value = factory

      const isRecipeComplete = vi.fn(() => true)
      const { setRecipeExpansionFromCompletion } = useFloorNavigation()

      setRecipeExpansionFromCompletion(ExpandRecipeState.All, true, isRecipeComplete)

      expect(recipe1.expanded).toBe(true)
      expect(recipe2.expanded).toBe(true)
    })

    it('collapses all recipes when affectsCompleted is All', () => {
      const recipe1 = makeRecipeNode('Recipe_A', 0, { expanded: true })
      const recipe2 = makeRecipeNode('Recipe_B', 1, { expanded: true })

      const factory = makeFactory('Test Factory', [makeFloor([recipe1]), makeFloor([recipe2])])
      mockCurrentFactory.value = factory

      const isRecipeComplete = vi.fn(() => true)
      const { setRecipeExpansionFromCompletion } = useFloorNavigation()

      setRecipeExpansionFromCompletion(ExpandRecipeState.All, false, isRecipeComplete)

      expect(recipe1.expanded).toBe(false)
      expect(recipe2.expanded).toBe(false)
    })

    it('only expands complete recipes when affectsCompleted is Complete', () => {
      const recipe1 = makeRecipeNode('Recipe_A', 0, { expanded: false })
      const recipe2 = makeRecipeNode('Recipe_B', 1, { expanded: false })

      const factory = makeFactory('Test Factory', [makeFloor([recipe1]), makeFloor([recipe2])])
      mockCurrentFactory.value = factory

      const isRecipeComplete = vi.fn((recipe: RecipeNode) => {
        return recipe.recipe.name === 'Recipe_A'
      })
      const { setRecipeExpansionFromCompletion } = useFloorNavigation()

      setRecipeExpansionFromCompletion(ExpandRecipeState.Complete, true, isRecipeComplete)

      expect(recipe1.expanded).toBe(true)
      expect(recipe2.expanded).toBe(false)
    })

    it('only collapses incomplete recipes when affectsCompleted is Incomplete', () => {
      const recipe1 = makeRecipeNode('Recipe_A', 0, { expanded: true })
      const recipe2 = makeRecipeNode('Recipe_B', 1, { expanded: true })

      const factory = makeFactory('Test Factory', [makeFloor([recipe1]), makeFloor([recipe2])])
      mockCurrentFactory.value = factory

      const isRecipeComplete = vi.fn((recipe: RecipeNode) => {
        return recipe.recipe.name === 'Recipe_A'
      })
      const { setRecipeExpansionFromCompletion } = useFloorNavigation()

      setRecipeExpansionFromCompletion(ExpandRecipeState.Incomplete, false, isRecipeComplete)

      expect(recipe1.expanded).toBe(true)
      expect(recipe2.expanded).toBe(false)
    })

    it('expands floor when expanding recipes with any expanded', () => {
      const recipe1 = makeRecipeNode('Recipe_A', 0, { expanded: false })

      const factory = makeFactory('Test Factory', [makeFloor([recipe1])])
      mockCurrentFactory.value = factory

      const isRecipeComplete = vi.fn(() => false)
      const { expandedFloors, setRecipeExpansionFromCompletion } = useFloorNavigation()

      setRecipeExpansionFromCompletion(ExpandRecipeState.All, true, isRecipeComplete)

      expect(expandedFloors.value).toEqual([0])
    })

    it('collapses floor when collapsing recipes with none expanded', () => {
      const recipe1 = makeRecipeNode('Recipe_A', 0, { expanded: true })

      const factory = makeFactory('Test Factory', [makeFloor([recipe1])])
      mockCurrentFactory.value = factory

      const isRecipeComplete = vi.fn(() => true)
      const { expandedFloors, expandFloor, setRecipeExpansionFromCompletion } = useFloorNavigation()

      expandFloor(0)
      setRecipeExpansionFromCompletion(ExpandRecipeState.All, false, isRecipeComplete)

      expect(expandedFloors.value).toEqual([])
    })

    it('does not collapse floor if some recipes remain expanded', () => {
      const recipe1 = makeRecipeNode('Recipe_A', 0, { expanded: true })
      const recipe2 = makeRecipeNode('Recipe_B', 0, { expanded: true })

      const factory = makeFactory('Test Factory', [makeFloor([recipe1, recipe2])])
      mockCurrentFactory.value = factory

      const isRecipeComplete = vi.fn((recipe: RecipeNode) => {
        return recipe.recipe.name === 'Recipe_A'
      })
      const { expandedFloors, expandFloor, setRecipeExpansionFromCompletion } = useFloorNavigation()

      expandFloor(0)
      setRecipeExpansionFromCompletion(ExpandRecipeState.Complete, false, isRecipeComplete)

      expect(recipe1.expanded).toBe(false)
      expect(recipe2.expanded).toBe(true)
      expect(expandedFloors.value).toEqual([0])
    })
  })

  describe('navigateToElement', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('expands floor and scrolls to floor element', async () => {
      const mockElement = createMockElement('floor-0', { top: 500 })
      document.body.appendChild(mockElement)

      const scrollToSpy = vi.fn()
      window.scrollTo = scrollToSpy
      window.pageYOffset = 100

      const { expandedFloors, navigateToElement } = useFloorNavigation()

      navigateToElement('floor-0')

      expect(expandedFloors.value).toEqual([0])

      vi.advanceTimersByTime(100)
      await nextTick()

      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 520,
        behavior: 'smooth',
      })
    })

    it('expands floor and scrolls to recipe element', async () => {
      const mockElement = createMockElement('recipe-1-Recipe_IronIngot_C', { top: 300 })
      document.body.appendChild(mockElement)

      const scrollToSpy = vi.fn()
      window.scrollTo = scrollToSpy
      window.pageYOffset = 50

      const { expandedFloors, navigateToElement } = useFloorNavigation()

      navigateToElement('recipe-1-Recipe_IronIngot_C')

      expect(expandedFloors.value).toEqual([1])

      vi.advanceTimersByTime(250)
      await nextTick()

      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 270,
        behavior: 'smooth',
      })
    })

    it('does not scroll if element not found', async () => {
      const scrollToSpy = vi.fn()
      window.scrollTo = scrollToSpy

      const { navigateToElement } = useFloorNavigation()

      navigateToElement('floor-99')

      vi.advanceTimersByTime(100)
      await nextTick()

      expect(scrollToSpy).not.toHaveBeenCalled()
    })

    it('handles different floor indices in floor identifiers', () => {
      const { expandedFloors, navigateToElement } = useFloorNavigation()

      navigateToElement('floor-5')

      expect(expandedFloors.value).toEqual([5])
    })

    it('handles recipe identifiers with complex recipe names', () => {
      const { expandedFloors, navigateToElement } = useFloorNavigation()

      navigateToElement('recipe-3-Recipe_Alternate_ComplexName_C')

      expect(expandedFloors.value).toEqual([3])
    })

    it('does nothing for invalid identifiers', () => {
      const { expandedFloors, navigateToElement } = useFloorNavigation()

      navigateToElement('invalid-identifier')

      expect(expandedFloors.value).toEqual([])
    })
  })

  describe('navigateToRecipe', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('navigates to recipe element', async () => {
      const mockElement = createMockElement('recipe-2-Recipe_Test_C', { top: 400 })
      document.body.appendChild(mockElement)

      const scrollToSpy = vi.fn()
      window.scrollTo = scrollToSpy
      window.pageYOffset = 0

      const recipe = makeRecipeNode('Recipe_Test_C', 2)
      const { expandedFloors, navigateToRecipe } = useFloorNavigation()

      navigateToRecipe(recipe)

      expect(expandedFloors.value).toEqual([2])

      vi.advanceTimersByTime(250)
      await nextTick()

      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 320,
        behavior: 'smooth',
      })
    })

    it('does nothing when recipe has no batchNumber', () => {
      const recipe = makeRecipeNode('Recipe_Test_C')
      recipe.batchNumber = undefined

      const scrollToSpy = vi.fn()
      window.scrollTo = scrollToSpy

      const { navigateToRecipe } = useFloorNavigation()

      navigateToRecipe(recipe)

      vi.advanceTimersByTime(250)

      expect(scrollToSpy).not.toHaveBeenCalled()
    })

    it('handles recipe with batchNumber 0', async () => {
      const mockElement = createMockElement('recipe-0-Recipe_Zero_C', { top: 200 })
      document.body.appendChild(mockElement)

      const scrollToSpy = vi.fn()
      window.scrollTo = scrollToSpy
      window.pageYOffset = 0

      const recipe = makeRecipeNode('Recipe_Zero_C', 0)
      const { expandedFloors, navigateToRecipe } = useFloorNavigation()

      navigateToRecipe(recipe)

      expect(expandedFloors.value).toEqual([0])

      vi.advanceTimersByTime(250)
      await nextTick()

      expect(scrollToSpy).toHaveBeenCalled()
    })
  })
})
