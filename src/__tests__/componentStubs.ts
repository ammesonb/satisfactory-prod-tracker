/**
 * Shared component stubs for testing
 */

import type { VueWrapper } from '@vue/test-utils'
import type { Stubs, Stub } from '@vue/test-utils/dist/types'

export enum SupportedStubs {
  CachedIcon = 'CachedIcon',
  RecipeNode = 'RecipeNode',
}

export const componentStubs: Stubs = {
  [SupportedStubs.CachedIcon]: {
    name: 'CachedIcon',
    props: ['icon', 'size', 'alt'],
    template:
      '<div class="cached-icon-stub" :data-icon="icon" :data-size="size" :data-alt="alt"></div>',
  },
  [SupportedStubs.RecipeNode]: {
    name: 'RecipeNode',
    template: '<div class="recipe-node">Recipe Node</div>',
    props: ['recipe', 'currentFloorIndex'],
  },
} as const

/**
 * Get stubs for specific components
 * @param stubs Array of stub types to include
 * @returns Object with component stubs
 */
export function getStubs(...stubs: SupportedStubs[]): Record<string, Stub> {
  return stubs.reduce(
    (acc, stubType) => {
      acc[stubType] = componentStubs[stubType]
      return acc
    },
    {} as Record<string, Stub>,
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
export function setComponentData(wrapper: VueWrapper, data: Record<string, unknown>) {
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

/**
 * Get a component property safely without TypeScript errors
 * @param wrapper The Vue Test Utils wrapper
 * @param property The property name to get
 * @returns The property value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getVmProperty(wrapper: { vm: any }, property: string): unknown {
  return wrapper.vm[property]
}
