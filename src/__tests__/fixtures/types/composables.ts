import { vi } from 'vitest'
import type { UseRecipeStatus } from '@/types/composables'

export type MockUseRecipeStatus = UseRecipeStatus & {
  isRecipeComplete: ReturnType<typeof vi.fn>
  setRecipeBuilt: ReturnType<typeof vi.fn>
  isLinkBuilt: ReturnType<typeof vi.fn>
  setLinkBuilt: ReturnType<typeof vi.fn>
  getRecipePanelValue: ReturnType<typeof vi.fn>
  leftoverProductsAsLinks: ReturnType<typeof vi.fn>
}
