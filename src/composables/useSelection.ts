import { computed, type Ref } from 'vue'

export interface UseSelectionOptions<T> {
  items: Ref<T[]>
  selected: Ref<string[]>
  getKey: (item: T) => string
}

export function useSelection<T>({ items, selected, getKey }: UseSelectionOptions<T>) {
  const selectedSet = computed(() => new Set(selected.value))

  const allSelected = computed(
    () => selectedSet.value.size === items.value.length && items.value.length > 0,
  )

  const someSelected = computed(() => selectedSet.value.size > 0)

  const toggleAll = () => {
    if (allSelected.value) {
      selected.value = []
    } else {
      selected.value = items.value.map(getKey)
    }
  }

  const toggleItem = (key: string) => {
    if (selectedSet.value.has(key)) {
      selected.value = selected.value.filter((selectedKey) => selectedKey !== key)
    } else {
      selected.value = [...selected.value, key]
    }
  }

  const isSelected = (key: string) => selectedSet.value.has(key)

  return {
    selectedSet,
    allSelected,
    someSelected,
    toggleAll,
    toggleItem,
    isSelected,
  }
}
