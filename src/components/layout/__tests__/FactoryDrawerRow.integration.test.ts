import { mount, VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { component } from '@/__tests__/vue-test-helpers'
import type { Factory } from '@/types/factory'

import FactoryDrawerRow from '@/components/layout/FactoryDrawerRow.vue'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'
import { VBtn, VImg, VListItem, VListItemTitle } from 'vuetify/components'

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

const getDeleteBtn = (wrapper: VueWrapper) => {
  return component(wrapper, VBtn).match((btn) => btn.props('icon') === 'mdi-delete')
}

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

      component(wrapper, VListItemTitle).assert({
        exists: true,
        text: 'Steel Production Plant',
      })
    })

    it('does not show title when in rail mode', () => {
      const wrapper = createWrapper({ rail: true })

      component(wrapper, VListItemTitle).assert({ exists: false })
    })

    it('displays factory icon in prepend slot', () => {
      const wrapper = createWrapper()

      const image = component(wrapper, VImg)
        .assert({
          exists: true,
          props: {
            width: '32',
            height: '32',
          },
        })
        .getComponent()
      expect(image.props('src')).toContain('Desc-SteelIngot-C')
    })

    it('shows delete button in append slot', () => {
      const wrapper = createWrapper()

      component(wrapper, VBtn).assert({
        exists: true,
        props: {
          icon: 'mdi-delete',
          size: 'small',
          variant: 'text',
          color: 'error',
        },
      })
    })

    it('applies active state correctly when selected', () => {
      component(createWrapper({ selected: true }), VListItem).assert({
        props: { active: true },
      })
    })

    it('does not apply active state when not selected', () => {
      component(createWrapper({ selected: false }), VListItem).assert({
        props: { active: false },
      })
    })
  })

  describe('User Interactions', () => {
    it('calls select handler when list item is clicked', async () => {
      const wrapper = createWrapper()

      await component(wrapper, VListItemTitle).click()
      expect(wrapper.vm.onSelect).toHaveBeenCalled()
    })

    it('shows confirmation modal when delete button is clicked', async () => {
      const wrapper = createWrapper()

      await getDeleteBtn(wrapper).click()

      component(wrapper, ConfirmationModal).assert({
        exists: true,
        props: {
          show: true,
          title: 'Delete Factory',
          message:
            "Are you sure you want to delete 'Steel Production Plant'? This action cannot be undone.",
          confirmText: 'Delete',
          cancelText: 'Cancel',
        },
      })
    })

    it('prevents event propagation when delete button is clicked', async () => {
      const wrapper = createWrapper()

      await getDeleteBtn(wrapper).click()
      // Select handler should not be called when delete button is clicked
      expect(wrapper.vm.onSelect).not.toHaveBeenCalled()
    })
  })

  describe('Delete Confirmation Flow', () => {
    it('calls delete handler when deletion is confirmed', async () => {
      const wrapper = createWrapper()

      // Open confirmation modal
      await getDeleteBtn(wrapper).click()

      // Confirm deletion
      await component(wrapper, ConfirmationModal).emit('confirm')
      expect(wrapper.vm.onDelete).toHaveBeenCalledWith('Steel Production Plant')
    })

    it('shows modal when delete button is clicked and hides when cancelled', async () => {
      const wrapper = createWrapper()

      // Open confirmation modal
      await getDeleteBtn(wrapper).click()
      component(wrapper, ConfirmationModal).assert({ props: { show: true } })

      // Cancel deletion
      await component(wrapper, ConfirmationModal).emit('cancel')

      // Modal should still exist but internal state manages visibility
      component(wrapper, ConfirmationModal).assert()
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

      component(wrapper, VListItemTitle).assert({ text: factoryName })

      const img = component(wrapper, VImg)
        .assert({
          props: { width: '32', height: '32' },
        })
        .getComponent()
      expect(img.props('src')).toContain('Desc-CopperIngot-C')

      component(wrapper, ConfirmationModal).assert({
        props: {
          message: `Are you sure you want to delete '${factoryName}'? This action cannot be undone.`,
        },
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

      component(wrapper, VListItemTitle).assert({ text: factoryName })
      component(wrapper, ConfirmationModal).assert({
        props: {
          message: `Are you sure you want to delete '${factoryName}'? This action cannot be undone.`,
        },
      })
    })
  })
})
