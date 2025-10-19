import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'

import { useSelection } from '@/composables/useSelection'

interface TestItem {
  id: string
  name: string
}

describe('useSelection', () => {
  const makeItem = (id: string, name: string): TestItem => ({ id, name })

  const makeItems = (...ids: string[]) => ids.map((id) => makeItem(id, `Item ${id}`))

  const setupSelection = (itemIds: string[], selectedIds: string[]) => {
    const items = ref(makeItems(...itemIds))
    const selected = ref(selectedIds)
    return {
      items,
      selected,
      selection: useSelection({
        items,
        selected,
        getKey: (item) => item.id,
      }),
    }
  }

  describe('selectedSet', () => {
    const testCases = [
      {
        name: 'returns a Set containing selected item keys',
        items: ['1', '2'],
        selected: ['1'],
        expectedSize: 1,
        expectedHas: { '1': true, '2': false },
      },
      {
        name: 'returns empty Set when no items selected',
        items: ['1'],
        selected: [],
        expectedSize: 0,
        expectedHas: {},
      },
    ]

    testCases.forEach(({ name, items, selected, expectedSize, expectedHas }) => {
      it(name, () => {
        const { selection } = setupSelection(items, selected)

        expect(selection.selectedSet.value).toBeInstanceOf(Set)
        expect(selection.selectedSet.value.size).toBe(expectedSize)
        Object.entries(expectedHas).forEach(([key, expected]) => {
          expect(selection.selectedSet.value.has(key)).toBe(expected)
        })
      })
    })

    it('updates reactively when selected changes', async () => {
      const { selected, selection } = setupSelection(['1', '2'], [])

      expect(selection.selectedSet.value.size).toBe(0)

      selected.value = ['1', '2']
      await nextTick()

      expect(selection.selectedSet.value.size).toBe(2)
      expect(selection.selectedSet.value.has('1')).toBe(true)
      expect(selection.selectedSet.value.has('2')).toBe(true)
    })
  })

  describe('allSelected', () => {
    const testCases = [
      {
        name: 'returns true when all items are selected',
        items: ['1', '2'],
        selected: ['1', '2'],
        expected: true,
      },
      {
        name: 'returns false when some items are selected',
        items: ['1', '2'],
        selected: ['1'],
        expected: false,
      },
      {
        name: 'returns false when no items are selected',
        items: ['1', '2'],
        selected: [],
        expected: false,
      },
      {
        name: 'returns false when items list is empty',
        items: [],
        selected: [],
        expected: false,
      },
    ]

    testCases.forEach(({ name, items, selected, expected }) => {
      it(name, () => {
        const { selection } = setupSelection(items, selected)
        expect(selection.allSelected.value).toBe(expected)
      })
    })

    it('updates reactively when items change', async () => {
      const { items, selection } = setupSelection(['1'], ['1'])

      expect(selection.allSelected.value).toBe(true)

      items.value.push(makeItem('2', 'Item 2'))
      await nextTick()

      expect(selection.allSelected.value).toBe(false)
    })

    it('updates reactively when selected changes', async () => {
      const { selected, selection } = setupSelection(['1', '2'], ['1'])

      expect(selection.allSelected.value).toBe(false)

      selected.value = ['1', '2']
      await nextTick()

      expect(selection.allSelected.value).toBe(true)
    })
  })

  describe('someSelected', () => {
    const testCases = [
      {
        name: 'returns true when some items are selected',
        items: ['1', '2'],
        selected: ['1'],
        expected: true,
      },
      {
        name: 'returns true when all items are selected',
        items: ['1', '2'],
        selected: ['1', '2'],
        expected: true,
      },
      {
        name: 'returns false when no items are selected',
        items: ['1', '2'],
        selected: [],
        expected: false,
      },
    ]

    testCases.forEach(({ name, items, selected, expected }) => {
      it(name, () => {
        const { selection } = setupSelection(items, selected)
        expect(selection.someSelected.value).toBe(expected)
      })
    })

    it('updates reactively when selected changes', async () => {
      const { selected, selection } = setupSelection(['1', '2'], [])

      expect(selection.someSelected.value).toBe(false)

      selected.value = ['1']
      await nextTick()

      expect(selection.someSelected.value).toBe(true)
    })
  })

  describe('toggleAll', () => {
    const testCases = [
      {
        name: 'selects all items when none are selected',
        items: ['1', '2'],
        selected: [],
        expected: ['1', '2'],
      },
      {
        name: 'selects all items when some are selected',
        items: ['1', '2', '3'],
        selected: ['1'],
        expected: ['1', '2', '3'],
      },
      {
        name: 'deselects all items when all are selected',
        items: ['1', '2'],
        selected: ['1', '2'],
        expected: [],
      },
      {
        name: 'does nothing with empty items list',
        items: [],
        selected: [],
        expected: [],
      },
    ]

    testCases.forEach(({ name, items, selected: initialSelected, expected }) => {
      it(name, () => {
        const { selected, selection } = setupSelection(items, initialSelected)
        selection.toggleAll()
        expect(selected.value).toEqual(expected)
      })
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
    const testCases = [
      {
        name: 'adds item to selection when not selected',
        items: ['1', '2'],
        selected: [],
        toggleKey: '1',
        expected: ['1'],
      },
      {
        name: 'removes item from selection when selected',
        items: ['1', '2'],
        selected: ['1', '2'],
        toggleKey: '1',
        expected: ['2'],
      },
      {
        name: 'adds item to existing selection',
        items: ['1', '2'],
        selected: ['1'],
        toggleKey: '2',
        expected: ['1', '2'],
      },
      {
        name: 'removes item from middle of selection',
        items: ['1', '2', '3'],
        selected: ['1', '2', '3'],
        toggleKey: '2',
        expected: ['1', '3'],
      },
    ]

    testCases.forEach(({ name, items, selected: initialSelected, toggleKey, expected }) => {
      it(name, () => {
        const { selected, selection } = setupSelection(items, initialSelected)
        selection.toggleItem(toggleKey)
        expect(selected.value).toEqual(expected)
      })
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
    const testCases = [
      {
        name: 'returns true when item is selected',
        items: ['1', '2'],
        selected: ['1'],
        checkKey: '1',
        expected: true,
      },
      {
        name: 'returns false when item is not selected',
        items: ['1', '2'],
        selected: ['1'],
        checkKey: '2',
        expected: false,
      },
      {
        name: 'returns false for non-existent items',
        items: ['1'],
        selected: ['1'],
        checkKey: '999',
        expected: false,
      },
      {
        name: 'returns false when no items are selected',
        items: ['1'],
        selected: [],
        checkKey: '1',
        expected: false,
      },
    ]

    testCases.forEach(({ name, items, selected, checkKey, expected }) => {
      it(name, () => {
        const { selection } = setupSelection(items, selected)
        expect(selection.isSelected(checkKey)).toBe(expected)
      })
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
