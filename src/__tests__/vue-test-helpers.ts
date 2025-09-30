import type { Component } from 'vue'
import { VueWrapper } from '@vue/test-utils'
import { expect } from 'vitest'

type ComponentSelector = { name: string } | Component
type ElementSelector = string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentConstructor = new (...args: any) => any

/**
 * Gets an element or component from the wrapper
 */
export function getElement(wrapper: VueWrapper, selector: ElementSelector | ComponentSelector) {
  return typeof selector === 'string' ? wrapper.find(selector) : wrapper.findComponent(selector)
}

/**
 * Gets a component from the wrapper (use when you need component-specific methods like props)
 * For better type inference, use wrapper.findComponent(ComponentType) directly
 */
export function getComponent(wrapper: VueWrapper, selector: ComponentSelector) {
  return wrapper.findComponent(selector)
}

/**
 * Helper to get text from an element or component
 */
export function expectElementText(
  wrapper: VueWrapper,
  selector: ElementSelector | ComponentSelector,
  expectedText: string,
): void {
  const element = getElement(wrapper, selector)
  expect(element.text()).toContain(expectedText)
}

/**
 * Helper to check component props
 */
export function expectProps(
  wrapper: VueWrapper,
  selector: ComponentSelector,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expectedProps: Record<string, any>,
): void {
  const component = wrapper.findComponent(selector)
  const actualProps = component.props()

  Object.entries(expectedProps).forEach(([key, expectedValue]) => {
    expect(actualProps[key as keyof typeof actualProps]).toEqual(expectedValue)
  })
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
  const component = getComponent(wrapper, selector)
  await component.vm.$emit(eventName, ...args)
  await wrapper.vm.$nextTick()
}

/**
 * Helper to find a component by text content
 * Returns a VueWrapper for the component, or undefined if not found
 */
export function getComponentWithText<T extends ComponentConstructor>(
  wrapper: VueWrapper,
  selector: T,
  text: string,
): VueWrapper<InstanceType<T>> | undefined {
  const components = wrapper.findAllComponents(selector)
  return components.find((component) => component.text().includes(text)) as
    | VueWrapper<InstanceType<T>>
    | undefined
}

/**
 * Creates a proxy that behaves like an unwrapped ref for testing purposes.
 * The proxy allows both .value access (for watchers) and direct property access (for templates).
 *
 * @param mockRef - The ref to wrap in a proxy
 * @returns A proxy that auto-unwraps the ref while maintaining .value access
 *
 * @example
 * const mockItems = ref<Item[]>([])
 * const itemsProxy = createUnwrapProxy(mockItems)
 * // Can access .value for watchers: itemsProxy.value
 * // Can access array methods directly: itemsProxy[0], itemsProxy.map(...)
 */
export function createUnwrapProxy<T extends object>(mockRef: { value: T }): T {
  // Create a proxy that delegates to the unwrapped value
  // Use the actual value as target to ensure proper prototype chain (for Array.isArray, etc.)
  const handler: ProxyHandler<T> = {
    get(target, prop) {
      if (prop === 'value') return mockRef.value
      // Always get from the current ref value
      const unwrapped = mockRef.value as Record<string | symbol, unknown>
      const value = unwrapped[prop]
      // Bind functions to the unwrapped value to maintain correct 'this' context
      if (typeof value === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (value as any).bind(mockRef.value)
      }
      // If the value is undefined, fall back to the target (for methods like .join when value is undefined)
      if (value === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const targetValue = (target as any)[prop]
        if (typeof targetValue === 'function') {
          return targetValue.bind(mockRef.value || target)
        }
        return targetValue
      }
      return value
    },
    // Make the proxy appear as the actual array/object type
    has(_target, prop) {
      if (prop === 'value') return true
      return prop in mockRef.value
    },
    ownKeys() {
      return Reflect.ownKeys(mockRef.value)
    },
    getOwnPropertyDescriptor(_target, prop) {
      return Reflect.getOwnPropertyDescriptor(mockRef.value, prop)
    },
  }
  return new Proxy(mockRef.value, handler)
}
