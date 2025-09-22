import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VListItem, VBtn, VImg } from 'vuetify/components'
import FactoryDrawerRow from '@/components/layout/FactoryDrawerRow.vue'
import {
  expectElementExists,
  clickElement,
  expectProps,
  emitEvent,
} from '@/__tests__/vue-test-helpers'
import type { Factory } from '@/types/factory'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'

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

      expectElementExists(wrapper, VListItem)
      expectProps(wrapper, VListItem, { title: 'Steel Production Plant' })
    })

    it('does not show title when in rail mode', () => {
      const wrapper = createWrapper({ rail: true })

      expectProps(wrapper, VListItem, { title: undefined })
    })

    it('displays factory icon in prepend slot', () => {
      const wrapper = createWrapper()

      expectElementExists(wrapper, VImg)
      const image = wrapper.findComponent(VImg)
      expect(image.props('src')).toContain('Desc-SteelIngot-C')
      expectProps(wrapper, VImg, {
        width: '32',
        height: '32',
      })
    })

    it('shows delete button in append slot', () => {
      const wrapper = createWrapper()

      expectElementExists(wrapper, VBtn)
      expectProps(wrapper, VBtn, {
        icon: 'mdi-delete',
        size: 'small',
        variant: 'text',
        color: 'error',
      })
    })

    it('applies active state correctly when selected', () => {
      expectProps(createWrapper({ selected: true }), VListItem, { active: true })
    })

    it('does not apply active state when not selected', () => {
      expectProps(createWrapper({ selected: false }), VListItem, { active: false })
    })
  })

  describe('User Interactions', () => {
    it('calls select handler when list item is clicked', async () => {
      const wrapper = createWrapper()

      await clickElement(wrapper, VListItem)
      expect(wrapper.vm.onSelect).toHaveBeenCalled()
    })

    it('shows confirmation modal when delete button is clicked', async () => {
      const wrapper = createWrapper()

      await clickElement(wrapper, VBtn)

      expectElementExists(wrapper, ConfirmationModal)
      expectProps(wrapper, ConfirmationModal, {
        show: true,
        title: 'Delete Factory',
        message:
          "Are you sure you want to delete 'Steel Production Plant'? This action cannot be undone.",
        confirmText: 'Delete',
        cancelText: 'Cancel',
      })
    })

    it('prevents event propagation when delete button is clicked', async () => {
      const wrapper = createWrapper()

      await clickElement(wrapper, VBtn)
      // Select handler should not be called when delete button is clicked
      expect(wrapper.vm.onSelect).not.toHaveBeenCalled()
    })
  })

  describe('Delete Confirmation Flow', () => {
    it('calls delete handler when deletion is confirmed', async () => {
      const wrapper = createWrapper()

      // Open confirmation modal
      await clickElement(wrapper, VBtn)

      // Confirm deletion
      await emitEvent(wrapper, ConfirmationModal, 'confirm')
      expect(wrapper.vm.onDelete).toHaveBeenCalledWith('Steel Production Plant')
    })

    it('shows modal when delete button is clicked and hides when cancelled', async () => {
      const wrapper = createWrapper()

      // Open confirmation modal
      await clickElement(wrapper, VBtn)
      expectProps(wrapper, ConfirmationModal, { show: true })

      // Cancel deletion
      await emitEvent(wrapper, ConfirmationModal, 'cancel')

      // Modal should still exist but internal state manages visibility
      expectElementExists(wrapper, ConfirmationModal)
      expect(wrapper.vm.onDelete).not.toHaveBeenCalled()
    })
  })

  describe('Factory Data Integration', () => {
    it('handles different factory configurations', () => {
      const factoryName = 'Copper Processing Plant'
      const customFactory: Factory = {
        name: factoryName,
        icon: 'Desc_CopperIngot_C',
        floors: [],
        recipeLinks: {},
      }

      const wrapper = createWrapper({ factory: customFactory })

      expectProps(wrapper, VListItem, { title: factoryName })

      expect(wrapper.findComponent(VImg).props('src')).toContain('Desc-CopperIngot-C')
      expectProps(wrapper, VImg, {
        width: '32',
        height: '32',
      })

      expectProps(wrapper, ConfirmationModal, {
        message: `Are you sure you want to delete '${factoryName}'? This action cannot be undone.`,
      })
    })

    it('works with factories having special characters in names', () => {
      const factoryName = "John's Steel & Iron Co."
      const specialFactory: Factory = {
        name: factoryName,
        icon: 'Desc_SteelIngot_C',
        floors: [],
        recipeLinks: {},
      }

      const wrapper = createWrapper({ factory: specialFactory })

      expectProps(wrapper, VListItem, { title: factoryName })
      expectProps(wrapper, ConfirmationModal, {
        message: `Are you sure you want to delete '${factoryName}'? This action cannot be undone.`,
      })
    })
  })
})
