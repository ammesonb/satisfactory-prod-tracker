<script setup lang="ts">
import { ref } from 'vue'

import { useFloorNavigation } from '@/composables/useFloorNavigation'

const isOpen = ref(false)
const { navigateToElement } = useFloorNavigation()

const handleNavigate = (elementId: string) => {
  navigateToElement(elementId)
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
