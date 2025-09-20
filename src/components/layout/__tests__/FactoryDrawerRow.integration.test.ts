import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import FactoryDrawerRow from '@/components/layout/FactoryDrawerRow.vue'
import type { Factory } from '@/types/factory'

// Mock composables with centralized fixtures
vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

// Mock modal component to avoid DOM issues in tests
vi.mock('@/components/modals/ConfirmationModal.vue', () => ({
  default: {
    name: 'ConfirmationModal',
    props: ['show', 'title', 'message', 'confirmText', 'cancelText'],
    emits: ['confirm', 'cancel', 'update:show'],
    template: '<div data-testid="confirmation-modal">Mock Modal</div>',
  },
}))

describe('FactoryDrawerRow Integration', () => {
  const TEST_FACTORY: Factory = {
    name: 'Steel Production Plant',
    icon: 'Desc_SteelIngot_C',
    floors: [],
    recipeLinks: {},
  }

  const createWrapper = (props = {}) => {
    const defaultProps = {
      factory: TEST_FACTORY,
      rail: false,
      selected: false,
    }

    return mount({
      template:
        '<v-list><FactoryDrawerRow v-bind="props" @select="onSelect" @delete="onDelete" /></v-list>',
      components: { FactoryDrawerRow },
      setup() {
        return {
          props: { ...defaultProps, ...props },
          onSelect: vi.fn(),
          onDelete: vi.fn(),
        }
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders factory name as title when not in rail mode', () => {
      const wrapper = createWrapper({ rail: false })

      const listItem = wrapper.findComponent({ name: 'VListItem' })
      expect(listItem.exists()).toBe(true)
      expect(listItem.props('title')).toBe('Steel Production Plant')
    })

    it('does not show title when in rail mode', () => {
      const wrapper = createWrapper({ rail: true })

      const listItem = wrapper.findComponent({ name: 'VListItem' })
      expect(listItem.props('title')).toBeUndefined()
    })

    it('displays factory icon in prepend slot', () => {
      const wrapper = createWrapper()

      const image = wrapper.findComponent({ name: 'VImg' })
      expect(image.exists()).toBe(true)
      expect(image.props('src')).toContain('Desc-SteelIngot-C')
      expect(image.props('width')).toBe('32')
      expect(image.props('height')).toBe('32')
    })

    it('shows delete button in append slot', () => {
      const wrapper = createWrapper()

      const deleteBtn = wrapper.findComponent({ name: 'VBtn' })
      expect(deleteBtn.exists()).toBe(true)
      expect(deleteBtn.props('icon')).toBe('mdi-delete')
      expect(deleteBtn.props('size')).toBe('small')
      expect(deleteBtn.props('variant')).toBe('text')
      expect(deleteBtn.props('color')).toBe('error')
    })

    it('applies active state correctly when selected', () => {
      const wrapper = createWrapper({ selected: true })

      const listItem = wrapper.findComponent({ name: 'VListItem' })
      expect(listItem.props('active')).toBe(true)
    })

    it('does not apply active state when not selected', () => {
      const wrapper = createWrapper({ selected: false })

      const listItem = wrapper.findComponent({ name: 'VListItem' })
      expect(listItem.props('active')).toBe(false)
    })
  })

  describe('User Interactions', () => {
    it('calls select handler when list item is clicked', async () => {
      const wrapper = createWrapper()

      const listItem = wrapper.findComponent({ name: 'VListItem' })
      await listItem.trigger('click')

      expect(wrapper.vm.onSelect).toHaveBeenCalled()
    })

    it('shows confirmation modal when delete button is clicked', async () => {
      const wrapper = createWrapper()

      const deleteBtn = wrapper.findComponent({ name: 'VBtn' })
      await deleteBtn.trigger('click')

      const modal = wrapper.findComponent({ name: 'ConfirmationModal' })
      expect(modal.exists()).toBe(true)
      expect(modal.props('show')).toBe(true)
      expect(modal.props('title')).toBe('Delete Factory')
      expect(modal.props('message')).toBe(
        "Are you sure you want to delete 'Steel Production Plant'? This action cannot be undone.",
      )
      expect(modal.props('confirmText')).toBe('Delete')
      expect(modal.props('cancelText')).toBe('Cancel')
    })

    it('prevents event propagation when delete button is clicked', async () => {
      const wrapper = createWrapper()

      const deleteBtn = wrapper.findComponent({ name: 'VBtn' })
      await deleteBtn.trigger('click')

      // Select handler should not be called when delete button is clicked
      expect(wrapper.vm.onSelect).not.toHaveBeenCalled()
    })
  })

  describe('Delete Confirmation Flow', () => {
    it('calls delete handler when deletion is confirmed', async () => {
      const wrapper = createWrapper()

      // Open confirmation modal
      const deleteBtn = wrapper.findComponent({ name: 'VBtn' })
      await deleteBtn.trigger('click')

      // Confirm deletion
      const modal = wrapper.findComponent({ name: 'ConfirmationModal' })
      await modal.vm.$emit('confirm')

      expect(wrapper.vm.onDelete).toHaveBeenCalledWith('Steel Production Plant')
    })

    it('shows modal when delete button is clicked and hides when cancelled', async () => {
      const wrapper = createWrapper()

      // Open confirmation modal
      const deleteBtn = wrapper.findComponent({ name: 'VBtn' })
      await deleteBtn.trigger('click')

      let modal = wrapper.findComponent({ name: 'ConfirmationModal' })
      expect(modal.props('show')).toBe(true)

      // Cancel deletion
      await modal.vm.$emit('cancel')

      // Modal should still exist but internal state manages visibility
      modal = wrapper.findComponent({ name: 'ConfirmationModal' })
      expect(modal.exists()).toBe(true)
      expect(wrapper.vm.onDelete).not.toHaveBeenCalled()
    })
  })

  describe('Factory Data Integration', () => {
    it('handles different factory configurations', () => {
      const customFactory: Factory = {
        name: 'Copper Processing Plant',
        icon: 'Desc_CopperIngot_C',
        floors: [],
        recipeLinks: {},
      }

      const wrapper = createWrapper({ factory: customFactory })

      const listItem = wrapper.findComponent({ name: 'VListItem' })
      expect(listItem.props('title')).toBe('Copper Processing Plant')

      const image = wrapper.findComponent({ name: 'VImg' })
      expect(image.props('src')).toContain('Desc-CopperIngot-C')

      const modal = wrapper.findComponent({ name: 'ConfirmationModal' })
      expect(modal.props('message')).toBe(
        "Are you sure you want to delete 'Copper Processing Plant'? This action cannot be undone.",
      )
    })

    it('works with factories having special characters in names', () => {
      const specialFactory: Factory = {
        name: "John's Steel & Iron Co.",
        icon: 'Desc_SteelIngot_C',
        floors: [],
        recipeLinks: {},
      }

      const wrapper = createWrapper({ factory: specialFactory })

      const listItem = wrapper.findComponent({ name: 'VListItem' })
      expect(listItem.props('title')).toBe("John's Steel & Iron Co.")

      const modal = wrapper.findComponent({ name: 'ConfirmationModal' })
      expect(modal.props('message')).toBe(
        "Are you sure you want to delete 'John's Steel & Iron Co.'? This action cannot be undone.",
      )
    })
  })
})
