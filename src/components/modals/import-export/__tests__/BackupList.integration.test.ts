import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { component, element } from '@/__tests__/vue-test-helpers'
import type { GoogleDriveFile } from '@/types/cloudSync'

import BackupList from '@/components/modals/import-export/BackupList.vue'
import FactoryBackupEntry from '@/components/modals/import-export/FactoryBackupEntry.vue'
import { VBtn, VList } from 'vuetify/components'

vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

describe('BackupList Integration', () => {
  const mockBackups: GoogleDriveFile[] = [
    {
      id: 'backup-1',
      name: 'Factory Backup 1',
      mimeType: 'application/json',
      modifiedTime: '2024-01-15T10:30:00.000Z',
      createdTime: '2024-01-15T10:00:00.000Z',
    },
    {
      id: 'backup-2',
      name: 'Factory Backup 2',
      mimeType: 'application/json',
      modifiedTime: '2024-01-16T14:45:00.000Z',
      createdTime: '2024-01-16T14:00:00.000Z',
    },
  ]

  const createWrapper = (props = {}) => {
    return mount(BackupList, {
      props: {
        backups: [],
        loading: false,
        ...props,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('displays empty state when no backups exist', () => {
      const wrapper = createWrapper({ backups: [] })

      element(wrapper, '.no-backups').assert()
      component(wrapper, VList).assert({ exists: false })
    })

    it('displays correct number of backup items', () => {
      const wrapper = createWrapper({ backups: mockBackups })

      component(wrapper, FactoryBackupEntry).assert({ count: 2 })
    })
  })

  describe('Backup Display', () => {
    it('displays backup names correctly', () => {
      const wrapper = createWrapper({ backups: mockBackups })

      expect(wrapper.text()).toContain('Factory Backup 1')
      expect(wrapper.text()).toContain('Factory Backup 2')
    })
  })

  describe('Interactions', () => {
    it('emits refresh event when refresh button is clicked', async () => {
      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.find('.mdi-refresh').exists())
        .click()

      expect(wrapper.emitted('refresh')).toHaveLength(1)
      expect(wrapper.emitted('refresh')?.[0]).toEqual([])
    })

    it('shows loading state on refresh button', () => {
      const wrapper = createWrapper({ loading: true })

      component(wrapper, VBtn)
        .match((btn) => btn.find('.mdi-refresh').exists())
        .assert({ props: { loading: true } })
    })

    it('emits restore event with backup and importAlias when entry emits restore', async () => {
      const wrapper = createWrapper({ backups: mockBackups })

      const firstEntry = component(wrapper, FactoryBackupEntry).getComponents()[0]
      await firstEntry.vm.$emit('restore', 'New Name')

      expect(wrapper.emitted('restore')).toHaveLength(1)
      expect(wrapper.emitted('restore')?.[0]).toEqual([mockBackups[0], 'New Name'])
    })

    it('emits restore event without alias when no rename', async () => {
      const wrapper = createWrapper({ backups: mockBackups })

      const firstEntry = component(wrapper, FactoryBackupEntry).getComponents()[0]
      await firstEntry.vm.$emit('restore', undefined)

      expect(wrapper.emitted('restore')).toHaveLength(1)
      expect(wrapper.emitted('restore')?.[0]).toEqual([mockBackups[0], undefined])
    })

    it('emits delete event with backup data when entry emits delete', async () => {
      const wrapper = createWrapper({ backups: mockBackups })

      const firstEntry = component(wrapper, FactoryBackupEntry).getComponents()[0]
      await firstEntry.vm.$emit('delete')

      expect(wrapper.emitted('delete')).toHaveLength(1)
      expect(wrapper.emitted('delete')?.[0]).toEqual([mockBackups[0]])
    })

    it('passes correct backup to each entry', () => {
      const wrapper = createWrapper({ backups: mockBackups })

      const entries = component(wrapper, FactoryBackupEntry).getComponents()
      expect(entries[0].props('backup')).toEqual(mockBackups[0])
      expect(entries[1].props('backup')).toEqual(mockBackups[1])
    })
  })

  describe('Edge Cases', () => {
    it('handles single backup correctly', () => {
      const wrapper = createWrapper({ backups: [mockBackups[0]] })

      component(wrapper, FactoryBackupEntry).assert({ count: 1 })
    })

    it('handles many backups', () => {
      const manyBackups: GoogleDriveFile[] = Array.from({ length: 20 }, (_, i) => ({
        id: `backup-${i}`,
        name: `Backup ${i}`,
        mimeType: 'application/json',
        modifiedTime: '2024-01-15T10:30:00.000Z',
        createdTime: '2024-01-15T10:00:00.000Z',
      }))

      const wrapper = createWrapper({ backups: manyBackups })

      component(wrapper, FactoryBackupEntry).assert({ count: 20 })
    })
  })
})
