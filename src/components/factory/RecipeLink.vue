<script setup lang="ts">
import type { Material } from '@/types/factory'
import type { RecipeNode } from '@/logistics/graph-node'
import { computed, ref } from 'vue'
import { useRecipeStatus } from '@/composables/useRecipeStatus'
import { useLinkData } from '@/composables/useLinkData'

const props = defineProps<{
  link: Material
  recipe: RecipeNode
  type: 'input' | 'output'
}>()

const { setLinkBuilt, isLinkBuilt } = useRecipeStatus()

const { materialItem, transportIcon } = useLinkData(
  computed(() => props.link),
  computed(() => props.type),
)

const built = computed(() => isLinkBuilt(props.link))

const updateBuiltState = (value: boolean) => {
  setLinkBuilt(props.link, value)
}

const cardStyles = computed(() => {
  return {
    'elevation-2': true,
    'bg-green-lighten-4': built,
    'bg-surface': !built.value,
  }
})

const isTransportHovered = ref(false)
</script>

<template>
  <v-card class="recipe-link mb-1" hover @click="updateBuiltState(!built)" :class="cardStyles">
    <v-card-text class="pa-2">
      <!-- Row 1: Icon + Material Name with Amount -->
      <v-row no-gutters class="mb-1">
        <v-col cols="auto" class="pr-2 d-flex justify-center align-center">
          <CachedIcon v-if="materialItem?.icon" :icon="materialItem.icon" :size="32" />
        </v-col>
        <v-col class="d-flex justify-start">
          <div
            class="text-body-2 font-weight-medium d-flex flex-column align-center"
            :class="{ 'text-black': built }"
          >
            {{ materialItem?.name || link.material }}
            <div class="text-caption" :class="built ? 'text-black' : 'text-medium-emphasis'">
              {{ link.amount.toFixed(2) }}/min
            </div>
          </div>
        </v-col>
        <v-col cols="auto" class="d-flex justify-end align-start">
          <v-tooltip
            location="top"
            content-class="pa-0"
            @update:model-value="isTransportHovered = $event"
          >
            <template v-slot:activator="{ props: tooltipProps }">
              <CachedIcon
                :icon="transportIcon"
                :size="24"
                v-bind="tooltipProps"
                style="cursor: help"
              />
            </template>
            <TransportCapacityTooltip
              :recipe="props.recipe"
              :link="props.link"
              :type="props.type"
              :is-hovered="isTransportHovered"
            />
          </v-tooltip>
        </v-col>
      </v-row>

      <!-- Row 2: Checkbox + Source/Sink -->
      <v-row no-gutters>
        <v-col cols="auto" class="pr-2 d-flex justify-center">
          <v-checkbox
            :model-value="built"
            @update:model-value="(value: boolean | null) => updateBuiltState(value ?? false)"
            @click.stop
            density="compact"
            hide-details
          />
        </v-col>
        <v-col class="d-flex align-center">
          <RecipeLinkTarget :link="props.link" :type="props.type" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style lang="css" scoped>
.recipe-link {
  cursor: pointer;
  transition: all 0.2s ease;
}
</style>
