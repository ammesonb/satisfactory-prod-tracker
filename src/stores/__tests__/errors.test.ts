import type { ErrorBuilder } from '@/types/errors'
import type { IErrorStore } from '@/types/stores'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { VNode } from 'vue'
import { h } from 'vue'

// Mock fetch for any potential network requests
global.fetch = vi.fn()

// Import the real store implementation directly, bypassing the global mock
vi.doMock('@/stores/errors', async () => {
  const actual = await vi.importActual('@/stores/errors')
  return actual
})

const { useErrorStore } = await import('../errors')

describe('useErrorStore', () => {
  // Helper to verify store implements IErrorStore interface
  const expectValidErrorStore = (store: ReturnType<typeof useErrorStore>) => {
    expect(typeof store.show).toBe('boolean')
    expect(typeof store.level).toBe('string')
    expect(typeof store.summary).toBe('string')
    expect(
      store.bodyContent === null ||
        typeof store.bodyContent === 'object' ||
        typeof store.bodyContent === 'function',
    ).toBe(true)

    expect(typeof store.createBuilder).toBe('function')
    expect(typeof store.error).toBe('function')
    expect(typeof store.warning).toBe('function')
    expect(typeof store.info).toBe('function')
    expect(typeof store.hide).toBe('function')

    // Verify interface compliance
    const errorStore: IErrorStore = store
    expect(errorStore).toBeDefined()
  }

  // Helper to verify builder has correct structure
  const expectValidBuilder = (builder: ErrorBuilder) => {
    expect(builder).toBeDefined()
    expect(typeof builder._title).toBe('string')
    expect(
      builder._bodyContent === null ||
        typeof builder._bodyContent === 'object' ||
        typeof builder._bodyContent === 'function',
    ).toBe(true)
    expect(typeof builder.title).toBe('function')
    expect(typeof builder.body).toBe('function')
    expect(typeof builder.show).toBe('function')
  }

  // Helper to verify store is in initial state
  const expectInitialState = (store: ReturnType<typeof useErrorStore>) => {
    expect(store.show).toBe(false)
    expect(store.level).toBe('error')
    expect(store.summary).toBe('')
    expect(store.bodyContent).toBe(null)
  }

  // Helper to test builder factory methods (error, warning, info)
  const expectBuilderFactory = (
    store: ReturnType<typeof useErrorStore>,
    factoryMethod: 'error' | 'warning' | 'info',
  ) => {
    const builder = store[factoryMethod]()
    expectValidBuilder(builder)
    expect(builder._title).toBe('')
    expect(builder._bodyContent).toBe(null)
  }

  // Helper to test complete builder workflow
  const expectBuilderWorkflow = (
    store: ReturnType<typeof useErrorStore>,
    level: 'error' | 'warning' | 'info',
    title: string,
    content?: VNode | (() => VNode),
  ) => {
    const builder = store[level]()

    // Test chaining
    const titleResult = builder.title(title)
    expect(titleResult).toBe(builder) // Should return self for chaining
    expect(builder._title).toBe(title)

    if (content) {
      const bodyResult = builder.body(content)
      expect(bodyResult).toBe(builder) // Should return self for chaining
      expect(builder._bodyContent).toBe(content)
    }

    // Test show
    builder.show()

    expect(store.show).toBe(true)
    expect(store.level).toBe(level)
    expect(store.summary).toBe(title)
    expect(store.bodyContent).toBe(content || null)
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useErrorStore()
      expectInitialState(store)
    })
  })

  describe('actions', () => {
    describe('hide', () => {
      it('should reset store to initial state', () => {
        const store = useErrorStore()

        // Set some state
        store.show = true
        store.level = 'warning'
        store.summary = 'Test error'
        store.bodyContent = h('div', 'Test content')

        // Hide should reset everything
        store.hide()

        expect(store.show).toBe(false)
        expect(store.summary).toBe('')
        expect(store.bodyContent).toBe(null)
      })
    })

    describe('createBuilder', () => {
      it('should create error builder with correct level', () => {
        const store = useErrorStore()
        const builder = store.createBuilder('error')
        expectValidBuilder(builder)
      })

      it('should create warning builder with correct level', () => {
        const store = useErrorStore()
        const builder = store.createBuilder('warning')
        expectValidBuilder(builder)
      })

      it('should create info builder with correct level', () => {
        const store = useErrorStore()
        const builder = store.createBuilder('info')
        expectValidBuilder(builder)
      })
    })

    describe('builder factory methods', () => {
      it('should return valid error builder', () => {
        const store = useErrorStore()
        expectBuilderFactory(store, 'error')
      })

      it('should return valid warning builder', () => {
        const store = useErrorStore()
        expectBuilderFactory(store, 'warning')
      })

      it('should return valid info builder', () => {
        const store = useErrorStore()
        expectBuilderFactory(store, 'info')
      })
    })
  })

  describe('ErrorBuilder', () => {
    describe('title', () => {
      it('should set title and return builder for chaining', () => {
        const store = useErrorStore()
        const builder = store.error()

        const result = builder.title('Test Error Title')

        expect(builder._title).toBe('Test Error Title')
        expect(result).toBe(builder)
      })

      it('should update title when called multiple times', () => {
        const store = useErrorStore()
        const builder = store.error()

        builder.title('First Title')
        expect(builder._title).toBe('First Title')

        builder.title('Second Title')
        expect(builder._title).toBe('Second Title')
      })
    })

    describe('body', () => {
      it('should set body content with VNode and return builder for chaining', () => {
        const store = useErrorStore()
        const builder = store.error()
        const testVNode = h('div', 'Test content')

        const result = builder.body(testVNode)

        expect(builder._bodyContent).toBe(testVNode)
        expect(result).toBe(builder)
      })

      it('should set body content with function and return builder for chaining', () => {
        const store = useErrorStore()
        const builder = store.error()
        const testFunction = () => h('div', 'Dynamic content')

        const result = builder.body(testFunction)

        expect(builder._bodyContent).toBe(testFunction)
        expect(result).toBe(builder)
      })
    })

    describe('complete workflows', () => {
      it('should handle error workflow', () => {
        const store = useErrorStore()
        const testVNode = h('div', 'Error content')
        expectBuilderWorkflow(store, 'error', 'Test Error', testVNode)
      })

      it('should handle warning workflow', () => {
        const store = useErrorStore()
        const testFunction = () => h('div', 'Warning content')
        expectBuilderWorkflow(store, 'warning', 'Test Warning', testFunction)
      })

      it('should handle info workflow', () => {
        const store = useErrorStore()
        expectBuilderWorkflow(store, 'info', 'Test Info')
      })

      it('should support fluent interface chaining', () => {
        const store = useErrorStore()
        const testVNode = h('div', 'Chained content')

        store.error().title('Chained Error').body(testVNode).show()

        expect(store.show).toBe(true)
        expect(store.level).toBe('error')
        expect(store.summary).toBe('Chained Error')
        expect(store.bodyContent).toBe(testVNode)
      })
    })
  })

  describe('integration tests', () => {
    it('should handle multiple error builders from same store', () => {
      const store = useErrorStore()

      // Create first builder but don't show it
      const builder1 = store.error().title('First Error')

      // Create second builder and show it
      store.warning().title('Second Warning').show()

      // Store should reflect the second builder that was shown
      expect(store.show).toBe(true)
      expect(store.level).toBe('warning')
      expect(store.summary).toBe('Second Warning')

      // First builder should still have its own state
      expect(builder1._title).toBe('First Error')
    })

    it('should handle show, hide, show cycle', () => {
      const store = useErrorStore()

      // Show an error
      expectBuilderWorkflow(store, 'error', 'First Error')

      // Hide it
      store.hide()
      expect(store.show).toBe(false)
      expect(store.summary).toBe('')

      // Show a different error
      expectBuilderWorkflow(store, 'info', 'Second Info')
    })
  })

  describe('store interface compliance', () => {
    it('should implement IErrorStore interface', () => {
      const store = useErrorStore()
      expectValidErrorStore(store)
    })
  })
})
