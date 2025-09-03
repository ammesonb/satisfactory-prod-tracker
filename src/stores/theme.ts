import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const isDark = ref(true)

    const toggleTheme = () => {
      isDark.value = !isDark.value
    }

    const setDarkTheme = (dark: boolean) => {
      isDark.value = dark
    }

    return {
      isDark,
      toggleTheme,
      setDarkTheme,
    }
  },
  {
    persist: true,
  },
)
