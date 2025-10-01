import { DOMWrapper, VueWrapper } from '@vue/test-utils'
import { expect } from 'vitest'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentConstructor = new (...args: any[]) => any

type ElementMatcher = (wrapper: DOMWrapper<Element>) => boolean
type ComponentMatcher<T extends ComponentConstructor> = (
  wrapper: VueWrapper<InstanceType<T>>,
) => boolean

interface Assertions {
  exists?: boolean
  count?: number
  props?: Record<string, unknown>
  attributes?: Record<string, unknown>
  classes?: string[]
}

class ElementHelper {
  constructor(
    private wrapper: VueWrapper,
    private selector: string,
    private matchers: ElementMatcher[] = [],
  ) {}

  private findAll(): DOMWrapper<Element>[] {
    let elements = this.wrapper.findAll(this.selector)

    for (const matcher of this.matchers) {
      elements = elements.filter(matcher)
    }

    return elements
  }

  private findOne(): DOMWrapper<Element> {
    const elements = this.findAll()
    if (elements.length > 1) {
      throw new Error(
        `Expected to find one element matching "${this.selector}", but found ${elements.length}`,
      )
    }
    if (elements.length === 0) {
      throw new Error(`Expected to find one element matching "${this.selector}", but found none`)
    }
    return elements[0]
  }

  match(matcher: ElementMatcher): this {
    this.matchers.push(matcher)
    return this
  }

  assert(options: Assertions = { exists: true }): this {
    const elements = this.findAll()

    if (options.count !== undefined) {
      expect(elements).toHaveLength(options.count)
    }
    if (options.exists !== undefined) {
      if (options.exists) {
        expect(elements.length).toBeGreaterThan(0)
      } else {
        expect(elements.length).toBe(0)
      }
    }
    if (options.attributes !== undefined && elements.length === 1) {
      for (const [key, value] of Object.entries(options.attributes)) {
        expect(elements[0].attributes(key)).toBe(value)
      }
    }
    if (options.classes !== undefined && elements.length === 1) {
      for (const value of options.classes) {
        expect(elements[0].classes()).toContain(value)
      }
    }
    return this
  }

  async click(force?: boolean): Promise<this> {
    await this.findOne().trigger('click', force ? { force } : {})
    await this.wrapper.vm.$nextTick()
    return this
  }

  getElement(): DOMWrapper<Element> {
    return this.findOne()
  }

  getElements(): DOMWrapper<Element>[] {
    return this.findAll()
  }
}

class ComponentHelper<T extends ComponentConstructor> {
  constructor(
    private wrapper: VueWrapper,
    private type: T,
    private matchers: ComponentMatcher<T>[] = [],
  ) {}

  private findAll(): VueWrapper<InstanceType<T>>[] {
    let components = this.wrapper.findAllComponents(this.type) as VueWrapper<InstanceType<T>>[]

    for (const matcher of this.matchers) {
      components = components.filter(matcher)
    }

    return components
  }

  private findOne(): VueWrapper<InstanceType<T>> {
    const components = this.findAll()
    if (components.length > 1) {
      throw new Error(
        `Expected to find one component of type "${this.type.name}", but found ${components.length}`,
      )
    }
    if (components.length === 0) {
      throw new Error(`Expected to find one component of type "${this.type.name}", but found none`)
    }
    return components[0]
  }

  match(matcher: ComponentMatcher<T>): this {
    this.matchers.push(matcher)
    return this
  }

  assert(options: Assertions = { exists: true }): this {
    const components = this.findAll()

    if (options.count !== undefined) {
      expect(components).toHaveLength(options.count)
    }
    if (options.exists !== undefined) {
      if (options.exists) {
        expect(components.length).toBeGreaterThan(0)
      } else {
        expect(components.length).toBe(0)
      }
    }
    if (options.props !== undefined && components.length === 1) {
      for (const [key, value] of Object.entries(options.props)) {
        const propValue = components[0].props(key)
        // Use deep equality for objects/arrays, reference equality for primitives
        if (typeof value === 'object' && value !== null) {
          expect(propValue).toStrictEqual(value)
        } else {
          expect(propValue).toBe(value)
        }
      }
    }
    if (options.attributes !== undefined && components.length === 1) {
      for (const [key, value] of Object.entries(options.attributes)) {
        expect(components[0].attributes(key)).toBe(value)
      }
    }
    if (options.classes !== undefined && components.length === 1) {
      for (const value of options.classes) {
        expect(components[0].classes()).toContain(value)
      }
    }
    return this
  }

  async click(force?: boolean): Promise<this> {
    await this.findOne().trigger('click', force ? { force } : {})
    await this.wrapper.vm.$nextTick()
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async emit(eventName: string, ...args: any[]): Promise<this> {
    const component = this.findOne()
    await component.vm.$emit(eventName, ...args)
    await this.wrapper.vm.$nextTick()
    return this
  }

  getComponent(): VueWrapper<InstanceType<T>> {
    return this.findOne()
  }

  getComponents(): VueWrapper<InstanceType<T>>[] {
    return this.findAll()
  }
}

// CLAUDE: with matcher changes, this could take a list of matchers, defaulting to empty if not provided
export function element(wrapper: VueWrapper, selector: string): ElementHelper {
  return new ElementHelper(wrapper, selector)
}

export function component<T extends ComponentConstructor>(
  wrapper: VueWrapper,
  type: T,
): ComponentHelper<T> {
  return new ComponentHelper(wrapper, type)
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
  // proxy requires an object as a target, so use an empty array
  // never actually returned, since get() intercepts all access
  return new Proxy([] as unknown as T, {
    get(_target, prop) {
      if (prop === 'value') return mockRef.value
      const unwrapped = mockRef.value as Record<string | symbol, unknown>
      const value = unwrapped[prop]
      // Bind functions to the unwrapped value to maintain correct 'this' context
      if (typeof value === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (value as any).bind(mockRef.value)
      }
      return value
    },
  })
}
