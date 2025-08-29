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
  <div class="floating-nav">
    <v-fab
      icon="mdi-map"
      color="primary"
      class="floating-toggle"
      @click="toggleNav"
      v-show="!isOpen"
    />

    <NavPanel v-if="isOpen" @close="handleClose" @navigate="handleNavigate" />
  </div>
</template>

<style scoped>
.floating-nav {
  position: fixed;
  bottom: 72px;
  right: 16px;
  z-index: 1000;
}

@media (max-width: 600px) {
  .floating-nav {
    right: 10px;
  }
}
</style>
