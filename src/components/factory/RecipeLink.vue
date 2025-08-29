<script setup lang="ts">
import type { Material } from '@/types/factory'
import { linkToString } from '@/logistics/graph-node'
import { useDataStore } from '@/stores/data'
import { computed } from 'vue'
import CachedIcon from '@/components/common/CachedIcon.vue'

const props = defineProps<{
  link: Material
  type: 'input' | 'output'
}>()

const emit = defineEmits<{
  'update:built': [linkId: string, value: boolean]
}>()

const data = useDataStore()

const linkId = computed(() => linkToString(props.link))
const materialItem = computed(() => data.items[props.link.material])
const sourceOrSink = computed(() => (props.type === 'input' ? props.link.source : props.link.sink))
const isRecipe = computed(() => sourceOrSink.value in data.recipes)
const displayName = computed(() =>
  isRecipe.value
    ? data.getRecipeDisplayName(sourceOrSink.value)
    : data.getItemDisplayName(sourceOrSink.value) + ' (Resource)',
)

const updateBuiltState = (value: boolean) => {
  emit('update:built', linkId.value, value)
}
</script>

<template>
  <v-card class="mb-2">
    <v-card-text class="pa-2">
      <div class="d-flex align-center gap-2">
        <v-checkbox
          :model-value="false"
          @update:model-value="(value: boolean | null) => updateBuiltState(value ?? false)"
          density="compact"
          hide-details
        />
        <CachedIcon v-if="materialItem?.icon" :icon="materialItem.icon" :size="20" />
        <div class="flex-grow-1">
          <div class="text-body-2 font-weight-medium">
            {{ materialItem?.name || link.material }}
          </div>
          <div class="text-caption text-medium-emphasis">{{ link.amount.toFixed(2) }}/min</div>
        </div>
      </div>
      <div class="text-caption text-medium-emphasis mt-1">
        {{ type === 'input' ? 'from' : 'to' }} {{ displayName }}
      </div>
    </v-card-text>
  </v-card>
</template>
