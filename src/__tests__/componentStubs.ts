/**
 * Shared component stubs for testing
 */

export enum SupportedStubs {
  CachedIcon = 'CachedIcon',
}

export const componentStubs = {
  [SupportedStubs.CachedIcon]: {
    name: 'CachedIcon',
    props: ['icon', 'size', 'alt'],
    template:
      '<div class="cached-icon-stub" :data-icon="icon" :data-size="size" :data-alt="alt"></div>',
  },
} as const

/**
 * Get stubs for specific components
 * @param stubs Array of stub types to include
 * @returns Object with component stubs
 */
export function getStubs(...stubs: SupportedStubs[]) {
  return stubs.reduce(
    (acc, stubType) => {
      acc[stubType] = componentStubs[stubType]
      return acc
    },
    {} as Record<string, any>,
  )
}

/**
 * Get all available stubs
 * @returns Object with all component stubs
 */
export function getAllStubs() {
  return { ...componentStubs }
}
