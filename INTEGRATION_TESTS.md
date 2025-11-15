# Vue/Vuetify Integration Testing Guide

## Overview

This project uses Vitest with Vue Test Utils for component integration testing, emphasizing **integration over isolation** - test components with real dependencies rather than heavily mocked ones.

## Test Writing Process

**DO NOT SKIP THE REVIEW STEP AT THE END.**

1. **Examine the component** - Understand its props, composables, and user interactions
2. **Write tests with DRY principles** - Create reusable helper functions
3. **Run tests** - `npm run test` until all pass
4. **Run fix+test** - YOU MUST USE `npm run fix+test` for formatting, linting, type compliance, and tests
5. **Fix** all issues reported by the previous command
6. **Repeat steps 4-5** until all commands pass
7. **Critique the current set of changes, checking for issues such as broken reactivity, adherence to best practices, etc**:
   - Use `git status` and `git diff` to examine ALL uncommitted files

## Test Configuration

### Setup Files (`vitest.config.ts`)

- **Environment**: `happy-dom` for DOM simulation
- **Component Auto-Import**: Via `unplugin-vue-components` with Vuetify3Resolver
- **Two-tier setup**:
  - `./src/logistics/__tests__/test-setup.ts` - Store mocking for logic tests
  - `./src/components/__tests__/component-setup.ts` - Full component setup with Vuetify and mock stores

### Available Mock Stores

Mock stores are provided via injection from `@/__tests__/fixtures/`:

```typescript
const mockDataStore = createMockDataStore() // Full fixture data
const mockFactoryStore = {} // Empty - extend per IFactoryStore interface
const mockThemeStore = {} // Empty - extend per IThemeStore interface
const mockErrorStore = {} // Empty - extend per IErrorStore interface
```

All interfaces defined in `@/types/stores.ts`.

## Vue Test Helpers

> **See [src/__tests__/VUE_TEST_HELPERS.md](src/__tests__/VUE_TEST_HELPERS.md) for detailed API documentation and examples.**

Quick reference for the fluent test helper API:

```typescript
import { element, component } from '@/__tests__/vue-test-helpers'
import { VBtn } from 'vuetify/components'

// Basic usage
component(wrapper, VBtn).assert()
await component(wrapper, VBtn).match((btn) => btn.text().includes('Save')).click()

// Reuse matched helpers
const saveBtn = component(wrapper, VBtn).match((btn) => btn.text() === 'Save')
saveBtn.assert()
await saveBtn.click()
```

## Writing Integration Tests

### Example Test Structure

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VBtn } from 'vuetify/components'
import ComponentName from '@/components/path/ComponentName.vue'
import { component, element } from '@/__tests__/vue-test-helpers'

import Modal from '@/components/modals/Modal.vue'

// Mock composables with centralized fixtures
vi.mock('@/composables/useStores', async () => {
  // This is the ONLY time you should do `await import` in a test file, to avoid hoisting issues
  // All other imports should be centralized at the top of the file
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores // Use complete mock object for full coverage, interact with individual components in tests if needed
})

describe('ComponentName Integration', () => {
  const createWrapper = (props = {}) => {
    // Use the `template` to wrap needed dependencies for a component, such as v-expansion-panels or v-list
    return mount(ComponentName, {
      props: { ...defaultProps, ...props },
      template: '<v-expansion-panels><ComponentName /></v-expansion-panels>',
    })
  }

  it('renders with default props', () => {
    const wrapper = createWrapper()
    element(wrapper, '[data-testid="main-element"]').assert()
    component(wrapper, ComponentName)
      .match((c) => c.text().includes('Expected Text'))
      .assert()
  })

  it('handles user interactions', async () => {
    const wrapper = createWrapper()
    await component(wrapper, VBtn).click()

    // Test behavior, not implementation
    component(wrapper, Modal).assert()
  })
})
```

### Key Principles

#### ✅ DO Test:

- Component renders without errors
- User interactions trigger expected behavior
- Composable function calls with correct parameters
- Conditional rendering based on data/state
- Data display accuracy
- Component integration (props, events)

#### ❌ DON'T Test:

- Vuetify component internals
- Implementation details (method names, internal variables)
- CSS classes or styling
- Layout structure details
- Composable internal logic (test separately)

### Testing Patterns

#### Finding Elements

```typescript
import { element, component } from '@/__tests__/vue-test-helpers'
import { VBtn } from 'vuetify/components'

// ✅ Good - fluent API with flexible matchers
const importBtn = component(wrapper, VBtn)
  .match((btn) => btn.text().includes('Import'))
  .getComponent()
