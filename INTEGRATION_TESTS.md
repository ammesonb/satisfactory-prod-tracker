# Vue/Vuetify Integration Testing Guide

## Overview

This project uses Vitest with Vue Test Utils for component integration testing. The setup emphasizes **integration over isolation** - components should be tested with their real dependencies rather than heavily mocked.

## Test Writing Process

When writing tests, follow these steps.
**DO NOT SKIP THE REVIEW STEP AT THE END.**

1. **Examine the component** - Understand its props, composable usage, and user interactions
2. **Write tests with DRY principles** - Create reusable helper functions for repeated logic
3. **Run tests and iterate** - `npm run test` until all pass
4. **Run full CI** - `npm run ci` to ensure formatting, linting, and type compliance
5. **Run type checking on the test files** - `npm run type-check:test` to ensure type safety
6. **Review all changes - MANDATORY**: Use git status and git diff to examine ALL uncommitted files. Explicitly state what you reviewed and confirm each file follows best practices. Do not proceed without completing this step.

The following sections provide technical details and guidance on writing integration tests for these components.

## Test Configuration

### Vitest Setup (`vitest.config.ts`)

- **Environment**: `happy-dom` for DOM simulation
- **Globals**: Enabled for direct `describe`/`it` usage
- **Component Auto-Import**: Via `unplugin-vue-components` with Vuetify3Resolver
- **Setup Files**: Two-tier setup for different test types from `vitest.config.ts`
  - `./src/logistics/__tests__/test-setup.ts` - Store mocking for logic tests
  - `./src/components/__tests__/component-setup.ts` - Full component setup

### Component Test Setup (`src/components/__tests__/component-setup.ts`)

**Key Features:**

- **Vuetify Integration**: Full Vuetify instance with all components available
- **Global Provides**: Mock stores injected via provide/inject pattern
- **Pinia Reset**: Fresh Pinia instance before each test
- **Auto-Imports**: Components auto-imported, no manual imports needed

**Available Mock Stores:**

```typescript
// Provided via injection keys from @/composables/useStores
const mockDataStore = createMockDataStore() // Full fixture data from @/__tests__/fixtures/stores/dataStore.ts
const mockFactoryStore = {} // Empty object - extend as needed per IFactoryStore interface
const mockThemeStore = {} // Empty object - extend as needed per IThemeStore interface
const mockErrorStore = {} // Empty object - extend as needed per IErrorStore interface
```

**Store Interface References:**

All store interfaces are defined in `@/types/stores.ts`:

- `IDataStore` - Game data management with items, recipes, buildings
- `IFactoryStore` - Factory and floor management
- `IThemeStore` - Theme switching functionality
- `IErrorStore` - Error handling and modal display

**Test Fixture Infrastructure:**

The project provides comprehensive test fixtures in `src/__tests__/fixtures/`:

```
src/__tests__/fixtures/
├── data/
│   ├── index.ts          # Barrel exports for all game data
│   ├── items.ts          # itemDatabase with 100+ Satisfactory items
│   ├── recipes.ts        # recipeDatabase with production recipes
│   └── buildings.ts      # buildingDatabase with production buildings
├── stores/
│   └── dataStore.ts      # createMockDataStore() with realistic data
└── types/
    ├── composables.ts    # Mock types for composables (useSelection, useDataSearch)
    └── dataStore.ts      # Type definitions for fixture data
```

### Logistics Test Setup (`src/logistics/__tests__/test-setup.ts`)

**Purpose**: Mocks stores at import time for pure logic testing

- Mocks `@/stores/data` and `@/stores/errors`
- Uses `createMockDataStore()` fixture with full game data

## Integration Testing Patterns

### Essential Patterns

**Mount Helper Function:**

```typescript
const createWrapper = (props = {}) => mount(ComponentName, { props: { ...defaultProps, ...props } })
```

**DRY Helper Functions:**

```typescript
const expectElementState = (wrapper, selector, prop, value) => {
  wrapper.findAllComponents({ name: selector }).forEach((el) => expect(el.props(prop)).toBe(value))
}

const testAction = async (actionName, expectedParams) => {
  // Setup, call action, verify composable calls with expectedParams
}
```

**Use Constants Over Magic Strings:**

```typescript
const TEST_FACTORY = {
  name: 'Test Factory',
  id: 'test-factory',
}

// Good - use constants
setFactory(TEST_FACTORY.id)

// Avoid - magic strings repeated throughout tests
setFactory('test-factory')
```

### Store Mocking Strategy

**Mock at Module Level:**

```typescript
vi.mock('@/composables/useStores', () => ({
  getStores: vi.fn(() => ({
    factoryStore: { currentFactory: null },
    // Add other stores as needed
  })),
}))
```

**Update in Tests:**

