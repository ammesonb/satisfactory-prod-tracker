import { ref } from 'vue'

// Create reactive refs that persist across calls for key properties
export const mockIsDark = ref(false)

export const mockThemeStore = {
  isDark: mockIsDark.value,
}
