# Vue/Vuetify Integration Testing Guide

## Overview

This project uses Vitest with Vue Test Utils for component integration testing. The setup emphasizes **integration over isolation** - components should be tested with their real dependencies rather than heavily mocked.

## Test Writing Process

When writing tests, you MUST follow these steps:

1. Examine the component you are writing tests for
2. Read the testing infrastructure, setup, and mocks to see what already exists.
3. Write tests, adhering to best practices and general coding principles such as DRY, KISS, and so on.
4. Run the tests via `npm run test` first and iterate until they pass.
5. Run the CI command to ensure formatting and linting are correct.
6. Run type-check:test to verify typescript compliance and fix issues.
7. Double-check **ALL UNCOMMITTED CHANGES** for best practices, accuracy, and thoroughness!

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

### Mount Function Strategy

**DO**: Create mount helper once per describe block

```typescript
describe('ComponentName', () => {
  const createWrapper = (props = {}) => {
    return mount(ComponentName, {
      props: {
        // default props
        ...props,
      },
    })
  }

  it('should render correctly', () => {
    const wrapper = createWrapper()
    // test logic
  })

  it('should handle prop changes', () => {
    const wrapper = createWrapper({ customProp: 'value' })
    // test logic
  })
})
```

**DON'T**: Repeat mount setup in every test

### Store Mocking Strategy

**Extend Mock Stores When Needed:**

```typescript
describe('ComponentWithFactory', () => {
  beforeEach(() => {
    // Extend the empty mock with needed functionality
    Object.assign(config.global.provide[FACTORY_STORE_KEY], {
      floors: [{ id: '1', name: 'Floor 1' }],
      addFloor: vi.fn(),
      removeFloor: vi.fn(),
    })
  })

  const createWrapper = () => {
    return mount(ComponentWithFactory)
  }
})
```

**Reusable Mock Store Definitions:**
Create these as needed in test files, following the interfaces in `@/types/stores.ts`:

```typescript
// Reusable mock factory store (implements IFactoryStore)
// Only include pieces you need, unless creating a generic/reusable function for the store across multiple tests
const createMockFactoryStore = (): Partial<IFactoryStore> => ({
  selected: 'test-factory',
  factories: { 'test-factory': { name: 'Test Factory', icon: 'factory', floors: [] } },
  hasFactories: true,
  currentFactory: { name: 'Test Factory', icon: 'factory', floors: [] },
  factoryList: [{ name: 'Test Factory', icon: 'factory', floors: [] }],
  setSelectedFactory: vi.fn(),
  addFactory: vi.fn(),
  removeFactory: vi.fn(),
  setLinkBuiltState: vi.fn(),
  getRecipeByName: vi.fn(),
  exportFactories: vi.fn(),
  importFactories: vi.fn(),
})

// Reusable mock theme store (implements IThemeStore)
const createMockThemeStore = (): Partial<IThemeStore> => ({
  isDark: false,
  toggleTheme: vi.fn(),
  setTheme: vi.fn(),
})

// Reusable mock error store (implements IErrorStore)
const createMockErrorStore = (): Partial<IErrorStore> => ({
  show: false,
  level: 'info',
  summary: '',
  bodyContent: null,
  createBuilder: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  hide: vi.fn(),
})
```

### Composable Mocking Strategy

**DO Mock Composable Actions:**
Components that call composable functions should mock those composables and test the calls:

```typescript
import { vi } from 'vitest'

// Mock the composable
vi.mock('@/composables/useFloorManagement', () => ({
  useFloorManagement: vi.fn(() => ({
    addFloor: vi.fn(),
    removeFloor: vi.fn(),
    updateFloor: vi.fn(),
  })),
}))

describe('ComponentWithComposable', () => {
  let mockAddFloor: ReturnType<typeof vi.fn>

  beforeEach(() => {
    const { useFloorManagement } = await import('@/composables/useFloorManagement')
    mockAddFloor = vi.mocked(useFloorManagement).mock.results[0].value.addFloor
  })

  it('calls composable function when button clicked', async () => {
    const wrapper = createWrapper()

    await wrapper.find('[data-testid="add-floor-btn"]').trigger('click')

    expect(mockAddFloor).toHaveBeenCalledWith(expectedParams)
  })
})
```

### Component Testing Philosophy

Always run the full CI suite and type checks (format, lint, type-check:test, test) after making changes to ensure no regressions.
Prefer using test data structures or constants over string literals, e.g.:

```
const mockFactory = {
  name: 'Test Factory',
  id: 'test-factory',
}

// Use values from test fixtures or define constants where possible
setFactory(mockFactory.id)

// Avoid string literals, especially when repeated multiple times in the same file
setFactory('test-factory')
```

**DO Test:**

- ✅ Component renders without errors
- ✅ Props affect rendered output correctly
- ✅ User interactions trigger expected behavior
- ✅ Events are emitted with correct payloads
- ✅ Conditional rendering based on props/state
- ✅ Integration with Vuetify components works
- ✅ **Composable function calls with correct parameters**

**DON'T Test:**

- ❌ Internal component methods directly
- ❌ Implementation details (variable names, function calls)
- ❌ Third-party library internals (Vuetify component behavior)
- ❌ Styling details, class names, static props unless non-trivial configuration
- ❌ Styling or behavior of Vuetify components - we can trust that they work properly
- ❌ Composable internal logic (test composables separately)

**Optional/Secondary:**

- 🔍 Accessibility attributes (not required, but can be included if relevant)

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

// Store extension
beforeEach(() => {
  Object.assign(config.global.provide[THEME_STORE_KEY], { isDark: false, toggleTheme: vi.fn() })
})

// Using fixture data
const IRON_ORE = 'Desc_OreIron_C'
const ironOreData = itemDatabase[IRON_ORE] // Real game data

// Async testing
await wrapper.find('[data-testid="button"]').trigger('click')
```
