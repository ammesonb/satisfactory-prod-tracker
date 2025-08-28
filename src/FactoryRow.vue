<script setup lang="ts">
import type { Factory } from './types/factory'
import { getIconURL } from './logistics/images'

interface Props {
  factory: Factory
}

const props = defineProps<Props>()
const emit = defineEmits(['select'])
</script>

<template>
  <v-list-item @click="emit('select')" :title="props.factory.name">
    <template #prepend>
      <v-img :src="getIconURL(props.factory.icon, 64)" width="32" height="32" />
    </template>
  </v-list-item>
</template>
