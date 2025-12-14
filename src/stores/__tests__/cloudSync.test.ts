import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCloudSyncStore } from '@/stores/cloudSync'

describe('useCloudSyncStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('instance ID management', () => {
    it('starts with empty instance ID', () => {
      const store = useCloudSyncStore()

      expect(store.instanceId).toBe('')
    })

    it('generates instance ID when initialized', () => {
      const store = useCloudSyncStore()

      store.initializeInstanceId()

      expect(store.instanceId).toMatch(/^[0-9a-f-]{36}$/i)
    })

    it('does not overwrite existing instance ID', () => {
      const store = useCloudSyncStore()

      store.initializeInstanceId()
      const firstId = store.instanceId

      store.initializeInstanceId()

      expect(store.instanceId).toBe(firstId)
    })

    it('persists same ID within same store instance', () => {
      const store = useCloudSyncStore()

      store.initializeInstanceId()
      const id1 = store.instanceId
      const id2 = store.instanceId

      expect(id1).toBe(id2)
    })
  })

  it('initializes with auto-sync disabled', () => {
    const store = useCloudSyncStore()

    expect(store.autoSync.enabled).toBe(false)
    expect(store.autoSync.namespace).toBe('')
    expect(store.autoSync.selectedFactories).toEqual([])
  })

  it('enables auto-sync with namespace and factories', () => {
    const store = useCloudSyncStore()

    store.enableAutoSync('Save1', ['F1', 'F2'])

    expect(store.autoSync.enabled).toBe(true)
    expect(store.autoSync.namespace).toBe('Save1')
    expect(store.autoSync.selectedFactories).toEqual(['F1', 'F2'])
  })

  it('copies factory array to prevent external mutations', () => {
    const store = useCloudSyncStore()
    const factories = ['F1']

    store.enableAutoSync('Save1', factories)
    factories.push('F2')

    expect(store.autoSync.selectedFactories).toEqual(['F1'])
  })

  it('preserves selections when disabling auto-sync', () => {
    const store = useCloudSyncStore()
    store.enableAutoSync('Save1', ['F1'])

    store.disableAutoSync()

    expect(store.autoSync.enabled).toBe(false)
    expect(store.autoSync.namespace).toBe('Save1')
    expect(store.autoSync.selectedFactories).toEqual(['F1'])
  })

  it('adds factory to auto-sync', () => {
    const store = useCloudSyncStore()
    store.enableAutoSync('Save1', [])

    store.addFactoryToAutoSync('NewFactory')

    expect(store.autoSync.selectedFactories).toContain('NewFactory')
  })

  it('prevents duplicate factories', () => {
    const store = useCloudSyncStore()
    store.enableAutoSync('Save1', ['F1'])

    store.addFactoryToAutoSync('F1')

    expect(store.autoSync.selectedFactories).toEqual(['F1'])
  })

  it('removes factory from auto-sync', () => {
    const store = useCloudSyncStore()
    store.enableAutoSync('Save1', ['F1', 'F2'])

    store.removeFactoryFromAutoSync('F1')

    expect(store.autoSync.selectedFactories).toEqual(['F2'])
  })

  it('handles removing non-existent factory', () => {
    const store = useCloudSyncStore()
    store.enableAutoSync('Save1', ['F1'])

    store.removeFactoryFromAutoSync('NonExistent')

    expect(store.autoSync.selectedFactories).toEqual(['F1'])
  })

  it('checks if factory is auto-synced', () => {
    const store = useCloudSyncStore()
    store.enableAutoSync('Save1', ['F1'])

    expect(store.isFactoryAutoSynced('F1')).toBe(true)
    expect(store.isFactoryAutoSynced('F2')).toBe(false)
  })

  it('sets global error with timestamp', () => {
    const store = useCloudSyncStore()

    store.setGlobalError('Network error')

    expect(store.finalGlobalError?.message).toBe('Network error')
    expect(store.finalGlobalError?.timestamp).toBeTruthy()
  })

  it('clears global error', () => {
    const store = useCloudSyncStore()
    store.setGlobalError('Error')

    store.clearGlobalError()

    expect(store.finalGlobalError).toBeNull()
  })

  it('suspends and resumes auto-sync', () => {
    const store = useCloudSyncStore()

    store.suspendAutoSync()
    expect(store.autoSyncSuspended).toBe(true)

    store.resumeAutoSync()
    expect(store.autoSyncSuspended).toBe(false)
  })

  it('sets display ID', () => {
    const store = useCloudSyncStore()

    store.setDisplayId('My Laptop')

    expect(store.displayId).toBe('My Laptop')
  })
})
