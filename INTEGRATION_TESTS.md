# Vue/Vuetify Integration Testing Guide

## Overview

This project uses Vitest with Vue Test Utils for component integration testing. The setup emphasizes **integration over isolation** - components should be tested with their real dependencies rather than heavily mocked.

## Test Configuration

### Vitest Setup (`vitest.config.ts`)
- **Environment**: `happy-dom` for DOM simulation
- **Globals**: Enabled for direct `describe`/`it` usage
- **Component Auto-Import**: Via `unplugin-vue-components` with Vuetify3Resolver
- **Setup Files**: Two-tier setup for different test types
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
const mockDataStore = createMockDataStore()     // Full fixture data
const mockFactoryStore = {}                     // Empty object - extend as needed
const mockThemeStore = {}                       // Empty object - extend as needed  
const mockErrorStore = {}                       // Empty object - extend as needed
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
Create these as needed in test files:
```typescript
// Reusable mock factory store
const createMockFactoryStore = () => ({
  floors: [
    { id: '1', name: 'Ground Floor', recipes: [] },
    { id: '2', name: 'Second Floor', recipes: [] }
  ],
  currentFloorId: '1',
  addFloor: vi.fn(),
  removeFloor: vi.fn(),
  setCurrentFloor: vi.fn(),
})

// Reusable mock error store  
const createMockErrorStore = () => ({
  errors: [],
  addError: vi.fn(),
  clearErrors: vi.fn(),
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
  }))
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
- ❌ Styling details (use visual testing tools instead)
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
  }))
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
  }))
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

- `npm test` - Watch mode for development
- `npm run test:ui` - Visual test interface
- `npm run test:run` - Single run (CI mode)
- `npm run test:coverage` - Coverage reports