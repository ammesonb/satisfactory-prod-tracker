import type { Building } from '@/types/data'

export const formatDisplayName = (buildings: Record<string, Building>, buildingName: string) => {
  const building = buildings[buildingName]
  if (!building) {
    throw new Error(`Building not found: ${buildingName}`)
  }

  return building.name
}