```typescript
let mockFactoryStore: Partial<IFactoryStore>

beforeEach(async () => {
  mockFactoryStore = { currentFactory: null }
  const { getStores } = vi.mocked(await import('@/composables/useStores'))
  getStores.mockReturnValue({
    factoryStore: mockFactoryStore as IFactoryStore,
    // Other required stores...
  })
})

const setFactoryWithFloors = () => {
  mockFactoryStore.currentFactory = TEST_FACTORY
}
```

### Composable Mocking Strategy

**Mock and Test Composable Calls:**

```typescript
vi.mock('@/composables/useFloorManagement', () => ({
  useFloorManagement: vi.fn(() => ({
    openFloorEditor: vi.fn(),
  })),
}))

it('calls composable when button clicked', async () => {
  const { useFloorManagement } = await import('@/composables/useFloorManagement')

  const wrapper = createWrapper()
  await wrapper.find('[data-testid="edit-btn"]').trigger('click')

  const mockFn = vi.mocked(useFloorManagement).mock.results[0]?.value?.openFloorEditor
  expect(mockFn).toHaveBeenCalledWith()
})
```

### What to Test

**✅ DO Test:**

- Component renders without errors
- User interactions trigger expected behavior
- Composable function calls with correct parameters
- Element states based on props/store state
- Conditional rendering
- Events emitted with correct payloads

**❌ DON'T Test:**

- Vuetify component internals
- Implementation details (method names, variables)
- Styling or CSS classes
- Composable internal logic (test separately)

### Testing Component Functionality

**Example Integration Test Structure:**

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import ComponentName from '@/components/path/ComponentName.vue'

// Mock composable if component uses one
vi.mock('@/composables/useComposableName', () => ({
  useComposableName: vi.fn(() => ({
    actionFunction: vi.fn(),
    data: ref('mock-data'),
  })),
}))

describe('ComponentName Integration', () => {
  const createWrapper = (props = {}) => {
    return mount(ComponentName, {
      props: {
        // reasonable defaults
        ...props,
      },
    })
  }

  it('renders with default props', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('[data-testid="main-element"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Expected Text')
  })

  it('calls composable action on user interaction', async () => {
    const { useComposableName } = await import('@/composables/useComposableName')
    const mockAction = vi.mocked(useComposableName).mock.results[0].value.actionFunction

    const wrapper = createWrapper()

    await wrapper.find('button').trigger('click')

    expect(mockAction).toHaveBeenCalledWith('expected-params')
  })

  it('emits events correctly', async () => {
    const wrapper = createWrapper()

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('action')).toBeTruthy()
    expect(wrapper.emitted('action')[0]).toEqual(['expected-payload'])
  })

  it('updates display when props change', async () => {
    const wrapper = createWrapper({ title: 'Initial' })

    await wrapper.setProps({ title: 'Updated' })

    expect(wrapper.text()).toContain('Updated')
  })
})
```

## Key Integration Testing Principles

### No Component Stubbing

- All components should render their real implementations
- This tests the actual component integration
- Use the auto-import system - components are available globally

### Strategic Mocking

- **Mock composables** that components call - test the calls, not the logic
- **Mock external services** and stores with the provided setup
- **Don't mock** child components - let them render fully
- Use the provided mock store setup and extend as needed

### Test Data Strategy

- Use `createMockDataStore()` for realistic game data
- Create focused mock data for specific test scenarios
- Prefer fixture data over inline test data

**Using Test Fixtures Effectively:**

```typescript
import { itemDatabase, recipeDatabase, buildingDatabase } from '@/__tests__/fixtures/data'
import { createMockDataStore } from '@/__tests__/fixtures/stores/dataStore'
import type { MockUseDataSearch, MockUseSelection } from '@/__tests__/fixtures/types/composables'
import {
  createMockUseDataSearch,
  createMockUseSelection,
} from '@/__tests__/fixtures/types/composables'

// Use fixture constants instead of magic strings
const IRON_ORE_KEY = 'Desc_OreIron_C'
const IRON_INGOT_RECIPE = 'Recipe_IngotIron_C'
const CONSTRUCTOR_BUILDING = 'Build_ConstructorMk1_C'

// Access real fixture data
const ironOreItem = itemDatabase[IRON_ORE_KEY]
const ironIngotRecipe = recipeDatabase[IRON_INGOT_RECIPE]
const constructorBuilding = buildingDatabase[CONSTRUCTOR_BUILDING]

