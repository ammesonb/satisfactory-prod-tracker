<script setup lang="ts">
import { getDataStore } from '@/composables/useStores'
import { getItemDetails } from '@/utils/items'

const props = defineProps<{
  item: string
  amount: number
}>()

const emit = defineEmits<{
  remove: []
}>()

const dataStore = getDataStore()
const { displayName: itemName, icon } = getItemDetails(dataStore, props.item)
</script>
<template>
  <v-chip
    :key="props.item"
    size="large"
    variant="outlined"
    closable
    @click:close="emit('remove')"
    class="external-input-chip"
  >
    <template #prepend>
      <CachedIcon :icon="icon" :size="20" class="me-2" />
    </template>

    {{ itemName }}

    <v-badge :content="props.amount" color="primary" inline class="ml-2" />
  </v-chip>
</template>
