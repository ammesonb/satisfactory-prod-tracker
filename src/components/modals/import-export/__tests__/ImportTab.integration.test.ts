import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ImportTab from '@/components/modals/import-export/ImportTab.vue'
import FactorySelector from '@/components/common/FactorySelector.vue'
import { component } from '@/__tests__/vue-test-helpers'
import type { Factory } from '@/types/factory'
import { parseFactoriesFromJson } from '@/types/factory'
import {
  mockImportFromClipboard,
  mockImportFromFile,
  mockHandleFileImport,
  mockFileInput,
} from '@/__tests__/fixtures/composables/dataShare'
import { mockImportFactories } from '@/__tests__/fixtures/composables/factoryStore'
import { VBtn, VCard } from 'vuetify/components'

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
})
