import { vi } from 'vitest'

// Create reactive refs for recipe status that persist across calls
export const mockSetRecipeBuilt = vi.fn()
export const mockSetLinkBuilt = vi.fn()
export const mockIsRecipeComplete = vi.fn(() => false)
export const mockIsLinkBuilt = vi.fn(() => false)
export const mockGetRecipePanelValue = vi.fn(
  (recipe) => `${recipe.batchNumber || 0}-${recipe.recipe.name}`,
)
export const mockLeftoverProductsAsLinks = vi.fn(() => [
  { source: 'test-recipe', sink: '', material: 'test-material', amount: 1 },
])

// Main mock implementation
export const mockUseRecipeStatus = vi.fn(() => ({
  isRecipeComplete: mockIsRecipeComplete,
  setRecipeBuilt: mockSetRecipeBuilt,
  isLinkBuilt: mockIsLinkBuilt,
  setLinkBuilt: mockSetLinkBuilt,
  getRecipePanelValue: mockGetRecipePanelValue,
  leftoverProductsAsLinks: mockLeftoverProductsAsLinks,
}))
