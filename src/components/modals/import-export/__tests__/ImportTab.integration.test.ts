import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  mockAddFactoryToAutoSync,
  mockCloudSyncStore,
} from '@/__tests__/fixtures/composables/cloudSyncStore'
import {
  mockFileInput,
  mockHandleFileImport,
  mockImportFromClipboard,
  mockImportFromFile,
} from '@/__tests__/fixtures/composables/dataShare'
import { mockFactories, mockImportFactories } from '@/__tests__/fixtures/composables/factoryStore'
import { component } from '@/__tests__/vue-test-helpers'
import type { Factory } from '@/types/factory'
import { parseFactoriesFromJson } from '@/types/factory'

import FactorySelector from '@/components/common/FactorySelector.vue'
import ImportTab from '@/components/modals/import-export/ImportTab.vue'
import { VBtn, VCard, VCheckbox } from 'vuetify/components'

// Mock parseFactoriesFromJson
vi.mock('@/types/factory', async () => {
  const actual = await vi.importActual('@/types/factory')
  return {
    ...actual,
    parseFactoriesFromJson: vi.fn(),
  }
})

vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

vi.mock('@/stores/cloudSync', async () => {
  const { mockCloudSyncStore } = await import('@/__tests__/fixtures/composables/cloudSyncStore')
  return { useCloudSyncStore: () => mockCloudSyncStore }
})

vi.mock('@/composables/useDataShare', async () => {
  const { mockUseDataShare } = await import('@/__tests__/fixtures/composables')
  return { useDataShare: () => mockUseDataShare }
})

const TEST_FACTORIES = {
  IRON: 'Iron Factory',
  COPPER: 'Copper Factory',
}

