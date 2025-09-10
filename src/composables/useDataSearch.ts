import { ref, computed, type Ref } from 'vue'
import { refDebounced } from '@vueuse/core'
import type { ItemOption } from '@/types/data'
import type { SearchOptions } from '@/types/ui'
import { DEFAULT_SEARCH_OPTIONS } from './constants'

export function useDataSearch(items: Ref<ItemOption[]>, options?: SearchOptions) {
  const searchInput = ref('')
  const config = { ...DEFAULT_SEARCH_OPTIONS, ...options }
  const debouncedSearch = refDebounced(searchInput, config.debounceMs)

  const filteredItems = computed(() => {
    const query = debouncedSearch.value?.toLowerCase().trim()

    if (!query) {
      return items.value.slice(0, config.maxNoSearchResults)
    }

    return items.value
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, config.maxResults)
  })

  const updateSearch = (value: string) => {
    searchInput.value = value
  }

  return {
    searchInput,
    filteredItems,
    updateSearch,
  }
}
