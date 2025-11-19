import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { component, element } from '@/__tests__/vue-test-helpers'
import type { GoogleDriveFile } from '@/types/cloudSync'

import BackupList from '@/components/modals/import-export/BackupList.vue'
import { VBtn, VList, VListItem } from 'vuetify/components'

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

  describe('Rendering', () => {
    it('displays empty state when no backups exist', () => {
      const wrapper = createWrapper({ backups: [] })

      element(wrapper, '.no-backups').assert()
      component(wrapper, VList).assert({ exists: false })
    })

    it('displays correct number of backup items', () => {
      const wrapper = createWrapper({ backups: mockBackups })

      component(wrapper, VListItem).assert({ count: 2 })
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

    it('emits restore event with backup data when restore button clicked', async () => {
      const wrapper = createWrapper({ backups: mockBackups })

      // Get the first list item's restore button
      const firstListItem = wrapper.findAllComponents(VListItem)[0]
      const restoreButton = firstListItem
        .findAllComponents(VBtn)
        .find((btn) => btn.text().includes('Restore'))
      await restoreButton!.trigger('click')

      expect(wrapper.emitted('restore')).toHaveLength(1)
      expect(wrapper.emitted('restore')?.[0]).toEqual([mockBackups[0]])
    })

    it('emits delete event with backup data when delete button clicked', async () => {
      const wrapper = createWrapper({ backups: mockBackups })

      // Get the first list item's delete button
      const firstListItem = wrapper.findAllComponents(VListItem)[0]
      const deleteButton = firstListItem
        .findAllComponents(VBtn)
        .find((btn) => btn.find('.mdi-delete').exists())
      await deleteButton!.trigger('click')

      expect(wrapper.emitted('delete')).toHaveLength(1)
      expect(wrapper.emitted('delete')?.[0]).toEqual([mockBackups[0]])
    })

    it('each backup has its own restore and delete buttons', () => {
      const wrapper = createWrapper({ backups: mockBackups })

      const restoreButtons = wrapper
        .findAllComponents(VBtn)
        .filter((btn) => btn.text().includes('Restore'))
      const deleteButtons = wrapper
        .findAllComponents(VBtn)
        .filter((btn) => btn.find('.mdi-delete').exists())

      expect(restoreButtons).toHaveLength(2)
      expect(deleteButtons).toHaveLength(2)
    })
  })

  describe('Edge Cases', () => {
    it('handles single backup correctly', () => {
      const wrapper = createWrapper({ backups: [mockBackups[0]] })

      component(wrapper, VListItem).assert({ count: 1 })
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

      component(wrapper, VListItem).assert({ count: 20 })
    })
  })
})
