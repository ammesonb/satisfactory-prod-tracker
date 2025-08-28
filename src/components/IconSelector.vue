<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDataStore } from '@/stores/data'
import { getIconURL } from '@/logistics/images'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
}

interface IconOption {
  value: string
  name: string
  icon: string
  type: 'item' | 'building'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search for an icon...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const dataStore = useDataStore()

// Load data when component mounts
onMounted(() => {
  dataStore.loadData()
})

// Get all available icons from items and buildings
const allIcons = computed<IconOption[]>(() => {
  const icons: IconOption[] = []

  // Add items
  Object.values(dataStore.items).forEach((item) => {
    if (item.icon) {
      icons.push({
        value: item.icon,
        name: item.name,
        icon: item.icon,
        type: 'item',
      })
    }
  })

  // Add buildings
  Object.values(dataStore.buildings).forEach((building) => {
    if (building.icon) {
      icons.push({
        value: building.icon,
        name: building.name,
        icon: building.icon,
        type: 'building',
      })
    }
  })

  return icons.sort((a, b) => a.name.localeCompare(b.name))
})

// Selected icon for display
const selectedIcon = computed<IconOption | undefined>(() => {
  if (!props.modelValue) return undefined
  return allIcons.value.find((icon) => icon.value === props.modelValue)
})

const updateValue = (value: string | null) => {
  emit('update:modelValue', value || undefined)
}
</script>

<template>
  <v-autocomplete
    :model-value="props.modelValue"
    @update:model-value="updateValue"
    :items="allIcons"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    item-title="name"
    item-value="value"
    clearable
    hide-details
    variant="outlined"
  >
    <!-- Selected icon display -->
    <template #prepend-inner v-if="selectedIcon">
      <v-img :src="getIconURL(selectedIcon.icon, 64)" width="24" height="24" class="me-2" />
    </template>

    <!-- Dropdown item template -->
    <template #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps">
        <template #prepend>
          <v-img :src="getIconURL(item.raw.icon, 64)" width="32" height="32" class="me-3" />
        </template>

        <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
        <v-list-item-subtitle class="text-capitalize">{{ item.raw.type }}</v-list-item-subtitle>
      </v-list-item>
    </template>

    <!-- No data message -->
    <template #no-data>
      <div class="px-4 py-2 text-center text-medium-emphasis">
        <div v-if="allIcons.length === 0">Loading icons...</div>
        <div v-else>No icons found</div>
      </div>
    </template>
  </v-autocomplete>
</template>