describe('ImportTab Integration', () => {
  const testFactories: Record<string, Factory> = {
    [TEST_FACTORIES.IRON]: {
      name: TEST_FACTORIES.IRON,
      icon: 'iron-icon',
      floors: [],
      recipeLinks: {},
    },
    [TEST_FACTORIES.COPPER]: {
      name: TEST_FACTORIES.COPPER,
      icon: 'copper-icon',
      floors: [],
      recipeLinks: {},
    },
  }

  const createWrapper = () => {
    return mount(ImportTab)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mockImplementation changes from previous tests (e.g., tests that make it throw)
    mockImportFactories.mockReset()
    vi.mocked(parseFactoriesFromJson).mockReturnValue(testFactories)
    mockImportFromClipboard.mockResolvedValue('{"test": "data"}')
    mockHandleFileImport.mockResolvedValue('{"test": "data"}')
    mockFileInput.value = { value: '' } as HTMLInputElement
  })

  it('renders import source buttons', () => {
    const wrapper = createWrapper()

    component(wrapper, VBtn).assert({
      exists: true,
      text: 'From Clipboard',
    })
    component(wrapper, VBtn).assert({
      exists: true,
      text: 'Upload File',
    })
  })

  it('shows message when no data is loaded', () => {
    component(createWrapper(), VCard).assert({
      text: 'Use the buttons above to load factory data',
    })
  })

  it('does not show FactorySelector initially', () => {
    component(createWrapper(), FactorySelector).assert({
      exists: false,
    })
  })

  it('loads factories from clipboard when clipboard button is clicked', async () => {
    const wrapper = createWrapper()
    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('From Clipboard'))
      .click()

    expect(mockImportFromClipboard).toHaveBeenCalled()
    expect(vi.mocked(parseFactoriesFromJson)).toHaveBeenCalledWith('{"test": "data"}')
  })

  it('triggers file input when upload file button is clicked', async () => {
    const wrapper = createWrapper()
    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('Upload File'))
      .click()

    expect(mockImportFromFile).toHaveBeenCalled()
  })

  it('shows FactorySelector after successful data load', async () => {
    const wrapper = createWrapper()
    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('From Clipboard'))
      .click()

    component(wrapper, FactorySelector).assert()
  })

  it('passes correct props to FactorySelector', async () => {
    const wrapper = createWrapper()
    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('From Clipboard'))
      .click()

    component(wrapper, FactorySelector).assert({
      props: {
        modelValue: [],
        factories: Object.values(testFactories),
        title: 'Select Factories to Import',
      },
    })
  })

  it('displays import count correctly for single factory', async () => {
    const wrapper = createWrapper()
    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('From Clipboard'))
      .click()

    await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.IRON])
    component(wrapper, ImportTab).assert({ text: '1 factory selected' })
  })

  it('displays import count correctly for multiple factories', async () => {
    const wrapper = createWrapper()
    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('From Clipboard'))
      .click()

    await component(wrapper, FactorySelector).emit('update:modelValue', [
      TEST_FACTORIES.IRON,
      TEST_FACTORIES.COPPER,
    ])

    component(wrapper, ImportTab).assert({ text: '2 factories selected' })
  })

  it('has import button disabled when no factories selected', async () => {
    const wrapper = createWrapper()
    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('From Clipboard'))
      .click()

    component(wrapper, VBtn).assert({ text: 'Import', attributes: { disabled: '' } })
  })

  it('enables import button when factories are selected', async () => {
    const wrapper = createWrapper()
    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('From Clipboard'))
      .click()

    await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.IRON])

    component(wrapper, VBtn).assert({ text: 'Import', attributes: { disabled: undefined } })
  })

  it('calls factoryStore.importFactories when import button is clicked', async () => {
    const wrapper = createWrapper()
    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('From Clipboard'))
      .click()

    await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.IRON])

    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('Import'))
      .click()

    expect(mockImportFactories).toHaveBeenCalledWith({
      [TEST_FACTORIES.IRON]: testFactories[TEST_FACTORIES.IRON],
    })
  })

  it('emits success when import is successful', async () => {
    const wrapper = createWrapper()
    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('From Clipboard'))
      .click()

    await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.IRON])

    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('Import'))
      .click()

    expect(wrapper.emitted('success')).toEqual([[]])
  })

  it('emits error when clipboard loading fails', async () => {
    const wrapper = createWrapper()
    mockImportFromClipboard.mockRejectedValue(new Error('Clipboard error'))

    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('From Clipboard'))
      .click()

    expect(wrapper.emitted('error')).toEqual([['Clipboard error']])
  })

  it('emits error when file parsing fails', async () => {
    const wrapper = createWrapper()
    vi.mocked(parseFactoriesFromJson).mockImplementation(() => {
      throw new Error('Parse error')
    })

    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('From Clipboard'))
      .click()

    expect(wrapper.emitted('error')).toEqual([['Parse error']])
  })

  it('emits error when factoryStore.importFactories fails', async () => {
    const wrapper = createWrapper()
    mockImportFactories.mockImplementation(() => {
      throw new Error('Import error')
    })

    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('From Clipboard'))
      .click()

    await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.IRON])

    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('Import'))
      .click()

    expect(wrapper.emitted('error')).toEqual([['Import error']])
  })

  it('handles file change event', async () => {
    const wrapper = createWrapper()
    const fileInput = wrapper.find('input[type="file"]')

    await fileInput.trigger('change')

    expect(mockHandleFileImport).toHaveBeenCalledWith(expect.any(Event))
    expect(vi.mocked(parseFactoriesFromJson)).toHaveBeenCalled()
  })

  it('emits error with string message when error is not an Error object', async () => {
    const wrapper = createWrapper()
    mockImportFromClipboard.mockRejectedValue('String error')

    await component(wrapper, VBtn)
      .match((btn) => btn.text().includes('From Clipboard'))
      .click()

    expect(wrapper.emitted('error')).toEqual([['Import failed: String error']])
  })

  describe('Name Collision Detection', () => {
    beforeEach(() => {
      // Set up an existing factory that conflicts with Iron Factory
      mockFactories.value = {
        [TEST_FACTORIES.IRON]: {
          name: TEST_FACTORIES.IRON,
          icon: 'existing-iron-icon',
          floors: [],
          recipeLinks: {},
        },
      }
    })

    afterEach(() => {
      mockFactories.value = {}
    })

    it('shows conflict warning for factories that already exist', async () => {
      const wrapper = createWrapper()
      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('From Clipboard'))
        .click()

      // The Iron Factory should show a conflict warning
      expect(wrapper.text()).toContain('Name conflict')
    })

    it('disables import button when selected factory has conflict', async () => {
      const wrapper = createWrapper()
      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('From Clipboard'))
        .click()

      // Select the conflicting factory
      await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.IRON])

      // Import button should be disabled
      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Import'))
        .assert({ attributes: { disabled: '' } })
    })

    it('enables import button when selecting non-conflicting factory', async () => {
      const wrapper = createWrapper()
      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('From Clipboard'))
        .click()

      // Select only the non-conflicting Copper Factory
      await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.COPPER])

      // Import button should be enabled
      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Import'))
        .assert({ attributes: { disabled: undefined } })
    })

    it('shows rename button for conflicting factories', async () => {
      const wrapper = createWrapper()
      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('From Clipboard'))
        .click()

      // Should have a Rename button visible
      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Rename'))
        .assert()
    })

    it('shows conflict count in selection summary', async () => {
      const wrapper = createWrapper()
      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('From Clipboard'))
        .click()

      // Select the conflicting factory
      await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.IRON])

      expect(wrapper.text()).toContain('1 with conflicts')
    })
  })

  describe('Auto-sync Checkbox', () => {
    const findAutoSyncCheckbox = (wrapper: ReturnType<typeof createWrapper>) =>
      component(wrapper, VCheckbox).match(
        (cb) => cb.props('label') === 'Auto-sync imported factories',
      )

    beforeEach(() => {
      mockCloudSyncStore.autoSync.enabled = false
    })

    it('does not show auto-sync checkbox when auto-sync is disabled', async () => {
      mockCloudSyncStore.autoSync.enabled = false
      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('From Clipboard'))
        .click()

      findAutoSyncCheckbox(wrapper).assert({ exists: false })
    })

    it('shows auto-sync checkbox when auto-sync is enabled', async () => {
      mockCloudSyncStore.autoSync.enabled = true
      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('From Clipboard'))
        .click()

      findAutoSyncCheckbox(wrapper).assert()
    })

    it('adds factories to auto-sync when checkbox is checked', async () => {
      mockCloudSyncStore.autoSync.enabled = true
      // Use spyOn to track calls on the mock store's method
      const addToAutoSyncSpy = vi.spyOn(mockCloudSyncStore, 'addFactoryToAutoSync')

      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('From Clipboard'))
        .click()

      await component(wrapper, FactorySelector).emit('update:modelValue', [
        TEST_FACTORIES.IRON,
        TEST_FACTORIES.COPPER,
      ])

      // Check the auto-sync checkbox by emitting update:modelValue directly
      const autoSyncCb = wrapper
        .findAllComponents(VCheckbox)
        .find((cb) => cb.props('label') === 'Auto-sync imported factories')
      expect(autoSyncCb).toBeDefined()
      await autoSyncCb!.vm.$emit('update:modelValue', true)
      await wrapper.vm.$nextTick()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Import'))
        .click()

      expect(mockImportFactories).toHaveBeenCalled()
      expect(addToAutoSyncSpy).toHaveBeenCalledWith(TEST_FACTORIES.IRON)
      expect(addToAutoSyncSpy).toHaveBeenCalledWith(TEST_FACTORIES.COPPER)
      expect(addToAutoSyncSpy).toHaveBeenCalledTimes(2)
    })

    it('does not add factories to auto-sync when checkbox is unchecked', async () => {
      mockCloudSyncStore.autoSync.enabled = true
      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('From Clipboard'))
        .click()

      await component(wrapper, FactorySelector).emit('update:modelValue', [TEST_FACTORIES.IRON])

      // Import without checking the checkbox
      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Import'))
        .click()

      expect(mockAddFactoryToAutoSync).not.toHaveBeenCalled()
    })
  })
})
