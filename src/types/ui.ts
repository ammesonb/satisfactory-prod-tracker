export interface SearchOptions {
  debounceMs?: number
  maxResults?: number
  maxNoSearchResults?: number
}

export interface IconConfig {
  showIcons?: boolean
  dropdownIconSize?: number
  selectedIconSize?: number
}

export interface DisplayConfig {
  showType?: boolean
  variant?: VAutocomplete['variant']
  density?: VAutocomplete['density']
  placeholder?: string
  hideDetails?: boolean
  label?: string
}
