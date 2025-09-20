# Composable Mocks

This directory provides utilities to abstract repetitive composable mocking in factory component tests.

## Usage

### Basic Setup (works out of the box with sensible defaults)

```ts
vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

vi.mock('@/composables/useFloorManagement', async () => {
  const { mockUseFloorManagement } = await import('@/__tests__/fixtures/composables')
  return { useFloorManagement: mockUseFloorManagement }
})

vi.mock('@/composables/useRecipeStatus', async () => {
  const { mockUseRecipeStatus } = await import('@/__tests__/fixtures/composables')
  return { useRecipeStatus: mockUseRecipeStatus }
})
```

### Component Mocking for Modal/Dialog Testing

When testing components that render complex modals or dialogs that cause DOM issues in test environments:

```ts
// Mock modal components while preserving prop behavior
vi.mock('@/components/modals/ImportExportModal.vue', () => ({
  default: {
    name: 'ImportExportModal',
    props: ['modelValue'],
    template: '<div data-testid="import-export-modal">Mock Modal</div>',
  },
}))
```

This allows testing that props are passed correctly without dealing with modal rendering complexities.

### Testing Reactive State Changes

Mock stores should all provide reactive refs that can be modified during tests to test behavioral changes:

```ts
import { mockSelectedFactory } from '@/__tests__/fixtures/composables/factoryStore'

it('shows factory chip when factory is selected', () => {
  const testFactoryName = 'Steel Production Plant'
  mockSelectedFactory.value = testFactoryName

  const wrapper = createWrapper()

  const chip = wrapper.findComponent({ name: 'VChip' })
  expect(chip.exists()).toBe(true)
  expect(chip.text()).toBe(testFactoryName)
})

it('hides factory chip when no factory is selected', () => {
  mockSelectedFactory.value = ''

  const wrapper = createWrapper()

  const chip = wrapper.findComponent({ name: 'VChip' })
  expect(chip.exists()).toBe(false)
})
```

Always reset reactive state in `beforeEach`:

```ts
beforeEach(() => {
  mockSelectedFactory.value = ''
})
```

### Custom Mocks (when you need different behavior)

```ts
// For a specific test, you can use mockImplementation to customize:
beforeEach(() => {
  const { mockUseRecipeStatus } = require('@/__tests__/fixtures/composables')
  mockUseRecipeStatus.mockImplementation(() => ({
    isRecipeComplete: vi.fn(() => true), // Custom behavior
    isLinkBuilt: vi.fn(() => false),
    // ... other defaults remain
  }))
})
```

## Before/After Example

### Before (20+ lines of boilerplate):

```ts
vi.mock('@/composables/useStores', () => ({
  getStores: vi.fn(() => ({
    dataStore: createMockDataStore(),
    themeStore: { isDark: false },
  })),
}))

vi.mock('@/composables/useFloorManagement', () => ({
  useFloorManagement: vi.fn(() => ({
    getEligibleFloors: vi.fn(() => []),
    moveRecipe: vi.fn(),
    getFloorDisplayName: vi.fn(
      (floorNumber: number, floor?: any) =>
        `Floor ${floorNumber}` + (floor?.name ? ` - ${floor.name}` : ''),
    ),
    openFloorEditor: vi.fn(),
  })),
}))
```

### After (4 lines):

```ts
vi.mock('@/composables/useStores', async () => {
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})
```

## Testing Patterns

### Finding Interactive Elements by Behavior

Focus on what elements do, not how they're implemented:

```ts
// ✅ Good - find by functionality and content
const buttons = wrapper.findAllComponents({ name: 'VBtn' })
const importBtn = buttons.find((btn) => btn.text().includes('Import/Export'))

// ✅ Good - find by semantic meaning
const modal = wrapper.findComponent({ name: 'ImportExportModal' })
expect(modal.exists()).toBe(true)
const submitBtn = wrapper.find('button[type="submit"]')
expect(submitBtn.exists()).toBe(false)

// ❌ Avoid - testing implementation details
const importBtn = wrapper.find('v-btn[color="secondary"][variant="outlined"]')
const responsiveText = wrapper.find('.d-none.d-md-inline')
```

### Testing User Interactions and State Changes

Test that interactions produce the expected behavior:

```ts
it('opens import/export modal when button is clicked', async () => {
  const wrapper = createWrapper()

  const buttons = wrapper.findAllComponents({ name: 'VBtn' })
  const importBtn = buttons.find((btn) => btn.text().includes('Import/Export'))

  await importBtn!.trigger('click')

  const modal = wrapper.findComponent({ name: 'ImportExportModal' })
  expect(modal.props('modelValue')).toBe(true)
})
```

## Available Composable Mocks

- `mockGetStores` - Store access with mock data store
- `mockUseFloorManagement` - Floor operations and navigation helpers
- `mockUseRecipeStatus` - Recipe completion and link status
- `mockFormatRecipeId` / `mockFormatFloorId` - ID formatting utilities
- `mockUseLinkData` - Material link data and transport info

All mocks include sensible defaults based on actual test usage patterns.
