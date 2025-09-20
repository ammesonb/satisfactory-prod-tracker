import { vi } from 'vitest'
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { ItemOption } from '@/types/data'
import type { UseRecipeStatus } from '@/types/composables'

/**
 * Mock type for useDataSearch composable return value
 */
export type MockUseDataSearch = {
  searchInput: Ref<string>
  filteredItems: ComputedRef<ItemOption[]>
  updateSearch: ReturnType<typeof vi.fn>
}

/**
 * Creates a default mock for useDataSearch composable
 */
export const createMockUseDataSearch = (items: ItemOption[] = []): MockUseDataSearch => ({
  searchInput: ref(''),
  filteredItems: computed(() => items),
  updateSearch: vi.fn(),
})

export type MockUseRecipeStatus = UseRecipeStatus & {
  isRecipeComplete: ReturnType<typeof vi.fn>
  setRecipeBuilt: ReturnType<typeof vi.fn>
  isLinkBuilt: ReturnType<typeof vi.fn>
  setLinkBuilt: ReturnType<typeof vi.fn>
  getRecipePanelValue: ReturnType<typeof vi.fn>
  leftoverProductsAsLinks: ReturnType<typeof vi.fn>
}
