<script setup lang="ts">
import { computed } from 'vue'

import { getStores } from '@/composables/useStores'
import { type RecipeEntry } from '@/types/factory'

interface Props {
  entry: RecipeEntry
  rowNumber: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  remove: []
}>()

const { dataStore } = getStores()

const recipeIcon = computed(() => dataStore.getIcon(props.entry.recipe))
const recipeName = computed(() => dataStore.getRecipeDisplayName(props.entry.recipe))
const buildingName = computed(() => dataStore.getBuildingDisplayName(props.entry.building))
</script>

<template>
  <div class="d-flex align-center py-3">
    <div class="d-flex flex-row align-center mr-3">
      <CachedIcon :icon="recipeIcon" :size="32" class="mr-2" />
      <div class="d-flex flex-column text-body-2 font-weight-medium">
        {{ props.rowNumber }}. {{ recipeName }}
        <div class="d-flex flex-row align-center justify-start text-caption text-medium-emphasis">
          <CachedIcon v-if="props.entry.icon" :icon="props.entry.icon" :size="24" class="mr-1" />
          {{ props.entry.count }}x {{ buildingName }}
        </div>
      </div>
    </div>

    <v-spacer />

    <v-btn
      @click="emit('remove')"
      icon="mdi-delete"
      size="small"
      variant="text"
      color="error"
      :aria-label="`Remove ${recipeName}`"
    />
  </div>
</template>

<style scoped>
.text-caption :deep(.cached-icon),
.text-caption :deep(.v-img),
.text-caption :deep(.v-responsive) {
  max-width: 24px !important;
  width: 24px !important;
  flex: none !important;
}
</style>
