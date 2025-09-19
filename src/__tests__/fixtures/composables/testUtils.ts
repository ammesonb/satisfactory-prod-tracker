import type {
  UseFloorManagement,
  UseRecipeStatus,
  UseFloorNavigation,
  UseSelection,
} from '@/types/composables'
import type { IDataStore, IFactoryStore, IThemeStore, IErrorStore } from '@/types/stores'

/**
 * Utility to get the latest mock result from any centralized fixture composable
 * @param composableName - The name of the composable mock to access
 * @returns The latest mock result from that composable
 */
export const getMockResult = async <T = unknown>(composableName: string): Promise<T> => {
  const fixtures = await import('@/__tests__/fixtures/composables')
  const mockFn = fixtures[composableName as keyof typeof fixtures] as {
    mock: { results: Array<{ value: T }> }
  }

  if (!mockFn || typeof mockFn.mock === 'undefined') {
    throw new Error(`Mock composable '${composableName}' not found or not properly mocked`)
  }

  const mockResult = mockFn.mock.results[0]?.value

  if (!mockResult) {
    throw new Error(`Mock composable '${composableName}' has not been called yet`)
  }

  return mockResult
}

/**
 * Utility to get specific properties from mock store results
 * Specifically for mockGetStores pattern
 */
export const getMockStores = async () => {
  return getMockResult<{
    dataStore: IDataStore
    factoryStore: Partial<IFactoryStore>
    themeStore: IThemeStore
    errorStore: IErrorStore
  }>('mockGetStores')
}

/**
 * Utility to get floor management mock results
 */
export const getMockFloorManagement = async (): Promise<UseFloorManagement> => {
  return getMockResult('mockUseFloorManagement')
}

/**
 * Utility to get recipe status mock results
 */
export const getMockRecipeStatus = async (): Promise<UseRecipeStatus> => {
  return getMockResult('mockUseRecipeStatus')
}

/**
 * Utility to get floor navigation mock results
 */
export const getMockFloorNavigation = async (): Promise<UseFloorNavigation> => {
  return getMockResult('mockUseFloorNavigation')
}

export const getMockSelection = async (): Promise<UseSelection> => {
  return getMockResult('mockUseSelection')
}
