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
7. **Review all changes**:
   - Use `git status` and `git diff` to examine ALL uncommitted files
   - Explicitly confirm each file follows best practices

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

Use centralized helpers from `@/__tests__/vue-test-helpers` for cleaner tests:

```typescript
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

// Simplified interactions
await clickElement(wrapper, byComponent('VBtn'))
// You can use Component types instead of the more-brittle byComponent(string)
await emitEvent(wrapper, NavPanel, 'close')

// Component property access
const fab = getComponent(wrapper, byComponent('VFab'))
expect(fab.props('icon')).toBe('mdi-map')
```

## Writing Integration Tests

### Example Test Structure

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import ComponentName from '@/components/path/ComponentName.vue'
import { expectElementExists, clickElement, byComponent } from '@/__tests__/vue-test-helpers'

// Mock composables with centralized fixtures
vi.mock('@/composables/useStores', async () => {
  // This is the ONLY time you should do `await import` in a test file, to avoid hoisting issues
  // All other imports should be centralized at the top of the file
  const { mockGetStores } = await import('@/__tests__/fixtures/composables')
  return { getStores: mockGetStores }
})

const getComponent = (wrapper: VueWrapper) => {
  return wrapper.findComponent(ComponentUnderTest)
}

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
    expectElementExists(wrapper, '[data-testid="main-element"]')
    expect(wrapper.text()).toContain('Expected Text')
  })

  it('handles user interactions', async () => {
    const wrapper = createWrapper()
    await clickElement(wrapper, byComponent('VBtn'))

    // Test behavior, not implementation
    expectElementExists(wrapper, Modal)
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
// ✅ Good - by functionality
const buttons = wrapper.findAllComponents({ name: 'VBtn' })
const importBtn = buttons.find((btn) => btn.text().includes('Import'))

// ❌ Avoid - implementation + styling details
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
import { expectElementExists, clickElement, byComponent } from '@/__tests__/vue-test-helpers'
```
