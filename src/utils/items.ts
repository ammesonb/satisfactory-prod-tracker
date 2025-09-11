import type { IDataStore } from '@/types/stores'
import type { Item, ItemOption } from '@/types/data'
import { memoize } from '@/utils/cache'

export const getItemDetails = (
  dataStore: IDataStore,
  itemName: string,
): { item: Item; displayName: string; icon: string } => {
  const item = dataStore.items[itemName]
  if (!item) {
    throw new Error(`Item not found: ${itemName}`)
  }

  return {
    item,
    displayName: dataStore.getItemDisplayName(itemName),
    icon: dataStore.getIcon(itemName),
  }
}

const itemsToOptionsInternal = (
  items: Record<string, { name: string; icon?: string }>,
): ItemOption[] => {
  return Object.entries(items)
    .filter(([, item]) => item.icon)
    .map(([key, item]) => ({
      value: key,
      name: item.name,
      icon: item.icon!,
      type: 'item' as const,
    }))
}

export const itemsToOptions = memoize(itemsToOptionsInternal, (items) => JSON.stringify(items))
