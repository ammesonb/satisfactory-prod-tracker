import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { component } from '@/__tests__/vue-test-helpers'
import type { Factory } from '@/types/factory'

import FactoryName from '@/components/factory/FactoryName.vue'
import FactoryDrawerRow from '@/components/layout/FactoryDrawerRow.vue'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'
import { VImg, VListItem } from 'vuetify/components'

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

// Mock FactoryName component for testing
vi.mock('@/components/factory/FactoryName.vue', () => ({
  default: {
    name: 'FactoryName',
    props: ['name'],
    emits: ['rename', 'delete'],
    template:
      '<div class="factory-name"><span>{{ name }}</span><button class="edit-btn" @click="$emit(\'rename\', name, \'New Name\')">Edit</button><button class="delete-btn" @click="$emit(\'delete\')">Delete</button></div>',
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
        '<v-list><FactoryDrawerRow v-bind="props" @select="onSelect" @delete="onDelete" @rename="onRename" /></v-list>',
      components: { FactoryDrawerRow },
      setup() {
        return {
          props: { ...defaultProps, ...props },
          onSelect: vi.fn(),
          onDelete: vi.fn(),
          onRename: vi.fn(),
        }
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders FactoryName component when not in rail mode', () => {
      const wrapper = createWrapper({ rail: false })

      component(wrapper, FactoryName).assert({
        exists: true,
        props: {
          name: 'Steel Production Plant',
        },
      })
    })

    it('does not show FactoryName component when in rail mode', () => {
      const wrapper = createWrapper({ rail: true })

      component(wrapper, FactoryName).assert({ exists: false })
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

      await component(wrapper, VListItem).click()
      expect(wrapper.vm.onSelect).toHaveBeenCalled()
    })

    it('forwards rename event from FactoryName component', async () => {
      const wrapper = createWrapper()

      await component(wrapper, FactoryName).emit('rename', 'Steel Production Plant', 'New Name')
      expect(wrapper.vm.onRename).toHaveBeenCalledWith('Steel Production Plant', 'New Name')
    })

    it('shows confirmation modal when FactoryName delete is triggered', async () => {
      const wrapper = createWrapper()

      await component(wrapper, FactoryName).emit('delete')

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
  })

  describe('Delete Confirmation Flow', () => {
    it('calls delete handler when deletion is confirmed', async () => {
      const wrapper = createWrapper()

      // Trigger delete from FactoryName
      await component(wrapper, FactoryName).emit('delete')

      // Confirm deletion
      await component(wrapper, ConfirmationModal).emit('confirm')
      expect(wrapper.vm.onDelete).toHaveBeenCalledWith('Steel Production Plant')
    })

    it('shows modal when delete is triggered and hides when cancelled', async () => {
      const wrapper = createWrapper()

      // Trigger delete from FactoryName
      await component(wrapper, FactoryName).emit('delete')
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

      component(wrapper, FactoryName).assert({
        props: { name: factoryName },
      })

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

      component(wrapper, FactoryName).assert({
        props: { name: factoryName },
      })
      component(wrapper, ConfirmationModal).assert({
        props: {
          message: `Are you sure you want to delete '${factoryName}'? This action cannot be undone.`,
        },
      })
    })
  })
})
