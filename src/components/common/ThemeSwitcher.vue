<template>
  <v-btn
    icon
    @click="toggleTheme"
    :aria-label="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <v-icon>{{ themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { useTheme } from 'vuetify'
import { watch } from 'vue'

const themeStore = useThemeStore()
const theme = useTheme()

// Watch for theme changes and update Vuetify
watch(
  () => themeStore.isDark,
  (isDark) => {
    theme.global.name.value = isDark ? 'dark' : 'light'
  },
  { immediate: true },
)

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>
