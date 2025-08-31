<script setup lang="ts">
import { ref, computed } from 'vue'
import { refDebounced } from '@vueuse/core'
import { useDataStore } from '@/stores/data'
import { type ItemOption } from '@/types/data'
import CachedIcon from '@/components/common/CachedIcon.vue'

interface Props {
  modelValue?: ItemOption
  placeholder?: string
  disabled?: boolean
  includeBuildings?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search for an item...',
  includeBuildings: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: ItemOption | undefined]
}>()

const dataStore = useDataStore()
const searchInput = ref('')
const debouncedSearch = refDebounced(searchInput, 200)

const updateSearch = (value: string) => {
  searchInput.value = value
}

// Get all available icons from items and buildings
const allItems = computed<ItemOption[]>(() => {
  const items: ItemOption[] = []

  // Add items
  Object.values(dataStore.items).forEach((item) => {
    if (item.icon) {
      items.push({
        value: item.icon,
        name: item.name,
        icon: item.icon,
        type: 'item',
      })
    }
  })

  // Add buildings
  if (props.includeBuildings) {
    Object.values(dataStore.buildings).forEach((building) => {
      if (building.icon) {
        items.push({
          value: building.icon,
          name: building.name,
          icon: building.icon,
          type: 'building',
        })
      }
    })
  }

  return items.sort((a, b) => a.name.localeCompare(b.name))
})

// Performance optimized: only show filtered results, limited count
const filteredItems = computed<ItemOption[]>(() => {
  const query = debouncedSearch.value?.toLowerCase().trim()

  if (!query) {
    // Show only first 20 items when no search to avoid loading all images
    return allItems.value.slice(0, 20)
  }

  // When searching, show up to 50 matching results
  return allItems.value.filter((item) => item.name.toLowerCase().includes(query)).slice(0, 50)
})

// Selected icon for display
const selectedItem = computed<ItemOption | undefined>(() => {
  if (!props.modelValue) return undefined
  return allItems.value.find((item) => item.value === props.modelValue?.value)
})

const updateValue = (value: ItemOption | null) => {
  emit('update:modelValue', value || undefined)
}
</script>

<template>
  <v-autocomplete
    :model-value="props.modelValue"
    @update:model-value="updateValue"
    :search="searchInput"
    @update:search="updateSearch"
    :items="filteredItems"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    item-title="name"
    return-object
    clearable
    hide-details
    variant="outlined"
    autocomplete="off"
    :menu-props="{ closeOnContentClick: true }"
    no-filter
  >
    <!-- Selected icon display -->
    <template #prepend-inner v-if="selectedItem">
      <CachedIcon :icon="selectedItem.icon" :size="24" class="me-2" />
    </template>

    <!-- Dropdown item template -->
    <template #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps">
        <template #prepend>
          <CachedIcon :icon="item.raw.icon" :size="32" :alt="item.raw.name" class="me-3" />
        </template>

        <v-list-item-subtitle class="text-capitalize">{{ item.raw.type }}</v-list-item-subtitle>
      </v-list-item>
    </template>

    <!-- No data message -->
    <template #no-data>
      <div class="px-4 py-2 text-center text-medium-emphasis">
        <div v-if="allItems.length === 0">Loading items...</div>
        <div v-else-if="!searchInput">Start typing to search items...</div>
        <div v-else>No items found for "{{ searchInput }}"</div>
      </div>
    </template>
  </v-autocomplete>
</template>

<style scoped>
.icon-image {
  border-radius: 4px;
  object-fit: contain;
  /* Force browser to cache images more aggressively */
  image-rendering: auto;
}
</style>
