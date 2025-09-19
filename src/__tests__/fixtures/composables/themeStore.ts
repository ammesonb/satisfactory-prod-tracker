import { ref } from 'vue'

// Create reactive refs that persist across calls for key properties
export const mockIsDark = ref(false)

export const mockThemeStore = {
  get isDark() {
    return mockIsDark.value
  },
  set isDark(value: boolean) {
    mockIsDark.value = value
  },
}
