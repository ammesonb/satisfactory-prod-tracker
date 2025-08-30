<script setup lang="ts">
import type { Material } from '@/types/factory'
import { linkToString } from '@/logistics/graph-node'
import { useDataStore } from '@/stores/data'
import { useFactoryStore } from '@/stores/factory'
import { useFloorNavigation, formatRecipeId } from '@/composables/useFloorNavigation'
import { computed } from 'vue'
import CachedIcon from '@/components/common/CachedIcon.vue'

const props = defineProps<{
  link: Material
  type: 'input' | 'output'
}>()

const data = useDataStore()
const factoryStore = useFactoryStore()
const { navigateToElement } = useFloorNavigation()

const linkId = computed(() => linkToString(props.link))
const materialItem = computed(() => data.items[props.link.material])
const sourceOrSink = computed(() => (props.type === 'input' ? props.link.source : props.link.sink))
const isRecipe = computed(() => sourceOrSink.value in data.recipes)
const displayName = computed(() =>
  isRecipe.value
    ? data.getRecipeDisplayName(sourceOrSink.value)
    : data.getItemDisplayName(sourceOrSink.value) +
      (props.type === 'input' ? ' (Resource)' : 'Surplus'),
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
