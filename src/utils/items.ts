import type { IDataStore } from '@/types/stores'
import type { Item } from '@/types/data'
import { EXTERNAL_RECIPE } from '@/logistics/constants'

export const formatDisplayName = (items: Record<string, Item>, itemName: string) => {
  if (itemName === EXTERNAL_RECIPE) {
    return itemName
  }

  const item = items[itemName]
  if (!item) {
    throw new Error(`Item not found: ${itemName}`)
  }

  return item.name
}

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
    displayName: formatDisplayName(dataStore.items, itemName),
    icon: dataStore.getIcon(itemName),
  }
}
