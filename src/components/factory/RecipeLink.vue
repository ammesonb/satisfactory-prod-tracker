<script setup lang="ts">
import type { Material } from '@/types/factory'
import { linkToString } from '@/logistics/graph-node'
import { getIconURL } from '@/logistics/images'
import { useDataStore } from '@/stores/data'
import { computed } from 'vue'

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

const updateBuiltState = (value: boolean) => {
  emit('update:built', linkId.value, value)
}
</script>

<template>
  <v-card variant="outlined" class="mb-2">
    <v-card-text class="pa-2">
      <div class="d-flex align-center gap-2">
        <v-checkbox
          :model-value="false"
          @update:model-value="updateBuiltState"
          density="compact"
          hide-details
        />
        <v-img
          v-if="materialItem?.icon"
          :src="getIconURL(materialItem.icon, 64)"
          :width="20"
          :height="20"
        />
        <div class="flex-grow-1">
          <div class="text-body-2 font-weight-medium">
            {{ materialItem?.name || link.material }}
          </div>
          <div class="text-caption text-medium-emphasis">{{ link.amount.toFixed(2) }}/min</div>
        </div>
      </div>
      <div class="text-caption text-medium-emphasis mt-1">
        {{ type === 'input' ? 'from' : 'to' }} {{ sourceOrSink }}
      </div>
    </v-card-text>
  </v-card>
</template>
