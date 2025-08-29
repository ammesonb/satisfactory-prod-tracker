<script setup lang="ts">
import type { Floor } from '@/types/factory'

interface Props {
  floor: Floor
  floorNumber: number
  expandFloor: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:expandFloor': [value: boolean]
}>()
</script>

<template>
  <v-expansion-panel
    :model-value="props.expandFloor"
    @update:model-value="emit('update:expandFloor', $event)"
    class="mb-2"
    elevation="2"
  >
    <v-expansion-panel-title class="text-h6 font-weight-bold">
      <v-icon class="me-3" color="primary">mdi-factory</v-icon>
      Floor {{ props.floorNumber }}
      <template v-if="props.floor.name"> - {{ props.floor.name }} </template>
      <v-spacer />
      <v-chip size="small" color="secondary" variant="outlined" class="me-2">
        {{ props.floor.recipes.length }} recipes
      </v-chip>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <v-row>
        <v-col
          v-for="recipe in props.floor.recipes"
          :key="recipe.recipe.name"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card variant="outlined" class="pa-3">
            <v-card-title class="text-body-1 pa-0">
              {{ recipe.recipe.name }}
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