// Mock composables with fixture types
vi.mock('@/composables/useDataSearch', () => ({
  useDataSearch: vi.fn(() => createMockUseDataSearch([ironOreItem, ironIngotItem])),
}))
```

**Test Constant Patterns:**

Define test constants to avoid magic strings and improve maintainability:

```typescript
describe('ComponentName Integration', () => {
  // Test constants from fixtures
  const TEST_ITEMS = {
    IRON_ORE: 'Desc_OreIron_C',
    COPPER_ORE: 'Desc_OreCopper_C',
    IRON_INGOT: 'Desc_IronIngot_C',
  } as const

  const TEST_RECIPES = {
    IRON_INGOT: 'Recipe_IngotIron_C',
    COPPER_INGOT: 'Recipe_IngotCopper_C',
  } as const

  const TEST_BUILDINGS = {
    SMELTER: 'Build_SmelterMk1_C',
    CONSTRUCTOR: 'Build_ConstructorMk1_C',
  } as const

  const createWrapper = (props = {}) => {
    return mount(ComponentName, {
      props: {
        item: TEST_ITEMS.IRON_ORE,
        recipe: TEST_RECIPES.IRON_INGOT,
        ...props,
      },
    })
  }

  it('displays item from fixture data', () => {
    const wrapper = createWrapper()
    const ironOreItem = itemDatabase[TEST_ITEMS.IRON_ORE]

    expect(wrapper.text()).toContain(ironOreItem.name) // "Iron Ore"
  })
}
```

### Async Testing

- Always `await` user interactions: `await wrapper.find('button').trigger('click')`
- Use `await wrapper.vm.$nextTick()` when needed for reactivity
- Test async operations with proper awaiting

## Common Patterns

### Testing Vuetify Components

```typescript
// Vuetify components are available globally
it('works with vuetify select', async () => {
  const wrapper = createWrapper()

  const select = wrapper.findComponent({ name: 'VSelect' })
  expect(select.exists()).toBe(true)

  // Test select functionality
  await select.vm.$emit('update:modelValue', 'new-value')
  expect(wrapper.emitted('change')).toBeTruthy()
})
```

### Testing Store Integration

```typescript
it('integrates with factory store', () => {
  // Mock store is automatically provided
  const wrapper = createWrapper()

  // Test that component uses store data correctly
  expect(wrapper.text()).toContain('Ground Floor') // from mock data
})
```

### Testing Error Handling

```typescript
it('handles errors gracefully', async () => {
  // Simulate error condition
  const wrapper = createWrapper({ data: null })

  expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true)
})
```

### Testing Composable Integration

```typescript
import { vi } from 'vitest'

vi.mock('@/composables/useRecipeStatus', () => ({
  useRecipeStatus: vi.fn(() => ({
    updateStatus: vi.fn(),
    status: ref('active'),
  })),
}))

it('calls composable when status changes', async () => {
  const { useRecipeStatus } = await import('@/composables/useRecipeStatus')
  const mockUpdateStatus = vi.mocked(useRecipeStatus).mock.results[0].value.updateStatus

  const wrapper = createWrapper({ recipeId: '123' })

  await wrapper.find('[data-testid="status-toggle"]').trigger('click')

  expect(mockUpdateStatus).toHaveBeenCalledWith('123', 'inactive')
})
```

## File Organization

- Integration tests should be in `__tests__` folders alongside components
- Name test files `ComponentName.integration.test.ts`
- Use descriptive describe blocks: `describe('ComponentName Integration', ...)`
- Group related tests with nested describe blocks when needed

## Running Tests

- `npm run ci` - Run full CI-style formatting and linting checks plus tests
- `npm run type-check:test` - TypeScript type checking for tests
- `npm test` - Watch mode for development
- `npm run test:ui` - Visual test interface
- `npm run test:run` - Single run (CI mode)
- `npm run test:coverage` - Coverage reports

## Quick Reference

### Key Infrastructure Files

**Configuration:**

- `vitest.config.ts` - Main test configuration with component auto-import
- `src/components/__tests__/component-setup.ts` - Component test setup with mock stores

**Type Definitions:**

- `src/types/stores.ts` - Store interface definitions (IDataStore, IFactoryStore, etc.)
- `src/__tests__/fixtures/types/` - Mock type definitions for composables

**Test Data:**

- `src/__tests__/fixtures/data/` - Real Satisfactory game data (items, recipes, buildings)
- `src/__tests__/fixtures/stores/dataStore.ts` - `createMockDataStore()` factory function

**Store Integration:**

- `src/composables/useStores.ts` - Injection keys and store getters

### Essential Imports

This is a fairly decent example of things you MAY need in a test.
Do not assume you will need all of these, as you can see many of the store keys are not actually used in the "Common Test Pattern" example that follows.

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { config } from '@vue/test-utils'
import { itemDatabase, recipeDatabase, buildingDatabase } from '@/__tests__/fixtures/data'
import { createMockDataStore } from '@/__tests__/fixtures/stores/dataStore'
import {
  DATA_STORE_KEY,
  FACTORY_STORE_KEY,
  THEME_STORE_KEY,
  ERROR_STORE_KEY,
} from '@/composables/useStores'
import type { IDataStore, IFactoryStore, IThemeStore, IErrorStore } from '@/types/stores'
```

### Common Test Patterns

```typescript
// Component setup
const createWrapper = (props = {}) => mount(ComponentName, { props: { ...defaultProps, ...props } })

// Using fixture data
const IRON_ORE = 'Desc_OreIron_C'
const ironOreData = itemDatabase[IRON_ORE] // Real game data

// Async testing
await wrapper.find('[data-testid="button"]').trigger('click')
```
