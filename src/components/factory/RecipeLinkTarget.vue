<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Material } from '@/types/factory'
import { useFloorNavigation } from '@/composables/useFloorNavigation'
import { useLinkData } from '@/composables/useLinkData'
import { useRecipeStatus } from '@/composables/useRecipeStatus'

interface Props {
  link: Material
  type: 'input' | 'output'
}

const props = defineProps<Props>()

const { navigateToRecipe } = useFloorNavigation()
const { linkTarget, isRecipe, targetRecipe, displayName } = useLinkData(
  computed(() => props.link),
  computed(() => props.type),
)

const { isLinkBuilt } = useRecipeStatus()

const isHovered = ref(false)

const linkText = computed(() => {
  if (props.type === 'input') return 'from'
  return linkTarget.value ? 'to' : ''
})

const textColorClass = computed(() =>
  isLinkBuilt(props.link) ? 'text-black' : 'text-medium-emphasis',
)

const navigateStyle = computed(() => ({
  backgroundColor: isHovered.value ? 'rgba(var(--v-theme-on-surface), 0.1)' : 'transparent',
}))

const handleNavigation = () => {
  if (targetRecipe.value) {
    navigateToRecipe(targetRecipe.value)
  }
}
</script>

<template>
  <div class="text-caption" :class="textColorClass">
    {{ linkText }}

    <!-- Recipe Link (clickable) -->
    <span
      v-if="isRecipe"
      @click.prevent.stop="handleNavigation"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      class="navigate-name text-decoration-underline px-1 py-1"
      :style="navigateStyle"
    >
      {{ displayName }}
    </span>

    <!-- Non-recipe target (static) -->
    <span v-else>
      {{ displayName }}
    </span>
  </div>
</template>

<style lang="css" scoped>
.navigate-name {
  cursor: pointer;
  margin: -4px;
  border-radius: 4px;
}
</style>
