<script setup lang="ts">
import type { Floor } from '@/types/factory'

interface Props {
  floor: Floor
  floorNumber: number
}

const props = defineProps<Props>()
</script>

<template>
  <v-expansion-panel>
    <v-expansion-panel-title>
      {{ props.floorNumber }} -
      {{ props.floor.name || `Floor ${props.floorNumber}` }}
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <p v-for="recipe in props.floor.recipes" :key="recipe.recipe.name">
        {{ recipe.recipe.name }}
      </p>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
