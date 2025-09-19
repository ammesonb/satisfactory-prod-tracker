<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Material } from '@/types/factory'
import { useFloorNavigation } from '@/composables/useFloorNavigation'
import { useLinkData } from '@/composables/useLinkData'
import { useRecipeStatus } from '@/composables/useRecipeStatus'

interface Props {
  link: Material
  direction: 'input' | 'output'
}

const props = defineProps<Props>()

const { navigateToRecipe } = useFloorNavigation()
const { linkTarget, isRecipe, targetRecipe, displayName } = useLinkData(
  computed(() => props.link),
  computed(() => props.direction),
)

const { isLinkBuilt } = useRecipeStatus()

const isHovered = ref(false)

const linkText = computed(() => {
  if (props.direction === 'input') return 'from'
  return linkTarget.value ? 'to' : ''
})

const textColorClass = computed(() =>
  isLinkBuilt(props.link) ? 'text-black' : 'text-medium-emphasis',
)

const handleNavigation = () => {
  if (targetRecipe.value) {
    navigateToRecipe(targetRecipe.value)
  }
}

const navigateClass = computed(() => {
  return {
    'navigate-name': !isHovered.value,
    'navigate-name-hover': isHovered.value,
    'navigate-link text-decoration-underline px-1 py-1': true,
  }
})
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
      :class="navigateClass"
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
.navigate-link {
  cursor: pointer;
  margin: -4px;
  border-radius: 4px;
}

.navigate-name {
  background: transparent;
}

.navigate-name-hover {
  background-color: rgba(var(--v-theme-on-surface), 0.1);
}
</style>
