import { ref } from 'vue'
import { vi } from 'vitest'
import type { VNode } from 'vue'

// Create reactive refs that persist across calls for key properties
export const mockErrorShow = ref(false)
export const mockErrorLevel = ref<'error' | 'warning' | 'info'>('error')
export const mockErrorSummary = ref('')
export const mockErrorBodyContent = ref<VNode | (() => VNode) | null>(null)

// Error store action mocks
export const mockHideError = vi.fn(() => {
  mockErrorShow.value = false
  mockErrorSummary.value = ''
  mockErrorBodyContent.value = null
})
export const mockCreateBuilder = vi.fn()
export const mockErrorBuilder = vi.fn()
export const mockWarningBuilder = vi.fn()
export const mockInfoBuilder = vi.fn()

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
