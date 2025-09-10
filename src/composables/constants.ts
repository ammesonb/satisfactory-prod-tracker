import type { SearchOptions } from '@/types/ui'

export const DEFAULT_SEARCH_OPTIONS: Required<SearchOptions> = {
  debounceMs: 200,
  maxResults: 50,
  maxNoSearchResults: 20,
}
