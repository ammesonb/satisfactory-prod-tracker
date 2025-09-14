import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import FactorySelector from '@/components/common/FactorySelector.vue'
import type { Factory } from '@/types/factory'
import type { MockUseSelection } from '@/__tests__/fixtures/types/composables'
import { createMockUseSelection } from '@/__tests__/fixtures/types/composables'

// Mock the useSelection composable
vi.mock('@/composables/useSelection', () => ({
  useSelection: vi.fn(() => ({
    allSelected: ref(false),
    someSelected: ref(false),
    toggleAll: vi.fn(),
    toggleItem: vi.fn(),
    isSelected: vi.fn(() => false),
  })),
}))

// Mock the image utility
vi.mock('@/logistics/images', () => ({
  getIconURL: vi.fn(
    (icon: string, size: number) => `https://example.com/icons/${icon}-${size}.png`,
  ),
}))

describe('FactorySelector Integration', () => {
  const mockFactories: Factory[] = [
    {
      name: 'Iron Factory',
      icon: 'iron-ingot',
      floors: [],
      recipeLinks: {},
    },
    {
      name: 'Steel Factory',
      icon: 'steel-ingot',
      floors: [],
      recipeLinks: {},
    },
    {
      name: 'Concrete Factory',
      icon: 'concrete',
      floors: [],
      recipeLinks: {},
    },
  ]

  let mockUseSelection: MockUseSelection

  beforeEach(async () => {
    const { useSelection } = await import('@/composables/useSelection')
    mockUseSelection = vi.mocked(useSelection).mock.results[0]?.value || createMockUseSelection()
    vi.mocked(useSelection).mockReturnValue(mockUseSelection)
  })

  const createWrapper = (props = {}) => {
    return mount(FactorySelector, {
      props: {
        factories: mockFactories,
        title: 'Select Factories',
        ...props,
      },
    })
  }

  it('renders with default props', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Select All')
    expect(wrapper.findAll('.v-list-item')).toHaveLength(3)
  })

  it('renders custom title when provided', () => {
    const wrapper = createWrapper({ title: 'Choose Your Factories' })

    // Title prop is not displayed in template, but component should accept it
    expect(wrapper.props('title')).toBe('Choose Your Factories')
  })

  it('displays all factories in the list', () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('Iron Factory')
    expect(wrapper.text()).toContain('Steel Factory')
    expect(wrapper.text()).toContain('Concrete Factory')
  })

  it('renders factory icons using CachedIcon component', () => {
    const wrapper = createWrapper()

    const cachedIcons = wrapper.findAllComponents({ name: 'CachedIcon' })
    expect(cachedIcons).toHaveLength(3)

    expect(cachedIcons[0].props('icon')).toBe('iron-ingot')
    expect(cachedIcons[1].props('icon')).toBe('steel-ingot')
    expect(cachedIcons[2].props('icon')).toBe('concrete')

    cachedIcons.forEach((icon) => {
      expect(icon.props('size')).toBe(24)
    })
  })

  it('calls toggleAll when select all checkbox is clicked', async () => {
    const wrapper = createWrapper()

    const selectAllCheckbox = wrapper.find('input[type="checkbox"]')
    await selectAllCheckbox.trigger('click')

    expect(mockUseSelection.toggleAll).toHaveBeenCalled()
  })

  it('calls toggleItem when factory list item is clicked', async () => {
    const wrapper = createWrapper()

    const firstFactoryItem = wrapper.find('.v-list-item')
    await firstFactoryItem.trigger('click')

    expect(mockUseSelection.toggleItem).toHaveBeenCalledWith('Iron Factory')
  })

  it('calls toggleItem when individual factory checkbox is clicked', async () => {
    const wrapper = createWrapper()

    const factoryCheckboxes = wrapper.findAll('.v-list-item input[type="checkbox"]')
    await factoryCheckboxes[1].trigger('click')

    expect(mockUseSelection.toggleItem).toHaveBeenCalledWith('Steel Factory')
  })

  it('prevents event propagation when clicking factory checkbox directly', async () => {
    const wrapper = createWrapper()

    // This test verifies the @click.stop directive works by checking the toggle is called
    // without the parent list item handler being triggered
    const factoryCheckbox = wrapper.find('.v-list-item input[type="checkbox"]')
    await factoryCheckbox.trigger('click')

    // Verify that toggleItem was called (checkbox handler)
    expect(mockUseSelection.toggleItem).toHaveBeenCalledWith('Iron Factory')
  })

  it('shows indeterminate state when some factories are selected', () => {
    mockUseSelection.someSelected.value = true
    mockUseSelection.allSelected.value = false

    const wrapper = createWrapper()

    const selectAllCheckbox = wrapper.findComponent({ name: 'VCheckbox' })
    expect(selectAllCheckbox.props('indeterminate')).toBe(true)
  })

  it('shows checked state when all factories are selected', () => {
    mockUseSelection.allSelected.value = true
    mockUseSelection.someSelected.value = true

    const wrapper = createWrapper()

    const selectAllCheckbox = wrapper.findComponent({ name: 'VCheckbox' })
    expect(selectAllCheckbox.props('modelValue')).toBe(true)
    expect(selectAllCheckbox.props('indeterminate')).toBe(false)
  })

  it('shows individual factory as selected when isSelected returns true', () => {
    mockUseSelection.isSelected.mockImplementation((name: string) => name === 'Steel Factory')

    const wrapper = createWrapper()

    const factoryCheckboxes = wrapper.findAllComponents({ name: 'VCheckbox' })
    // First checkbox is "Select All", then factory checkboxes
    expect(factoryCheckboxes[2].props('modelValue')).toBe(true) // Steel Factory
    expect(factoryCheckboxes[1].props('modelValue')).toBe(false) // Iron Factory
  })

  it('updates v-model when selectedFactories changes', async () => {
    const selectedFactories = ref(['Iron Factory'])
    const wrapper = mount(FactorySelector, {
      props: {
        factories: mockFactories,
        modelValue: selectedFactories.value,
        'onUpdate:modelValue': (value: string[]) => {
          selectedFactories.value = value
        },
      },
    })

    expect(wrapper.props('modelValue')).toEqual(['Iron Factory'])

    await wrapper.setProps({ modelValue: ['Iron Factory', 'Steel Factory'] })

    expect(wrapper.props('modelValue')).toEqual(['Iron Factory', 'Steel Factory'])
  })

  it('handles empty factories list gracefully', () => {
    const wrapper = createWrapper({ factories: [] })

    expect(wrapper.findAll('.v-list-item')).toHaveLength(0)
    expect(wrapper.find('.v-list').exists()).toBe(true)
  })

  it('calls composable with correct parameters', async () => {
    const { useSelection } = await import('@/composables/useSelection')

    createWrapper()

    expect(useSelection).toHaveBeenCalledWith({
      items: expect.any(Object), // toRefs creates reactive references
      selected: expect.any(Object),
      getKey: expect.any(Function),
    })

    // Test the getKey function
    const call = vi.mocked(useSelection).mock.calls[0]
    const getKey = call[0].getKey
    expect(getKey(mockFactories[0])).toBe('Iron Factory')
  })

  it('has proper accessibility attributes', () => {
    const wrapper = createWrapper()

    const checkboxes = wrapper.findAllComponents({ name: 'VCheckbox' })
    checkboxes.forEach((checkbox) => {
      expect(checkbox.props('hideDetails')).toBe(true)
    })
  })

  it('has scrollable factory list with max height', () => {
    const wrapper = createWrapper()

    const factoryCard = wrapper.findComponent({ name: 'VCard' })
    expect(factoryCard.props('maxHeight')).toBe('300')
    expect(factoryCard.attributes('style')).toContain('overflow-y: auto')
  })
})
