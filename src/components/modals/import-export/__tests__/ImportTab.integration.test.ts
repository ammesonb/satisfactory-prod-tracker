import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ImportTab from '@/components/modals/import-export/ImportTab.vue'
import FactorySelector from '@/components/common/FactorySelector.vue'
import {
  expectElementExists,
  expectElementText,
  expectElementNotExists,
  getComponentWithText,
} from '@/__tests__/vue-test-helpers'
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
    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'From Clipboard')
    const uploadBtn = getComponentWithText(wrapper, VBtn, 'Upload File')

    expect(clipboardBtn).toBeTruthy()
    expect(uploadBtn).toBeTruthy()
  })

  it('shows message when no data is loaded', () => {
    expectElementText(createWrapper(), VCard, 'Use the buttons above to load factory data')
  })

  it('does not show FactorySelector initially', () => {
    expectElementNotExists(createWrapper(), FactorySelector)
  })

  it('loads factories from clipboard when clipboard button is clicked', async () => {
    const wrapper = createWrapper()
    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'From Clipboard')

    await clipboardBtn!.trigger('click')

    expect(mockImportFromClipboard).toHaveBeenCalled()
    expect(vi.mocked(parseFactoriesFromJson)).toHaveBeenCalledWith('{"test": "data"}')
  })

  it('triggers file input when upload file button is clicked', async () => {
    const wrapper = createWrapper()
    const uploadBtn = getComponentWithText(wrapper, VBtn, 'Upload File')
    await uploadBtn!.trigger('click')

    expect(mockImportFromFile).toHaveBeenCalled()
  })

  it('shows FactorySelector after successful data load', async () => {
    const wrapper = createWrapper()
    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'From Clipboard')

    await clipboardBtn!.trigger('click')

    expectElementExists(wrapper, FactorySelector)
  })

  it('passes correct props to FactorySelector', async () => {
    const wrapper = createWrapper()
    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'From Clipboard')
    await clipboardBtn!.trigger('click')

    const factorySelector = wrapper.findComponent(FactorySelector)
    expect(factorySelector.props()).toEqual({
      modelValue: [],
      factories: Object.values(testFactories),
      title: 'Select Factories to Import',
    })
  })

  it('displays import count correctly for single factory', async () => {
    const wrapper = createWrapper()
    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'From Clipboard')
    await clipboardBtn!.trigger('click')

    const factorySelector = wrapper.findComponent(FactorySelector)
    await factorySelector.vm.$emit('update:modelValue', [TEST_FACTORIES.IRON])

    expectElementText(wrapper, ImportTab, '1 factory selected')
  })

  it('displays import count correctly for multiple factories', async () => {
    const wrapper = createWrapper()
    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'From Clipboard')
    await clipboardBtn!.trigger('click')

    const factorySelector = wrapper.findComponent(FactorySelector)
    await factorySelector.vm.$emit('update:modelValue', [
      TEST_FACTORIES.IRON,
      TEST_FACTORIES.COPPER,
    ])

    expectElementText(wrapper, ImportTab, '2 factories selected')
  })

  it('has import button disabled when no factories selected', async () => {
    const wrapper = createWrapper()
    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'From Clipboard')
    await clipboardBtn!.trigger('click')

    const importBtn = getComponentWithText(wrapper, VBtn, 'Import')
    expect(importBtn?.attributes('disabled')).toBe('')
  })

  it('enables import button when factories are selected', async () => {
    const wrapper = createWrapper()
    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'From Clipboard')
    await clipboardBtn!.trigger('click')

    const factorySelector = wrapper.findComponent(FactorySelector)
    await factorySelector.vm.$emit('update:modelValue', [TEST_FACTORIES.IRON])

    const importBtn = getComponentWithText(wrapper, VBtn, 'Import')
    expect(importBtn?.attributes('disabled')).toBeUndefined()
  })

  it('calls factoryStore.importFactories when import button is clicked', async () => {
    const wrapper = createWrapper()
    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'From Clipboard')

    await clipboardBtn!.trigger('click')

    const factorySelector = wrapper.findComponent(FactorySelector)
    await factorySelector.vm.$emit('update:modelValue', [TEST_FACTORIES.IRON])

    const importBtn = getComponentWithText(wrapper, VBtn, 'Import')
    await importBtn!.trigger('click')

    expect(mockImportFactories).toHaveBeenCalledWith({
      [TEST_FACTORIES.IRON]: testFactories[TEST_FACTORIES.IRON],
    })
  })

  it('emits success when import is successful', async () => {
    const wrapper = createWrapper()
    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'From Clipboard')
    await clipboardBtn!.trigger('click')

    const factorySelector = wrapper.findComponent(FactorySelector)
    await factorySelector.vm.$emit('update:modelValue', [TEST_FACTORIES.IRON])

    const importBtn = getComponentWithText(wrapper, VBtn, 'Import')
    await importBtn!.trigger('click')

    expect(wrapper.emitted('success')).toEqual([[]])
  })

  it('emits error when clipboard loading fails', async () => {
    const wrapper = createWrapper()
    mockImportFromClipboard.mockRejectedValue(new Error('Clipboard error'))

    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'From Clipboard')
    await clipboardBtn!.trigger('click')

    expect(wrapper.emitted('error')).toEqual([['Clipboard error']])
  })

  it('emits error when file parsing fails', async () => {
    const wrapper = createWrapper()
    vi.mocked(parseFactoriesFromJson).mockImplementation(() => {
      throw new Error('Parse error')
    })

    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'From Clipboard')
    await clipboardBtn!.trigger('click')

    expect(wrapper.emitted('error')).toEqual([['Parse error']])
  })

  it('emits error when factoryStore.importFactories fails', async () => {
    const wrapper = createWrapper()
    mockImportFactories.mockImplementation(() => {
      throw new Error('Import error')
    })

    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'From Clipboard')
    await clipboardBtn!.trigger('click')

    const factorySelector = wrapper.findComponent(FactorySelector)
    await factorySelector.vm.$emit('update:modelValue', [TEST_FACTORIES.IRON])

    const importBtn = getComponentWithText(wrapper, VBtn, 'Import')
    await importBtn!.trigger('click')

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

    const clipboardBtn = getComponentWithText(wrapper, VBtn, 'From Clipboard')
    await clipboardBtn!.trigger('click')

    expect(wrapper.emitted('error')).toEqual([['Import failed: String error']])
  })
})
