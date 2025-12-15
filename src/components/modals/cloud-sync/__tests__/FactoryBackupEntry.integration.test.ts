import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockFactories } from '@/__tests__/fixtures/composables/factoryStore'
import { component } from '@/__tests__/vue-test-helpers'
import type { GoogleDriveFile } from '@/types/cloudSync'

import FactoryBackupEntry from '@/components/modals/cloud-sync/FactoryBackupEntry.vue'
import FactoryName from '@/components/factory/FactoryName.vue'
import { VBtn, VListItem } from 'vuetify/components'

vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

describe('FactoryBackupEntry Integration', () => {
  const mockBackup: GoogleDriveFile = {
    id: 'backup-1',
    name: 'Steel-Production.sptrak',
    mimeType: 'application/json',
    modifiedTime: '2024-01-15T10:30:00.000Z',
    createdTime: '2024-01-15T10:00:00.000Z',
  }

  const createWrapper = (props = {}) => {
    return mount(FactoryBackupEntry, {
      props: {
        backup: mockBackup,
        ...props,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFactories.value = {}
  })

  describe('Rendering', () => {
    it('displays factory name from .sptrak filename', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Steel-Production')
    })

    it('displays formatted timestamp', () => {
      const wrapper = createWrapper()

      expect(wrapper.text()).toContain('Last modified:')
    })

    it('renders FactoryName component', () => {
      const wrapper = createWrapper()

      component(wrapper, FactoryName).assert({ exists: true })
    })

    it('renders restore button', () => {
      const wrapper = createWrapper()

      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Restore'))
        .assert({ exists: true })
    })

    it('renders as a list item', () => {
      const wrapper = createWrapper()

      component(wrapper, VListItem).assert({ exists: true })
    })
  })

  describe('Name Conflict Detection', () => {
    it('disables restore button when factory name conflicts', () => {
      mockFactories.value = {
        'Steel-Production': {
          name: 'Steel-Production',
          icon: 'Desc_SteelIngot_C',
          floors: [],
          recipeLinks: {},
        },
      }

      const wrapper = createWrapper()

      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Restore'))
        .assert({ props: { disabled: true } })
    })

    it('enables restore button when no name conflict', () => {
      mockFactories.value = {}

      const wrapper = createWrapper()

      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Restore'))
        .assert({ props: { disabled: false } })
    })

    it('enables restore button after renaming to unique name', async () => {
      mockFactories.value = {
        'Steel-Production': {
          name: 'Steel-Production',
          icon: 'Desc_SteelIngot_C',
          floors: [],
          recipeLinks: {},
        },
      }

      const wrapper = createWrapper()

      // Initially disabled due to conflict
      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Restore'))
        .assert({ props: { disabled: true } })

      // Rename to unique name
      await component(wrapper, FactoryName).emit('rename', 'Steel-Production', 'Steel-Production-2')

      // Should now be enabled
      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Restore'))
        .assert({ props: { disabled: false } })
    })

    it('keeps restore button disabled after renaming to conflicting name', async () => {
      mockFactories.value = {
        'Steel-Production': {
          name: 'Steel-Production',
          icon: 'Desc_SteelIngot_C',
          floors: [],
          recipeLinks: {},
        },
        'Iron-Works': {
          name: 'Iron-Works',
          icon: 'Desc_IronIngot_C',
          floors: [],
          recipeLinks: {},
        },
      }

      const wrapper = createWrapper()

      // Rename to another conflicting name
      await component(wrapper, FactoryName).emit('rename', 'Steel-Production', 'Iron-Works')

      // Should still be disabled
      component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Restore'))
        .assert({ props: { disabled: true } })
    })
  })

  describe('Restore Event', () => {
    it('emits restore event without alias when no rename', async () => {
      mockFactories.value = {}

      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Restore'))
        .click()

      expect(wrapper.emitted('restore')).toHaveLength(1)
      expect(wrapper.emitted('restore')?.[0]).toEqual([undefined])
    })

    it('emits restore event with importAlias when renamed', async () => {
      mockFactories.value = {}

      const wrapper = createWrapper()

      await component(wrapper, FactoryName).emit('rename', 'Steel-Production', 'Steel-Production-2')

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Restore'))
        .click()

      expect(wrapper.emitted('restore')).toHaveLength(1)
      expect(wrapper.emitted('restore')?.[0]).toEqual(['Steel-Production-2'])
    })

    it('does not emit restore when name conflicts', async () => {
      mockFactories.value = {
        'Steel-Production': {
          name: 'Steel-Production',
          icon: 'Desc_SteelIngot_C',
          floors: [],
          recipeLinks: {},
        },
      }

      const wrapper = createWrapper()

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Restore'))
        .click()

      // Event should not be emitted because handler checks hasNameConflict
      expect(wrapper.emitted('restore')).toBeUndefined()
    })

    it('resets importAlias when renamed back to original name', async () => {
      mockFactories.value = {}

      const wrapper = createWrapper()

      // Rename to different name
      await component(wrapper, FactoryName).emit('rename', 'Steel-Production', 'New-Name')

      // Rename back to original
      await component(wrapper, FactoryName).emit('rename', 'New-Name', 'Steel-Production')

      await component(wrapper, VBtn)
        .match((btn) => btn.text().includes('Restore'))
        .click()

      expect(wrapper.emitted('restore')?.[0]).toEqual([undefined])
    })
  })

  describe('Delete Event', () => {
    it('emits delete event when FactoryName delete is triggered', async () => {
      const wrapper = createWrapper()

      await component(wrapper, FactoryName).emit('delete')

      expect(wrapper.emitted('delete')).toHaveLength(1)
      expect(wrapper.emitted('delete')?.[0]).toEqual([])
    })
  })

  describe('Edge Cases', () => {
    it('handles backup with special characters in filename', () => {
      const specialBackup: GoogleDriveFile = {
        id: 'backup-2',
        name: "John's-Steel-&-Iron.sptrak",
        mimeType: 'application/json',
        modifiedTime: '2024-01-15T10:30:00.000Z',
        createdTime: '2024-01-15T10:00:00.000Z',
      }

      const wrapper = createWrapper({ backup: specialBackup })

      expect(wrapper.text()).toContain("John's-Steel-&-Iron")
    })

    it('handles very long factory names', () => {
      const longNameBackup: GoogleDriveFile = {
        id: 'backup-3',
        name: 'This-Is-A-Very-Long-Factory-Name-That-Should-Still-Display-Correctly.sptrak',
        mimeType: 'application/json',
        modifiedTime: '2024-01-15T10:30:00.000Z',
        createdTime: '2024-01-15T10:00:00.000Z',
      }

      const wrapper = createWrapper({ backup: longNameBackup })

      expect(wrapper.text()).toContain('This-Is-A-Very-Long-Factory-Name')
    })
  })
})