const disabledBtn = component(wrapper, VBtn)
  .match((btn) => btn.props().disabled === true)
  .getComponent()

// ✅ Good - direct assertions without intermediate variables
component(wrapper, VBtn)
  .match((btn) => btn.text() === 'Submit')
  .assert()
element(wrapper, '.error-message').assert({ count: 3 })

// ✅ Good - get all matching components
const allButtons = component(wrapper, VBtn).getComponents()
const primaryButtons = component(wrapper, VBtn)
  .match((btn) => btn.props().color === 'primary')
  .getComponents()

// ❌ Avoid - manual finds without helpers, string component names
const buttons = wrapper.findAllComponents({ name: 'VBtn' })
const importBtn = buttons.find((btn) => btn.text().includes('Import'))

// ❌ Avoid - testing implementation/styling details.
//    Even purpose-based classes such as subtitle or caption are brittle since changing them does not affect component operation
const btn = wrapper.find('v-btn[color="secondary"]')
```

#### Using Test Fixtures

```typescript
import { itemDatabase, recipeDatabase } from '@/__tests__/fixtures/data'
import { createMockDataStore } from '@/__tests__/fixtures/stores/dataStore'

const IRON_ORE = 'Desc_OreIron_C'
const ironOreItem = itemDatabase[IRON_ORE] // Real fixture data

// Define test constants
const TEST_ITEMS = {
  IRON_ORE: 'Desc_OreIron_C',
  COPPER_ORE: 'Desc_OreCopper_C',
} as const
```

#### Composable Mocking

See `src/__tests__/fixtures/composables/README.md` for detailed patterns.

```typescript
import { mockNavigateToFloor } from '@/__tests__/fixtures/composables/navigation'

// Basic setup with sensible defaults
vi.mock('@/composables/useFloorNavigation', async () => {
  // You may ONLY use `await import` inside vi.mock calls
  const { mockUseFloorNavigation } = await import('@/__tests__/fixtures/composables')
  return { useFloorNavigation: mockUseFloorNavigation }
})

// override/spy on individual composable functions as needed
it('navigates to floors', () => {
  const wrapper = createWrapper()
  mockNavigateToFloor.mockImplementation(() => {})
  emitEvent(wrapper, NavPanel, 'floor-selected', 1)

  expect(mockNavigateToFloor).toHaveBeenCalledWith(1)
})
```

#### Mocking Refs in Composables

When mocking composables that return refs, use `createUnwrapProxy()` to ensure the mock behaves correctly with both `.value` access (for watchers) and direct property access (for templates):

```typescript
import { ref, computed } from 'vue'
import { createUnwrapProxy } from '@/__tests__/vue-test-helpers'

const mockItems = ref<Item[]>([])
const mockItemKeys = computed(() => mockItems.value.map((item) => item.key))

vi.mock('./composables/useItemForm', () => ({
  useItemForm: vi.fn(() => ({
    items: createUnwrapProxy(mockItems), // Supports both .value and array methods
    itemKeys: createUnwrapProxy(mockItemKeys), // Works with computed refs too
  })),
}))
```

## Running Tests

- `npm test` - Watch mode for development
- `npm run test:run` - Single run (CI mode)
- `npm run test:ui` - Visual test interface
- `npm run test:coverage` - Coverage reports
- `npm run ci` - Full CI pipeline
- `npm run type-check:test` - TypeScript checking for tests

## File Organization

- Tests in `__tests__` folders alongside components
- Name: `ComponentName.integration.test.ts`
- Describe blocks: `describe('ComponentName Integration', ...)`

## Quick Reference

### Project Structure

```
src/
├── __tests__/
│   ├── fixtures/        # Test data and mocks
│   │   ├── data/       # Game data (items, recipes, buildings)
│   │   ├── composables/# Composable mocks
│   │   └── stores/     # Store mocks
│   └── vue-test-helpers.ts # Testing utilities
├── components/
│   └── __tests__/      # Component tests
└── types/stores.ts     # Store interfaces
```

### Available Mocks

- `mockGetStores` - Store access
- `mockUseFloorManagement` - Floor operations
- `mockUseRecipeStatus` - Recipe status
- `mockUseFloorNavigation` - Navigation
- `mockUseLinkData` - Material links

### Frequent Imports

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { component, element } from '@/__tests__/vue-test-helpers'
import { VBtn } from 'vuetify/components' // or other relevant components, not all components have buttons

import Component from '@/components/Component.vue'
```
