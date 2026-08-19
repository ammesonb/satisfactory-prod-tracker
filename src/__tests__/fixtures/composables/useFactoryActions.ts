import { vi } from 'vitest'

// Mock functions for useFactoryActions composable
export const mockAddFactory = vi.fn()
export const mockRenameFactory = vi.fn()
export const mockDeleteFactory = vi.fn()

export const mockUseFactoryActions = vi.fn(() => ({
  addFactory: mockAddFactory,
  renameFactory: mockRenameFactory,
  deleteFactory: mockDeleteFactory,
}))
