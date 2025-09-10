import type { IDataStore } from '@/types/stores'
import { EXTERNAL_RECIPE, BELT_ITEM_NAMES } from '@/logistics/constants'
import { memoize } from '@/utils/cache'

const resolveIconInternal = (dataStore: IDataStore, objectName: string): string => {
  if (objectName === EXTERNAL_RECIPE) {
    return resolveIcon(dataStore, BELT_ITEM_NAMES[0])
  } else if (objectName in dataStore.buildings) {
    return dataStore.buildings[objectName].icon
  } else if (objectName in dataStore.items) {
    return dataStore.items[objectName].icon
  } else if (objectName in dataStore.recipes) {
    const products = dataStore.recipeProducts(objectName)
    if (products.length === 0) {
      throw new Error(
        `Recipe ${objectName} has no products, please open a bug ticket so an icon can be hard-coded for it.`,
      )
    }
    return resolveIcon(dataStore, products[0].item)
  } else {
    throw new Error(`Could not resolve icon: ${objectName}`)
  }
}

// Memoized version - cache by objectName only since dataStore is stable
export const resolveIcon = memoize(resolveIconInternal, (_dataStore, objectName) => objectName)
