import { vi } from 'vitest'
import { computed } from 'vue'

export const mockIsFluidMaterial = vi.fn(() => false)
export const mockCapacities = vi.fn(() => [60, 120, 270])
export const mockTransportItems = vi.fn(() => [
  { name: 'Conveyor Belt Mk.1', icon: 'conveyor-mk1' },
  { name: 'Conveyor Belt Mk.2', icon: 'conveyor-mk2' },
  { name: 'Conveyor Belt Mk.3', icon: 'conveyor-mk3' },
])
export const mockBuildingCounts = vi.fn(() => [1, 0, 0])

export const mockUseTransport = vi.fn(() => ({
  isFluidMaterial: computed(mockIsFluidMaterial),
  capacities: computed(mockCapacities),
  transportItems: computed(mockTransportItems),
  buildingCounts: computed(mockBuildingCounts),
}))
