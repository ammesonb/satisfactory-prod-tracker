import { vi } from 'vitest'

export const getIconURL = vi.fn(
  (icon: string, size: number) => `https://example.com/icons/${icon}_${size}.png`,
)
