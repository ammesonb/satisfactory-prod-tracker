import { ref, computed, type Ref } from 'vue'
import { refDebounced } from '@vueuse/core'

import type { SearchOptions } from '@/types/ui'
import { DEFAULT_SEARCH_OPTIONS } from '@/composables/constants'

export function useDataSearch<T>(
  items: Ref<T[]>,
  matchesFn: (item: T, query: string) => boolean,
  options?: SearchOptions,
) {
  const searchInput = ref('')
  const config = { ...DEFAULT_SEARCH_OPTIONS, ...options }
  const debouncedSearch = refDebounced(searchInput, config.debounceMs)

  const filteredItems = computed(() => {
    const query = debouncedSearch.value?.toLowerCase().trim()

    if (!query) {
      return items.value.slice(0, config.maxNoSearchResults)
    }

    return items.value.filter((item) => matchesFn(item, query)).slice(0, config.maxResults)
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
