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
      <!-- Row 1: Icon + Material Name with Amount -->
      <v-row no-gutters>
        <v-col cols="auto" class="pr-2 d-flex justify-center align-center">
          <CachedIcon v-if="materialItem?.icon" :icon="materialItem.icon" :size="32" />
        </v-col>
        <v-col class="d-flex justify-start">
          <div class="text-body-2 font-weight-medium d-flex flex-column align-center">
            {{ materialItem?.name || link.material }}
            <div class="text-caption text-medium-emphasis">{{ link.amount.toFixed(2) }}/min</div>
          </div>
        </v-col>
      </v-row>

      <!-- Row 2: Checkbox + Source/Sink -->
      <v-row no-gutters>
        <v-col cols="auto" class="pr-2 d-flex justify-center">
          <v-checkbox
            :model-value="false"
            @update:model-value="(value: boolean | null) => updateBuiltState(value ?? false)"
            density="compact"
            hide-details
          />
        </v-col>
        <v-col class="d-flex align-center">
          <div class="text-caption text-medium-emphasis">
            {{ type === 'input' ? 'from' : 'to' }} {{ displayName }}
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
