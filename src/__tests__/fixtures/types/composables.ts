import { vi } from 'vitest'
import { ref } from 'vue'

/**
 * Mock type for useSelection composable return value
 */
export type MockUseSelection = {
  allSelected: { value: boolean }
  someSelected: { value: boolean }
  toggleAll: ReturnType<typeof vi.fn>
  toggleItem: ReturnType<typeof vi.fn>
  isSelected: ReturnType<typeof vi.fn>
}

/**
 * Creates a default mock for useSelection composable
 */
export const createMockUseSelection = (): MockUseSelection => ({
  allSelected: ref(false),
  someSelected: ref(false),
  toggleAll: vi.fn(),
  toggleItem: vi.fn(),
  isSelected: vi.fn(() => false),
})
