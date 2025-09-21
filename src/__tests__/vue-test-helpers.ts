import { VueWrapper } from '@vue/test-utils'
import { expect } from 'vitest'

type ComponentSelector = { name: string }
type ElementSelector = string

/**
 * Gets an element or component from the wrapper
 */
export function getElement(wrapper: VueWrapper, selector: ElementSelector | ComponentSelector) {
  return typeof selector === 'string' ? wrapper.find(selector) : wrapper.findComponent(selector)
}

/**
 * Gets a component from the wrapper (use when you need component-specific methods like props)
 */
export function getComponent(wrapper: VueWrapper, selector: ComponentSelector) {
  return wrapper.findComponent(selector)
}

/**
 * Asserts that an element or component exists in the wrapper
 */
export function expectElementExists(
  wrapper: VueWrapper,
  selector: ElementSelector | ComponentSelector,
): void {
  const element = getElement(wrapper, selector)
  expect(element.exists()).toBe(true)
}

/**
 * Asserts that an element or component does not exist in the wrapper
 */
export function expectElementNotExists(
  wrapper: VueWrapper,
  selector: ElementSelector | ComponentSelector,
): void {
  const element = getElement(wrapper, selector)
  expect(element.exists()).toBe(false)
}

/**
 * Helper to click an element or component and wait for Vue to update
 */
export async function clickElement(
  wrapper: VueWrapper,
  selector: ElementSelector | ComponentSelector,
): Promise<void> {
  const element = getElement(wrapper, selector)
  await element.trigger('click')
  await wrapper.vm.$nextTick()
}

/**
 * Helper to emit an event from a component and wait for Vue to update
 */
export async function emitEvent(
  wrapper: VueWrapper,
  selector: ComponentSelector,
  eventName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<void> {
  const component = wrapper.findComponent(selector)
  await component.vm.$emit(eventName, ...args)
  await wrapper.vm.$nextTick()
}

/**
 * Convenience function for component selectors
 */
export function byComponent(name: string): ComponentSelector {
  return { name }
}
