<script setup lang="ts">
import { useTransport } from '@/composables/useTransport'
import type { RecipeNode } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'

const props = defineProps<{
  recipe: RecipeNode
  link: Material
  direction: 'input' | 'output'
  isHovered?: boolean
}>()

const { buildingCounts, transportItems } = useTransport(
  props.recipe,
  props.link,
  props.direction,
  props.isHovered,
)
</script>

<template>
  <v-card class="pa-2" min-width="200">
    <v-card-text class="pa-1">
      <!-- Transport capacity table -->
      <v-table density="compact" class="transport-table">
        <tbody>
          <tr>
            <template v-for="(buildingCount, index) in buildingCounts" :key="index">
              <td class="text-center pa-1">
                <div class="d-flex flex-column align-center">
                  <CachedIcon :icon="transportItems[index].icon" :size="32" />
                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ buildingCount }} &times; MK{{ index + 1 }}
                  </div>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
