import type { Component } from 'vue'
import { VueWrapper } from '@vue/test-utils'
import { expect } from 'vitest'

type ComponentSelector = { name: string } | Component
type ElementSelector = string

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
 */
export function getComponentWithText(
  wrapper: VueWrapper,
  selector: ElementSelector | ComponentSelector,
  text: string,
) {
  const components =
    typeof selector === 'string'
      ? wrapper.findAllComponents(selector)
      : wrapper.findAllComponents(selector)
  return components.find((component) => component.text().includes(text))
}
