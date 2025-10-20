import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import {
  mockCanRemoveFloor,
  mockCloseFloorEditor,
  mockEditFloorIndex,
  mockGetFloorDisplayName,
  mockGetFloorFormsTemplate,
  mockHasFloorFormChanges,
  mockInsertFloor,
  mockRemoveFloor,
  mockShowFloorEditor,
  mockUpdateFloorsFromForms,
} from '@/__tests__/fixtures/composables/floorManagement'
import { component } from '@/__tests__/vue-test-helpers'

import ItemSelector from '@/components/common/ItemSelector.vue'
import FloorEditModal from '@/components/modals/FloorEditModal.vue'
import { VBtn, VCard, VCardTitle, VTextField } from 'vuetify/components'

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
    mockEditFloorIndex.value = null
    mockGetFloorFormsTemplate.mockReturnValue([])
    mockHasFloorFormChanges.mockReturnValue(false)
    mockUpdateFloorsFromForms.mockClear()
    mockCloseFloorEditor.mockClear()
    mockCanRemoveFloor.mockReturnValue(true)
    mockRemoveFloor.mockClear()
    mockInsertFloor.mockClear()
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

  describe('Delete Floor', () => {
    beforeEach(() => {
      mockCanRemoveFloor.mockReturnValue(true)
      mockRemoveFloor.mockClear()
      mockEditFloorIndex.value = null
    })

    it('is in edit all mode when editFloorIndex is null', async () => {
      mockEditFloorIndex.value = null
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Floor 1',
          item: undefined,
          originalName: 'Floor 1',
          originalItem: undefined,
        },
      ])

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      // In edit all mode, insert buttons should be visible
      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Insert Floor'))
        .assert()
    })

    it('is in single floor mode when editFloorIndex is set', async () => {
      mockEditFloorIndex.value = 0
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Floor 1',
          item: undefined,
          originalName: 'Floor 1',
          originalItem: undefined,
        },
      ])

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      // In single floor mode, insert buttons should not be visible
      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Insert Floor'))
        .assert({ exists: false })
    })

    it('renders delete button for each floor', async () => {
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Floor 1',
          item: undefined,
          originalName: 'Floor 1',
          originalItem: undefined,
        },
      ])

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-delete')
        .assert()
    })

    it('enables delete button when floor can be removed', async () => {
      mockCanRemoveFloor.mockReturnValue(true)
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Floor 1',
          item: undefined,
          originalName: 'Floor 1',
          originalItem: undefined,
        },
      ])

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-delete')
        .assert({ props: { disabled: false } })
    })

    it('disables delete button when floor cannot be removed', async () => {
      mockCanRemoveFloor.mockReturnValue(false)
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Floor 1',
          item: undefined,
          originalName: 'Floor 1',
          originalItem: undefined,
        },
      ])

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-delete')
        .assert({ props: { disabled: true } })
    })

    it('calls removeFloor when delete button is clicked', async () => {
      mockCanRemoveFloor.mockReturnValue(true)
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Floor 1',
          item: undefined,
          originalName: 'Floor 1',
          originalItem: undefined,
        },
      ])

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      await component(wrapper, VBtn)
        .match((btn) => btn.props('icon') === 'mdi-delete')
        .click()

      expect(mockRemoveFloor).toHaveBeenCalledWith(0)
    })
  })

  describe('Insert Floor', () => {
    beforeEach(() => {
      mockInsertFloor.mockClear()
      mockEditFloorIndex.value = null // Edit all mode
    })

    it('renders insert floor buttons in edit all mode', async () => {
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Floor 1',
          item: undefined,
          originalName: 'Floor 1',
          originalItem: undefined,
        },
      ])

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      // Should have "Insert Floor at Beginning" and "Insert Floor" buttons
      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Insert Floor at Beginning'))
        .assert()
      component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Insert Floor')
        .assert()
    })

    it('does not render insert floor buttons in single floor mode', async () => {
      mockEditFloorIndex.value = 0 // Single floor mode
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Floor 1',
          item: undefined,
          originalName: 'Floor 1',
          originalItem: undefined,
        },
      ])

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Insert Floor'))
        .assert({ exists: false })
    })

    it('calls insertFloor with index 0 when clicking beginning button', async () => {
      mockGetFloorFormsTemplate.mockReturnValue([
        {
          index: 0,
          name: 'Floor 1',
          item: undefined,
          originalName: 'Floor 1',
          originalItem: undefined,
        },
      ])

      const wrapper = createWrapper()
      mockShowFloorEditor.value = true
      await nextTick()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Insert Floor at Beginning'))
        .click()

      expect(mockInsertFloor).toHaveBeenCalledWith(0)
    })

    it('calls insertFloor with correct index when clicking insert button', async () => {
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

      const insertButtons = component(wrapper, VBtn)
        .match((btn) => btn.text() === 'Insert Floor')
        .getComponents()

      // Click the first "Insert Floor" button (after first floor, index 1)
      await insertButtons[0].trigger('click')
      await nextTick()

      expect(mockInsertFloor).toHaveBeenCalledWith(1)
    })
  })
})
