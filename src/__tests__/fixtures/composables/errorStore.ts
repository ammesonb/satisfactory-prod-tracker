import { vi } from 'vitest'
import type { VNode } from 'vue'
import { ref } from 'vue'

import type { ErrorBuilder } from '@/types/errors'

// Create reactive refs that persist across calls for key properties
export const mockErrorShow = ref(false)
export const mockErrorLevel = ref<'error' | 'warning' | 'info'>('error')
export const mockErrorSummary = ref('')
export const mockErrorBodyContent = ref<VNode | (() => VNode) | null>(null)

// Create chainable builder mock
const createMockBuilder = () => {
  const builder = {
    _title: '',
    _bodyContent: null as VNode | (() => VNode) | null,
    title: vi.fn(function (this: ErrorBuilder, text: string) {
      this._title = text
      return this
    }),
    body: vi.fn(function (this: ErrorBuilder, content: VNode | (() => VNode)) {
      this._bodyContent = content
      return this
    }),
    show: vi.fn(function (this: ErrorBuilder) {
      mockErrorShow.value = true
      mockErrorSummary.value = this._title
      mockErrorBodyContent.value = this._bodyContent
    }),
  }
  return builder
}

// Error store action mocks
export const mockHideError = vi.fn(() => {
  mockErrorShow.value = false
  mockErrorSummary.value = ''
  mockErrorBodyContent.value = null
})
export const mockCreateBuilder = vi.fn((level: 'error' | 'warning' | 'info') => {
  mockErrorLevel.value = level
  return createMockBuilder()
})
export const mockErrorBuilder = vi.fn(() => {
  mockErrorLevel.value = 'error'
  return createMockBuilder()
})
export const mockWarningBuilder = vi.fn(() => {
  mockErrorLevel.value = 'warning'
  return createMockBuilder()
})
export const mockInfoBuilder = vi.fn(() => {
  mockErrorLevel.value = 'info'
  return createMockBuilder()
})

export const mockErrorStore = {
  get show() {
    return mockErrorShow.value
  },
  set show(value: boolean) {
    mockErrorShow.value = value
  },
  get level() {
    return mockErrorLevel.value
  },
  set level(value: 'error' | 'warning' | 'info') {
    mockErrorLevel.value = value
  },
  get summary() {
    return mockErrorSummary.value
  },
  set summary(value: string) {
    mockErrorSummary.value = value
  },
  get bodyContent() {
    return mockErrorBodyContent.value
  },
  set bodyContent(value: VNode | (() => VNode) | null) {
    mockErrorBodyContent.value = value
  },
  get icon() {
    switch (mockErrorLevel.value) {
      case 'error':
        return 'mdi-alert-circle'
      case 'warning':
        return 'mdi-alert'
      case 'info':
        return 'mdi-information'
      default:
        return 'mdi-alert-circle'
    }
  },
  get color() {
    switch (mockErrorLevel.value) {
      case 'error':
        return 'error'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      default:
        return 'error'
    }
  },
  createBuilder: mockCreateBuilder,
  hide: mockHideError,
  error: mockErrorBuilder,
  warning: mockWarningBuilder,
  info: mockInfoBuilder,
}
