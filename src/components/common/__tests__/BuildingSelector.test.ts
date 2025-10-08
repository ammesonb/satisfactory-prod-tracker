import { describe, it, expect, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import BuildingSelector from '../BuildingSelector.vue'
import type { ItemOption } from '@/types/data'

// Import the test setups for real Vue + Pinia environment with fixture data
import '@/components/__tests__/component-setup'
import '@/logistics/__tests__/test-setup'
import { component } from '@/__tests__/vue-test-helpers'
import GameDataSelector from '../GameDataSelector.vue'
import { VAutocomplete } from 'vuetify/components'

// Test constants
const SMELTER_BUILDING: ItemOption = {
  value: 'Desc_SmelterMk1_C',
  name: 'Smelter',
  icon: 'desc-smeltermk1-c',
  type: 'building',
}

const CONSTRUCTOR_BUILDING: ItemOption = {
  value: 'Desc_ConstructorMk1_C',
  name: 'Constructor',
  icon: 'desc-constructormk1-c',
  type: 'building',
}

const TOTAL_FIXTURE_BUILDINGS = 13
const CUSTOM_PLACEHOLDER = 'Custom placeholder'
const DEFAULT_PLACEHOLDER = 'Search for a building...'
const NON_EXISTENT_BUILDING = 'Desc_NonExistent_C'

const CUSTOM_DISPLAY_CONFIG = {
  placeholder: CUSTOM_PLACEHOLDER,
  label: 'Custom Label',
}

describe('BuildingSelector Integration', () => {
  let wrapper: VueWrapper<unknown>

  const createWrapper = (props: Record<string, unknown> = {}) => {
    return mount(BuildingSelector, {
      props,
      // No stubs! Use real components for integration testing
    })
  }

  beforeEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('real component rendering', () => {
    it('should render real GameDataSelector with Vuetify autocomplete', () => {
      wrapper = createWrapper()

      component(wrapper, GameDataSelector).assert()
      component(wrapper, VAutocomplete).assert()
    })

    it('should pass real fixture data to autocomplete', () => {
      wrapper = createWrapper()

      const autocomplete = wrapper.findComponent(VAutocomplete)
      const items = autocomplete.props('items') as ItemOption[]

      expect(items).toHaveLength(TOTAL_FIXTURE_BUILDINGS)
      expect(items.every((item) => item.type === 'building')).toBe(true)

      // Verify we have real fixture data
      const smelter = items.find((item) => item.value === SMELTER_BUILDING.value)
      expect(smelter).toBeDefined()
      expect(smelter?.name).toBe(SMELTER_BUILDING.name)
    })

    it('should configure autocomplete with correct Vuetify props', () => {
      const wrapper = createWrapper({ disabled: true })
      component(wrapper, VAutocomplete).assert({
        props: {
          disabled: true,
          itemTitle: 'name',
          itemValue: 'value',
          returnObject: true,
          clearable: true,
        },
      })
    })
  })

  describe('prop handling with real components', () => {
    it('should pass modelValue to real GameDataSelector', () => {
      wrapper = createWrapper({ modelValue: SMELTER_BUILDING })

      component(wrapper, GameDataSelector).assert({
        props: {
          modelValue: SMELTER_BUILDING,
        },
      })
      component(wrapper, VAutocomplete).assert({
        props: {
          modelValue: SMELTER_BUILDING,
        },
      })
    })

    it('should pass displayConfig to real components', () => {
      wrapper = createWrapper({ displayConfig: CUSTOM_DISPLAY_CONFIG })

      component(wrapper, GameDataSelector).assert({
        props: {
          displayConfig: CUSTOM_DISPLAY_CONFIG,
        },
      })

      component(wrapper, VAutocomplete).assert({
        props: {
          placeholder: CUSTOM_DISPLAY_CONFIG.placeholder,
          label: CUSTOM_DISPLAY_CONFIG.label,
        },
      })
    })

    it('should use default displayConfig when not provided', () => {
      wrapper = createWrapper()

      component(wrapper, VAutocomplete).assert({
        props: {
          placeholder: DEFAULT_PLACEHOLDER,
        },
      })
    })
  })

  describe('building filtering with real data', () => {
    it('should show all fixture buildings when no filterKeys provided', () => {
      const wrapper = createWrapper()

      const items = wrapper.findComponent(VAutocomplete).props('items') as ItemOption[]
      expect(items).toHaveLength(TOTAL_FIXTURE_BUILDINGS)
    })

    it('should filter buildings by filterKeys using real buildingsToOptions', () => {
      const filterKeys = [SMELTER_BUILDING.value, CONSTRUCTOR_BUILDING.value]
      wrapper = createWrapper({ filterKeys })

      const items = wrapper.findComponent(VAutocomplete).props('items') as ItemOption[]
      expect(items).toHaveLength(2)
      expect(items.map((item) => item.value)).toEqual(filterKeys.sort())
    })

    it('should handle empty filterKeys array', () => {
      wrapper = createWrapper({ filterKeys: [] })

      const items = wrapper.findComponent(VAutocomplete).props('items') as ItemOption[]
      expect(items).toHaveLength(TOTAL_FIXTURE_BUILDINGS)
    })

    it('should handle filterKeys with non-existent building', () => {
      const filterKeys = [NON_EXISTENT_BUILDING]
      wrapper = createWrapper({ filterKeys })

      const items = wrapper.findComponent(VAutocomplete).props('items') as ItemOption[]
      expect(items).toHaveLength(0)
    })
  })

  describe('real auto-selection behavior', () => {
    it('should auto-select when exactly one building matches filter', async () => {
      const filterKeys = [SMELTER_BUILDING.value]
      wrapper = createWrapper({ filterKeys })

      // Wait for Vue reactivity and watchers to process
      await wrapper.vm.$nextTick()

      // Check that the real watcher emitted the event
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted?.[0]?.[0]).toEqual(SMELTER_BUILDING)
    })

    it('should not auto-select when multiple buildings match filter', async () => {
      const filterKeys = [SMELTER_BUILDING.value, CONSTRUCTOR_BUILDING.value]
      wrapper = createWrapper({ filterKeys })

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('should not auto-select when modelValue already exists', async () => {
      const filterKeys = [SMELTER_BUILDING.value]
      wrapper = createWrapper({
        modelValue: CONSTRUCTOR_BUILDING,
        filterKeys,
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
  })

  describe('real event handling', () => {
    it('should emit update:modelValue when real autocomplete selection changes', async () => {
      wrapper = createWrapper()

      await component(wrapper, VAutocomplete).emit('update:modelValue', CONSTRUCTOR_BUILDING)

      expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(CONSTRUCTOR_BUILDING)
    })

    it('should emit update:modelValue with undefined when cleared', async () => {
      wrapper = createWrapper()

      await component(wrapper, VAutocomplete).emit('update:modelValue', undefined)

      expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBeUndefined()
    })
  })

  describe('real reactive updates', () => {
    it('should update when filterKeys change via real computed property', async () => {
      wrapper = createWrapper()

      let items = wrapper.findComponent(VAutocomplete).props('items') as ItemOption[]
      expect(items).toHaveLength(TOTAL_FIXTURE_BUILDINGS)

      // Change filterKeys and test real Vue reactivity
      await wrapper.setProps({ filterKeys: [SMELTER_BUILDING.value] })

      items = wrapper.findComponent(VAutocomplete).props('items') as ItemOption[]
      expect(items).toHaveLength(1)
      expect(items[0]).toEqual(SMELTER_BUILDING)
    })

    it('should maintain correct building data structure from real store', () => {
      wrapper = createWrapper()

      const items = wrapper.findComponent(VAutocomplete).props('items') as ItemOption[]

      // Verify real fixture data structure
      items.forEach((building) => {
        expect(building).toHaveProperty('value')
        expect(building).toHaveProperty('name')
        expect(building).toHaveProperty('icon')
        expect(building.type).toBe('building')
        expect(typeof building.value).toBe('string')
        expect(typeof building.name).toBe('string')
        expect(typeof building.icon).toBe('string')
      })
    })
  })

  describe('real watcher behavior', () => {
    it('should trigger real watcher immediately on mount', async () => {
      const filterKeys = [SMELTER_BUILDING.value]
      wrapper = createWrapper({ filterKeys })

      // The real Vue watcher with { immediate: true } should trigger
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('should trigger real watcher when computed allBuildings changes', async () => {
      wrapper = createWrapper({
        filterKeys: [SMELTER_BUILDING.value, CONSTRUCTOR_BUILDING.value],
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()

      // Change to single building - should trigger real watcher
      await wrapper.setProps({ filterKeys: [SMELTER_BUILDING.value] })
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('real component integration edge cases', () => {
    it('should handle null/undefined filterKeys with real computed property', () => {
      wrapper = createWrapper({ filterKeys: null })
      let items = wrapper.findComponent(VAutocomplete).props('items') as ItemOption[]
      expect(items).toHaveLength(TOTAL_FIXTURE_BUILDINGS)

      wrapper.unmount()
      wrapper = createWrapper({ filterKeys: undefined })
      items = wrapper.findComponent(VAutocomplete).props('items') as ItemOption[]
      expect(items).toHaveLength(TOTAL_FIXTURE_BUILDINGS)
    })

    it('should use real fixture building data', () => {
      wrapper = createWrapper()

      const items = wrapper.findComponent(VAutocomplete).props('items') as ItemOption[]

      // Verify we're getting real fixture data, not mock data
      const smelter = items.find((b) => b.value === SMELTER_BUILDING.value)
      expect(smelter).toBeDefined()
      expect(smelter?.name).toBe('Smelter') // From real fixture
      expect(smelter?.icon).toBe('desc-smeltermk1-c') // From real fixture

      const constructor = items.find((b) => b.value === CONSTRUCTOR_BUILDING.value)
      expect(constructor).toBeDefined()
      expect(constructor?.name).toBe('Constructor') // From real fixture
      expect(constructor?.icon).toBe('desc-constructormk1-c') // From real fixture
    })
  })
})
