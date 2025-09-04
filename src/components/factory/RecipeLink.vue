<script setup lang="ts">
import type { Material } from '@/types/factory'
import { linkToString, type RecipeNode } from '@/logistics/graph-node'
import { getStores } from '@/composables/useStores'
import { useFloorNavigation, formatRecipeId } from '@/composables/useFloorNavigation'
import {
  isFluid,
  BELT_ITEM_NAMES,
  PIPELINE_ITEM_NAMES,
  EXTERNAL_RECIPE,
} from '@/logistics/constants'
import { computed, ref } from 'vue'

const props = defineProps<{
  link: Material
  recipe: RecipeNode
  type: 'input' | 'output'
}>()

const { dataStore: data, factoryStore } = getStores()
const { navigateToElement } = useFloorNavigation()

const linkId = computed(() => linkToString(props.link))
const materialItem = computed(() => data.items[props.link.material])
const sourceOrSink = computed(() => (props.type === 'input' ? props.link.source : props.link.sink))
const isRecipe = computed(() => sourceOrSink.value in data.recipes)
const displayName = computed(() =>
  isRecipe.value
    ? data.getRecipeDisplayName(sourceOrSink.value)
    : data.getItemDisplayName(sourceOrSink.value) +
      (props.link.source === EXTERNAL_RECIPE
        ? ''
        : props.type === 'input'
          ? ' (Resource)'
          : 'Surplus'),
)
const targetRecipe = computed(() =>
  isRecipe.value ? factoryStore.getRecipeByName(sourceOrSink.value) : null,
)

const built = computed(() => factoryStore.currentFactory?.recipeLinks[linkId.value] ?? false)

const updateBuiltState = (value: boolean) => {
  factoryStore.setLinkBuiltState(linkId.value, value)
}

const navigateToRecipe = () => {
  if (targetRecipe.value?.batchNumber !== undefined) {
    const recipeId = formatRecipeId(targetRecipe.value.batchNumber, targetRecipe.value.recipe.name)
    navigateToElement(recipeId)
  }
}

const transportIcon = computed(() => {
  const transport = isFluid(props.link.material) ? PIPELINE_ITEM_NAMES[0] : BELT_ITEM_NAMES[0]
  return data.buildings[transport]?.icon ?? ''
})

const isTransportHovered = ref(false)
</script>

<template>
  <v-card
    class="mb-1"
    hover
    @click="updateBuiltState(!built)"
    style="cursor: pointer; transition: all 0.2s ease"
    :class="{
      'elevation-2': true,
      'bg-green-lighten-4': built,
      'bg-surface': !built,
    }"
  >
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
          <div class="text-caption" :class="built ? 'text-black' : 'text-medium-emphasis'">
            {{ type === 'input' ? 'from' : sourceOrSink.length > 0 ? 'to' : '' }}
            <span
              v-if="isRecipe"
              @click.prevent.stop="navigateToRecipe"
              class="text-decoration-underline px-1 py-1"
              style="cursor: pointer; margin: -4px; border-radius: 4px"
              @mouseenter="
                ($event.target as HTMLElement).style.backgroundColor =
                  'rgba(var(--v-theme-on-surface), 0.1)'
              "
              @mouseleave="($event.target as HTMLElement).style.backgroundColor = 'transparent'"
            >
              {{ displayName }}
            </span>
            <span v-else>{{ displayName }}</span>
            <span v-if="isRecipe">&nbsp;(Floor {{ targetRecipe?.batchNumber! + 1 }})</span>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
