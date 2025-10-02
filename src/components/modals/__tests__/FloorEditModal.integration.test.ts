import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { VBtn, VCard, VCardTitle, VTextField } from 'vuetify/components'
import FloorEditModal from '@/components/modals/FloorEditModal.vue'
import ItemSelector from '@/components/common/ItemSelector.vue'
import { component } from '@/__tests__/vue-test-helpers'
import {
  mockShowFloorEditor,
  mockGetFloorFormsTemplate,
  mockHasFloorFormChanges,
  mockUpdateFloorsFromForms,
  mockCloseFloorEditor,
  mockGetFloorDisplayName,
} from '@/__tests__/fixtures/composables/navigation'

vi.mock('@/composables/useFloorManagement', async () => {
  const { mockUseFloorManagement } = await import('@/__tests__/fixtures/composables')
  return { useFloorManagement: mockUseFloorManagement }
})

describe('FloorEditModal Integration', () => {
  const createWrapper = () => {
    return mount(FloorEditModal)
  }

  beforeEach(() => {
    mockShowFloorEditor.value = false
    mockGetFloorFormsTemplate.mockReturnValue([])
    mockHasFloorFormChanges.mockReturnValue(false)
    mockUpdateFloorsFromForms.mockClear()
    mockCloseFloorEditor.mockClear()
  })

  describe('Rendering', () => {
    it('does not render when showFloorEditor is false', () => {
      mockShowFloorEditor.value = false

      const wrapper = createWrapper()

      component(wrapper, VCard).assert({ exists: false })
    })

    it('renders modal when showFloorEditor is true', async () => {
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Main Production',
          item: undefined,
          originalName: 'Main Production',
          originalItem: undefined,
        },
      ])

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      component(wrapper, VCard).assert()
      component(wrapper, VCardTitle).assert({ text: 'Edit Floor' })
    })

    it('shows plural title when editing multiple floors', async () => {
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Floor 1',
          item: undefined,
          originalName: 'Floor 1',
          originalItem: undefined,
        },
        {
          index: 1,
          name: 'Floor 2',
          item: undefined,
          originalName: 'Floor 2',
          originalItem: undefined,
        },
      ])

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      component(wrapper, VCardTitle).assert({ text: 'Edit Floors' })
    })

    it('renders floor form with text field and item selector', async () => {
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Production',
          item: undefined,
          originalName: 'Production',
          originalItem: undefined,
        },
      ])

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      component(wrapper, VTextField).assert()
      component(wrapper, ItemSelector).assert()
    })

    it('displays floor display name in card title', async () => {
      mockGetFloorDisplayName.mockReturnValue('Floor 1 - Production')
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Production',
          item: undefined,
          originalName: 'Production',
          originalItem: undefined,
        },
      ])

      createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      expect(mockGetFloorDisplayName).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          name: 'Production',
          recipes: [],
        }),
      )
    })
  })

  describe('Form Interactions', () => {
    it('renders cancel and save buttons', async () => {
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: '',
          item: undefined,
          originalName: '',
          originalItem: undefined,
        },
      ])

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Cancel')
        .assert()
      component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Save Changes')
        .assert()
    })

    it('disables save button when no changes', async () => {
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Floor 1',
          item: undefined,
          originalName: 'Floor 1',
          originalItem: undefined,
        },
      ])
      mockHasFloorFormChanges.mockReturnValue(false)

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Save Changes')
        .assert({ props: { disabled: true } })
    })

    it('enables save button when changes detected', async () => {
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Floor 1',
          item: undefined,
          originalName: 'Floor 1',
          originalItem: undefined,
        },
      ])
      mockHasFloorFormChanges.mockReturnValue(true)

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Save Changes')
        .assert({ props: { disabled: false } })
    })

    it('calls closeFloorEditor when cancel is clicked', async () => {
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: '',
          item: undefined,
          originalName: '',
          originalItem: undefined,
        },
      ])

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      await component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Cancel')
        .click()

      expect(mockCloseFloorEditor).toHaveBeenCalled()
    })

    it('calls updateFloorsFromForms and closeFloorEditor when save is clicked', async () => {
      const floorForms = [
        {
          index: 0,
          name: 'Updated Name',
          item: undefined,
          originalName: 'Original Name',
          originalItem: undefined,
        },
      ]
      mockGetFloorFormsTemplate.mockReturnValue(floorForms)
      mockHasFloorFormChanges.mockReturnValue(true)

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      await component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Save Changes')
        .click()

      expect(mockUpdateFloorsFromForms).toHaveBeenCalled()
      expect(mockCloseFloorEditor).toHaveBeenCalled()
    })
  })
})
