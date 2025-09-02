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
    {} as Record<string, unknown>,
  )
}

/**
 * Get all available stubs
 * @returns Object with all component stubs
 */
export function getAllStubs() {
  return { ...componentStubs }
}

/**
 * Set component data properties for testing
 * @param wrapper The Vue Test Utils wrapper
 * @param data Object with data properties to set
 */
export function setComponentData<T extends Record<string, unknown>>(
  wrapper: { vm: T; $nextTick?: () => Promise<void> },
  data: T,
) {
  Object.assign(wrapper.vm, data)
}

/**
 * Set component data properties and wait for next tick
 * @param wrapper The Vue Test Utils wrapper
 * @param data Object with data properties to set
 */
export async function setComponentDataAndTick<T extends Record<string, unknown>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrapper: { vm: any },
  data: T,
) {
  Object.assign(wrapper.vm, data)
  await wrapper.vm.$nextTick()
}
