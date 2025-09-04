import { inject, type InjectionKey } from 'vue'
import { useDataStore, useFactoryStore, useThemeStore, useErrorStore } from '@/stores'

// Define injection keys with proper typing
export const DATA_STORE_KEY: InjectionKey<ReturnType<typeof useDataStore>> = Symbol('dataStore')
export const FACTORY_STORE_KEY: InjectionKey<ReturnType<typeof useFactoryStore>> =
  Symbol('factoryStore')
export const THEME_STORE_KEY: InjectionKey<ReturnType<typeof useThemeStore>> = Symbol('themeStore')
export const ERROR_STORE_KEY: InjectionKey<ReturnType<typeof useErrorStore>> = Symbol('errorStore')

/**
 * Get injected stores with fallbacks to direct store usage
 * Simple, explicit, and easy to test
 */
export function getDataStore() {
  return inject(DATA_STORE_KEY) || useDataStore()
}

export function getFactoryStore() {
  return inject(FACTORY_STORE_KEY) || useFactoryStore()
}

export function getThemeStore() {
  return inject(THEME_STORE_KEY) || useThemeStore()
}

export function getErrorStore() {
  return inject(ERROR_STORE_KEY) || useErrorStore()
}

/**
 * Convenience function for components that need multiple stores
 * Returns all stores - let the component destructure what it needs
 */
export function getStores() {
  return {
    dataStore: getDataStore(),
    factoryStore: getFactoryStore(),
    themeStore: getThemeStore(),
    errorStore: getErrorStore(),
  }
}
