<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (element) {
    const yOffset = -80 // Account for app bar height
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

const handleNavigate = (elementId: string) => {
  scrollToElement(elementId)
  handleClose()
}

const handleClose = () => {
  isOpen.value = false
}

const toggleNav = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <v-fab icon="mdi-map" color="primary" @click="toggleNav" v-show="!isOpen" />

  <NavPanel v-if="isOpen" @close="handleClose" @navigate="handleNavigate" />
</template>

<style scoped>
.floating-nav {
  position: relative;
}
</style>
