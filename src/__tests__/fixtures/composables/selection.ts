import { vi } from 'vitest'
import { computed } from 'vue'

export const mockSelectedSet = vi.fn(() => new Set())
export const mockAllSelected = vi.fn(() => false)
export const mockSomeSelected = vi.fn(() => false)
export const mockToggleAll = vi.fn()
export const mockToggleItem = vi.fn()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const mockIsSelected = vi.fn((_name: string) => false)

export const mockUseSelection = vi.fn(() => ({
  selectedSet: computed(() => mockSelectedSet()),
  allSelected: computed(() => mockAllSelected()),
  someSelected: computed(() => mockSomeSelected()),
  toggleAll: mockToggleAll,
  toggleItem: mockToggleItem,
  isSelected: mockIsSelected,
}))
