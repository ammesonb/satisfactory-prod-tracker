import { inject, type InjectionKey } from 'vue'

import {
  useCloudSyncStore,
  useDataStore,
  useErrorStore,
  useFactoryStore,
  useThemeStore,
} from '@/stores'
import type {
  ICloudSyncStore,
  IDataStore,
  IErrorStore,
  IFactoryStore,
  IThemeStore,
} from '@/types/stores'

// Define injection keys with proper interface typing for better testability
export const DATA_STORE_KEY: InjectionKey<IDataStore> = Symbol('dataStore')
export const FACTORY_STORE_KEY: InjectionKey<IFactoryStore> = Symbol('factoryStore')
export const THEME_STORE_KEY: InjectionKey<IThemeStore> = Symbol('themeStore')
export const ERROR_STORE_KEY: InjectionKey<IErrorStore> = Symbol('errorStore')
export const CLOUD_SYNC_STORE_KEY: InjectionKey<ICloudSyncStore> = Symbol('cloudSyncStore')

/**
 * Get injected stores with fallbacks to direct store usage
 * Simple, explicit, and easy to test
 */
export function getCloudSyncStore(): ICloudSyncStore {
  return inject(CLOUD_SYNC_STORE_KEY) || useCloudSyncStore()
}

export function getDataStore(): IDataStore {
  return inject(DATA_STORE_KEY) || useDataStore()
}

export function getFactoryStore(): IFactoryStore {
  return inject(FACTORY_STORE_KEY) || useFactoryStore()
}

export function getThemeStore(): IThemeStore {
  return inject(THEME_STORE_KEY) || useThemeStore()
}

export function getErrorStore(): IErrorStore {
  return inject(ERROR_STORE_KEY) || useErrorStore()
}

/**
 * Convenience function for components that need multiple stores
 * Returns all stores - let the component destructure what it needs
 */
export function getStores(): {
  cloudSyncStore: ICloudSyncStore
  dataStore: IDataStore
  factoryStore: IFactoryStore
  themeStore: IThemeStore
  errorStore: IErrorStore
} {
  return {
    cloudSyncStore: getCloudSyncStore(),
    dataStore: getDataStore(),
    factoryStore: getFactoryStore(),
    themeStore: getThemeStore(),
    errorStore: getErrorStore(),
  }
}
