import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'

import { useSelection } from '@/composables/useSelection'

interface TestItem {
  id: string
  name: string
}

describe('useSelection', () => {
  const makeItem = (id: string, name: string): TestItem => ({ id, name })

  beforeEach(() => {
    // No mocks needed - testing actual implementation
  })

  describe('selectedSet', () => {
    it('returns a Set containing selected item keys', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref(['1'])

      const { selectedSet } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(selectedSet.value).toBeInstanceOf(Set)
      expect(selectedSet.value.has('1')).toBe(true)
      expect(selectedSet.value.has('2')).toBe(false)
    })

    it('returns empty Set when no items selected', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1')])
      const selected = ref<string[]>([])

      const { selectedSet } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(selectedSet.value.size).toBe(0)
    })

    it('updates reactively when selected changes', async () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref<string[]>([])

      const { selectedSet } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(selectedSet.value.size).toBe(0)

      selected.value = ['1', '2']
      await nextTick()

      expect(selectedSet.value.size).toBe(2)
      expect(selectedSet.value.has('1')).toBe(true)
      expect(selectedSet.value.has('2')).toBe(true)
    })
  })

  describe('allSelected', () => {
    it('returns true when all items are selected', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref(['1', '2'])

      const { allSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(allSelected.value).toBe(true)
    })

    it('returns false when some items are selected', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref(['1'])

      const { allSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(allSelected.value).toBe(false)
    })

    it('returns false when no items are selected', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref<string[]>([])

      const { allSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(allSelected.value).toBe(false)
    })

    it('returns false when items list is empty', () => {
      const items = ref<TestItem[]>([])
      const selected = ref<string[]>([])

      const { allSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(allSelected.value).toBe(false)
    })

    it('updates reactively when items change', async () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1')])
      const selected = ref(['1'])

      const { allSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(allSelected.value).toBe(true)

      items.value.push(makeItem('2', 'Item 2'))
      await nextTick()

      expect(allSelected.value).toBe(false)
    })

    it('updates reactively when selected changes', async () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref(['1'])

      const { allSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(allSelected.value).toBe(false)

      selected.value = ['1', '2']
      await nextTick()

      expect(allSelected.value).toBe(true)
    })
  })

  describe('someSelected', () => {
    it('returns true when some items are selected', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref(['1'])

      const { someSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(someSelected.value).toBe(true)
    })

    it('returns true when all items are selected', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref(['1', '2'])

      const { someSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(someSelected.value).toBe(true)
    })

    it('returns false when no items are selected', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref<string[]>([])

      const { someSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(someSelected.value).toBe(false)
    })

    it('updates reactively when selected changes', async () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref<string[]>([])

      const { someSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(someSelected.value).toBe(false)

      selected.value = ['1']
      await nextTick()

      expect(someSelected.value).toBe(true)
    })
  })

  describe('toggleAll', () => {
    it('selects all items when none are selected', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref<string[]>([])

      const { toggleAll } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      toggleAll()

      expect(selected.value).toEqual(['1', '2'])
    })

    it('selects all items when some are selected', () => {
      const items = ref<TestItem[]>([
        makeItem('1', 'Item 1'),
        makeItem('2', 'Item 2'),
        makeItem('3', 'Item 3'),
      ])
      const selected = ref(['1'])

      const { toggleAll } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      toggleAll()

      expect(selected.value).toEqual(['1', '2', '3'])
    })

    it('deselects all items when all are selected', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref(['1', '2'])

      const { toggleAll } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      toggleAll()

      expect(selected.value).toEqual([])
    })

    it('does nothing with empty items list', () => {
      const items = ref<TestItem[]>([])
      const selected = ref<string[]>([])

      const { toggleAll } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      toggleAll()

      expect(selected.value).toEqual([])
    })

    it('uses getKey to extract item keys', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref<string[]>([])

      const { toggleAll } = useSelection({
        items,
        selected,
        getKey: (item) => `key-${item.id}`,
      })

      toggleAll()

      expect(selected.value).toEqual(['key-1', 'key-2'])
    })
  })

  describe('toggleItem', () => {
    it('adds item to selection when not selected', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref<string[]>([])

      const { toggleItem } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      toggleItem('1')

      expect(selected.value).toEqual(['1'])
    })

    it('removes item from selection when selected', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref(['1', '2'])

      const { toggleItem } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      toggleItem('1')

      expect(selected.value).toEqual(['2'])
    })

    it('adds item to existing selection', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref(['1'])

      const { toggleItem } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      toggleItem('2')

      expect(selected.value).toEqual(['1', '2'])
    })

    it('removes item from middle of selection', () => {
      const items = ref<TestItem[]>([
        makeItem('1', 'Item 1'),
        makeItem('2', 'Item 2'),
        makeItem('3', 'Item 3'),
      ])
      const selected = ref(['1', '2', '3'])

      const { toggleItem } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      toggleItem('2')

      expect(selected.value).toEqual(['1', '3'])
    })

    it('handles toggling same item multiple times', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1')])
      const selected = ref<string[]>([])

      const { toggleItem } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      toggleItem('1')
      expect(selected.value).toEqual(['1'])

      toggleItem('1')
      expect(selected.value).toEqual([])

      toggleItem('1')
      expect(selected.value).toEqual(['1'])
    })

    it('preserves original array when adding', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref(['1'])
      const originalArray = selected.value

      const { toggleItem } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      toggleItem('2')

      expect(selected.value).not.toBe(originalArray)
      expect(selected.value).toEqual(['1', '2'])
    })
  })

  describe('isSelected', () => {
    it('returns true when item is selected', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref(['1'])

      const { isSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(isSelected('1')).toBe(true)
    })

    it('returns false when item is not selected', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref(['1'])

      const { isSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(isSelected('2')).toBe(false)
    })

    it('returns false for non-existent items', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1')])
      const selected = ref(['1'])

      const { isSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(isSelected('999')).toBe(false)
    })

    it('returns false when no items are selected', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1')])
      const selected = ref<string[]>([])

      const { isSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(isSelected('1')).toBe(false)
    })

    it('updates when selection changes', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1')])
      const selected = ref<string[]>([])

      const { isSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(isSelected('1')).toBe(false)

      selected.value = ['1']

      expect(isSelected('1')).toBe(true)
    })
  })

  describe('custom getKey function', () => {
    it('uses custom getKey for all operations', () => {
      interface CustomItem {
        uuid: string
        value: string
      }

      const customItems = ref<CustomItem[]>([
        { uuid: 'abc-123', value: 'First' },
        { uuid: 'def-456', value: 'Second' },
      ])
      const selected = ref<string[]>([])

      const { toggleItem, isSelected, toggleAll, allSelected } = useSelection({
        items: customItems,
        selected,
        getKey: (item) => item.uuid,
      })

      toggleItem('abc-123')
      expect(selected.value).toEqual(['abc-123'])
      expect(isSelected('abc-123')).toBe(true)

      toggleAll()
      expect(selected.value).toEqual(['abc-123', 'def-456'])
      expect(allSelected.value).toBe(true)
    })

    it('handles complex key extraction', () => {
      interface NestedItem {
        data: {
          id: number
        }
        name: string
      }

      const nestedItems = ref<NestedItem[]>([
        { data: { id: 1 }, name: 'First' },
        { data: { id: 2 }, name: 'Second' },
      ])
      const selected = ref<string[]>([])

      const { toggleItem, isSelected } = useSelection({
        items: nestedItems,
        selected,
        getKey: (item) => `item-${item.data.id}`,
      })

      toggleItem('item-1')
      expect(isSelected('item-1')).toBe(true)
      expect(selected.value).toEqual(['item-1'])
    })
  })

  describe('edge cases', () => {
    it('handles empty items and selected arrays', () => {
      const items = ref<TestItem[]>([])
      const selected = ref<string[]>([])

      const { selectedSet, allSelected, someSelected, isSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(selectedSet.value.size).toBe(0)
      expect(allSelected.value).toBe(false)
      expect(someSelected.value).toBe(false)
      expect(isSelected('any')).toBe(false)
    })

    it('handles selected containing items not in items list', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1')])
      const selected = ref(['1', '2', '3'])

      const { selectedSet, allSelected, someSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(selectedSet.value.size).toBe(3)
      expect(allSelected.value).toBe(false)
      expect(someSelected.value).toBe(true)
    })

    it('handles duplicate keys in selected array', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref(['1', '1', '2'])

      const { selectedSet } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(selectedSet.value.size).toBe(2)
      expect(selectedSet.value.has('1')).toBe(true)
      expect(selectedSet.value.has('2')).toBe(true)
    })

    it('maintains selection order when toggling', () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref<string[]>([])

      const { toggleItem } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      toggleItem('2')
      toggleItem('1')

      expect(selected.value).toEqual(['2', '1'])
    })

    it('preserves selection when items are reordered', async () => {
      const items = ref<TestItem[]>([makeItem('1', 'Item 1'), makeItem('2', 'Item 2')])
      const selected = ref(['1'])

      const { isSelected } = useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      })

      expect(isSelected('1')).toBe(true)

      items.value = [makeItem('2', 'Item 2'), makeItem('1', 'Item 1')]
      await nextTick()

      expect(isSelected('1')).toBe(true)
    })
  })
})
