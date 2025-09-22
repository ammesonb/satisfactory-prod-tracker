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

Focus on what elements do, not how they're implemented. Use the Vue test helpers for cleaner assertions:

```ts
import {
  expectElementExists,
  expectElementNotExists,
  getComponent,
  clickElement,
  byComponent,
} from '@/__tests__/vue-test-helpers'

// ✅ Good - using test helpers for clean assertions
expectElementExists(wrapper, byComponent('VBtn'))
expectElementNotExists(wrapper, 'button[type="submit"]')

// ✅ Good - find by functionality and content
const buttons = wrapper.findAllComponents({ name: 'VBtn' })
const importBtn = buttons.find((btn) => btn.text().includes('Import/Export'))

// ✅ Good - using helpers for component interaction
await clickElement(wrapper, byComponent('VFab'))
const modal = getComponent(wrapper, byComponent('ImportExportModal'))
expect(modal.props('modelValue')).toBe(true)

// ❌ Avoid - testing implementation details
const importBtn = wrapper.find('v-btn[color="secondary"][variant="outlined"]')
const responsiveText = wrapper.find('.d-none.d-md-inline')
```

### Testing User Interactions and State Changes

Test that interactions produce the expected behavior using the Vue test helpers:

```ts
import { clickElement, emitEvent, byComponent, getComponent } from '@/__tests__/vue-test-helpers'

it('opens import/export modal when button is clicked', async () => {
  const wrapper = createWrapper()

  const buttons = wrapper.findAllComponents({ name: 'VBtn' })
  const importBtn = buttons.find((btn) => btn.text().includes('Import/Export'))

  await importBtn!.trigger('click')

  const modal = getComponent(wrapper, byComponent('ImportExportModal'))
  expect(modal.props('modelValue')).toBe(true)
})

// Using helpers for cleaner event handling
it('closes modal on close event', async () => {
  const wrapper = createWrapper()

  await emitEvent(wrapper, byComponent('ImportExportModal'), 'close')
  expectElementNotExists(wrapper, byComponent('ImportExportModal'))
})
```

## Vue Test Helpers

The `@/__tests__/vue-test-helpers` module provides utilities for cleaner test assertions:

### Available Functions

- `getElement(wrapper, selector)` - Gets element or component (accepts string or `{ name: string }`)
- `getComponent(wrapper, selector)` - Gets component specifically (for accessing props, etc.)
- `expectElementExists(wrapper, selector)` - Assert element/component exists
- `expectElementNotExists(wrapper, selector)` - Assert element/component doesn't exist
- `clickElement(wrapper, selector)` - Click element and wait for Vue update
- `emitEvent(wrapper, selector, event, ...args)` - Emit event from component
- `byComponent(name)` - Helper to create component selector

### Example Usage

```ts
import {
  expectElementExists,
  expectElementNotExists,
  clickElement,
  emitEvent,
  byComponent,
  getComponent,
} from '@/__tests__/vue-test-helpers'

// Clean assertions
expectElementExists(wrapper, byComponent('VFab'))
expectElementNotExists(wrapper, '#error-message')

// Component interactions
await clickElement(wrapper, byComponent('VBtn'))
await emitEvent(wrapper, byComponent('NavPanel'), 'navigate', 'floor-1')

// Accessing component props
const fab = getComponent(wrapper, byComponent('VFab'))
expect(fab.props('icon')).toBe('mdi-map')
```

## Available Composable Mocks

- `mockGetStores` - Store access with mock data store
- `mockUseFloorManagement` - Floor operations and navigation helpers
- `mockUseRecipeStatus` - Recipe completion and link status
- `mockFormatRecipeId` / `mockFormatFloorId` - ID formatting utilities
- `mockUseLinkData` - Material link data and transport info
- `mockUseFloorNavigation` - Floor navigation and expansion state

All mocks include sensible defaults based on actual test usage patterns.
