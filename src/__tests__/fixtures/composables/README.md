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

vi.mock('@/composables/useFloorNavigation', async () => {
  const { mockFormatFloorId } = await import('@/__tests__/fixtures/composables')
  return { formatFloorId: mockFormatFloorId }
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

## Available Composable Mocks

- `mockGetStores` - Store access with mock data store
- `mockUseFloorManagement` - Floor operations and navigation helpers
- `mockUseRecipeStatus` - Recipe completion and link status
- `mockFormatRecipeId` / `mockFormatFloorId` - ID formatting utilities
- `mockUseLinkData` - Material link data and transport info

All mocks include sensible defaults based on actual test usage patterns.

## Advanced Usage

For tests requiring significant customization, you can still use the factory functions:

```ts
import { createMockUseStores } from '@/__tests__/fixtures/composables'

// In your test
const customMock = createMockUseStores({
  themeStore: { isDark: true },
})
```
