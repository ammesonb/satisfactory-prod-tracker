<script setup lang="ts">
import { computed, ref } from 'vue'

import { getStores } from '@/composables/useStores'
import { useLinkData } from '@/composables/useLinkData'
import { useRecipeStatus } from '@/composables/useRecipeStatus'
import type { RecipeNode } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'
import { useTransport } from '@/composables/useTransport'
import { BELT_ITEM_NAMES, isFluid, PIPELINE_ITEM_NAMES } from '@/logistics/constants'

const props = defineProps<{
  link: Material
  recipe: RecipeNode
  direction: 'input' | 'output'
}>()

const { dataStore } = getStores()

const { setLinkBuilt, isLinkBuilt } = useRecipeStatus()

const { materialItem } = useLinkData(
  computed(() => props.link),
  computed(() => props.direction),
)
const { minimumUsableTier } = useTransport(props.recipe, props.link, props.direction)

const built = computed(() => isLinkBuilt(props.link))
const transportIcon = computed(() =>
  dataStore.getIcon(
    isFluid(props.link.material)
      ? PIPELINE_ITEM_NAMES[minimumUsableTier.value]
      : BELT_ITEM_NAMES[minimumUsableTier.value],
  ),
)

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

const amountStyles = computed(() => {
  return {
    'link-amount': true,
    'text-black': built,
    'text-medium-emphasis': !built.value,
  }
})

const isTransportHovered = ref(false)
</script>

<template>
  <v-card class="recipe-link mb-1" hover @click="updateBuiltState(!built)" :class="cardStyles">
    <v-card-text class="pa-2">
      <!-- Row 1: Icon + Material Name -->
      <v-row no-gutters dense>
        <v-col cols="auto" class="pr-2 d-flex justify-center align-center">
          <CachedIcon v-if="materialItem?.icon" :icon="materialItem.icon" :size="32" />
        </v-col>
        <v-col class="d-flex align-center">
          <div class="text-body-2 font-weight-medium" :class="{ 'text-black': built }">
            {{ materialItem?.name || link.material }}
          </div>
        </v-col>
        <v-col cols="auto" class="d-flex justify-end align-center">
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
              :direction="props.direction"
              :is-hovered="isTransportHovered"
            />
          </v-tooltip>
        </v-col>
      </v-row>

      <!-- Row 2: Double Arrow + Total Rate -->
      <v-row no-gutters class="amount-row">
        <v-col cols="auto" class="pr-2 d-flex justify-center align-center" style="width: 48px">
          <span style="font-size: 1.125rem">⇉</span>
        </v-col>
        <v-col class="d-flex align-center">
          <span :class="amountStyles"> Total: {{ link.amount.toFixed(1) }}/min </span>
        </v-col>
      </v-row>

      <!-- Row 3: Single Arrow + Per-Factory Rate -->
      <v-row no-gutters class="amount-row">
        <v-col cols="auto" class="pr-2 d-flex justify-center align-center" style="width: 48px">
          <span style="font-size: 1.125rem">→</span>
        </v-col>
        <v-col class="d-flex align-center">
          <span :class="amountStyles">
            Each: {{ (link.amount / Math.ceil(recipe.recipe.count)).toFixed(1) }}/min
          </span>
        </v-col>
      </v-row>

      <!-- Row 4: Checkbox + Source/Sink -->
      <v-row no-gutters dense>
        <v-col cols="auto" class="pr-2 d-flex justify-center align-center" style="width: 48px">
          <v-checkbox
            :model-value="built"
            @update:model-value="(value: boolean | null) => updateBuiltState(value ?? false)"
            @click.stop
            density="compact"
            hide-details
          />
        </v-col>
        <v-col class="d-flex align-center">
          <RecipeLinkTarget :link="props.link" :direction="props.direction" />
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

.link-amount {
  font-size: 0.875rem;
  font-style: italic;
}

.amount-row {
  min-height: 0;
  margin-top: -0.25rem;
  margin-bottom: -0.5rem;
}
</style>
