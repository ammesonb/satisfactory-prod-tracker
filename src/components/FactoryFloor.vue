<script setup lang="ts">
import { computed } from 'vue'
import type { Floor } from '@/types/factory'
import { getIconURL } from '@/logistics/images'
import { useFactoryStore } from '@/stores/factory'

interface Props {
  floor: Floor
  floorNumber: number
  expandFloor: boolean
}

const props = defineProps<Props>()

const factoryStore = useFactoryStore()

const floorName = computed(() => factoryStore.getFloorDisplayName(props.floorNumber, props.floor))

const emit = defineEmits<{
  'update:expandFloor': [value: boolean]
  'edit-floor': [floorIndex: number]
}>()
</script>

<template>
  <v-expansion-panel
    :model-value="props.expandFloor"
    @update:model-value="emit('update:expandFloor', $event)"
    class="mb-2"
    elevation="2"
  >
    <v-expansion-panel-title>
      <div class="d-flex align-center w-100">
        <div class="d-flex align-center">
          <v-img
            v-if="props.floor.icon"
            class="me-3"
            :src="getIconURL(props.floor.icon, 64)"
            width="24"
            height="24"
          />
          <v-icon v-else class="me-3">mdi-factory</v-icon>
          <span class="text-h6 font-weight-bold">{{ floorName }}</span>
        </div>
        <v-spacer />
        <div class="d-flex align-center">
          <v-chip size="small" color="secondary" variant="outlined" class="me-2">
            {{ props.floor.recipes.length }} recipes
          </v-chip>
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click.stop="emit('edit-floor', props.floorNumber - 1)"
            class="me-1"
          />
        </div>
      </div>
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
