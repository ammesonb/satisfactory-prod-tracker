import type { ItemOption } from '@/types/data'
import { memoize } from '@/utils/cache'

const buildingsToOptionsInternal = (
  buildings: Record<string, { name: string; icon?: string }>,
): ItemOption[] => {
  return Object.entries(buildings)
    .filter(([, building]) => building.icon)
    .map(([key, building]) => ({
      value: key,
      name: building.name,
      icon: building.icon!,
      type: 'building' as const,
    }))
}

export const buildingsToOptions = memoize(buildingsToOptionsInternal, (buildings) =>
  JSON.stringify(buildings),
)
