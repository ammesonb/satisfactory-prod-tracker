<script setup lang="ts">
import { getIconURL } from '@/logistics/images'
import { computed } from 'vue'

interface Props {
  icon: string
  size?: number
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
})

const sourceSize = computed(() => (props.size <= 32 ? 64 : 256))
const iconUrl = computed(() => getIconURL(props.icon, sourceSize.value))
</script>

<template>
  <v-img :src="iconUrl" :width="size" :height="size" :alt="alt" class="icon-image" loading="lazy" />
</template>

<style scoped>
.icon-image {
  border-radius: 4px;
  object-fit: contain;
  image-rendering: auto;
}
</style>
