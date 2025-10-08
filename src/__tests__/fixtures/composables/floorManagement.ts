import { vi } from 'vitest'
import type { Floor } from '@/types/factory'

export const mockGetFloorDisplayName = vi.fn((index: number, floor: Floor) => {
  return floor.name ? `Floor ${index} - ${floor.name}` : `Floor ${index}`
})

export const mockFloorMatches = vi.fn()

export const mockUseFloorManagement = vi.fn(() => ({
  getFloorDisplayName: mockGetFloorDisplayName,
  floorMatches: mockFloorMatches,
}))
