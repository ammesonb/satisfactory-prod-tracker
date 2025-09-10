<script setup lang="ts">
import { toRef } from 'vue'
import type { ItemOption } from '@/types/data'
import type { SearchOptions } from '@/types/ui'
import { useDataSearch } from '@/composables/useDataSearch'
import type { VAutocomplete } from 'vuetify/components'

interface IconConfig {
  showIcons?: boolean
  dropdownIconSize?: number
  selectedIconSize?: number
}

interface DisplayConfig {
  showType?: boolean
  variant?: VAutocomplete['variant']
  density?: VAutocomplete['density']
  placeholder?: string
  hideDetails?: boolean
  label?: string
}

interface Props {
  modelValue?: ItemOption
  items: ItemOption[]
  disabled?: boolean
  clearable?: boolean
  class?: string
  searchOptions?: SearchOptions
  iconConfig: IconConfig
  displayConfig: DisplayConfig
}

const props = withDefaults(defineProps<Props>(), {
  clearable: true,
  searchOptions: () => ({}),
  iconConfig: () => ({
    showIcons: true,
    dropdownIconSize: 32,
    selectedIconSize: 24,
  }),
  displayConfig: () => ({
    showType: false,
    variant: 'outlined',
    density: 'default',
    placeholder: 'Search...',
    hideDetails: true,
  }),
})

const emit = defineEmits<{
  'update:modelValue': [value: ItemOption | undefined]
}>()

const { searchInput, filteredItems, updateSearch } = useDataSearch(
  toRef(props, 'items'),
  props.searchOptions,
)

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
    :placeholder="props.displayConfig.placeholder"
    :disabled="props.disabled"
    item-title="name"
    item-value="value"
    :return-object="true"
    :clearable="props.clearable"
    :hide-details="props.displayConfig.hideDetails"
    :variant="props.displayConfig.variant"
    :density="props.displayConfig.density"
    :class="props.class"
    :label="props.displayConfig.label"
    autocomplete="off"
    :menu-props="{ closeOnContentClick: true }"
    no-filter
  >
    <!-- Selected icon display -->
    <template #prepend-inner v-if="props.iconConfig.showIcons && props.modelValue?.icon">
      <CachedIcon
        :icon="props.modelValue.icon"
        :size="props.iconConfig.selectedIconSize"
        class="me-2"
      />
    </template>

    <!-- Dropdown item template -->
    <template #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps">
        <template #prepend v-if="props.iconConfig.showIcons && item.raw.icon">
          <CachedIcon
            :icon="item.raw.icon"
            :size="props.iconConfig.dropdownIconSize"
            class="me-3"
          />
        </template>
        <template #append v-if="props.displayConfig.showType && item.raw.type">
          <v-chip size="x-small" variant="outlined" class="text-capitalize">
            {{ item.raw.type }}
          </v-chip>
        </template>
      </v-list-item>
    </template>

    <!-- No data message -->
    <template #no-data>
      <div class="px-4 py-2 text-center text-medium-emphasis">
        <div v-if="props.items.length === 0">Loading...</div>
        <div v-else-if="!searchInput">Start typing to search...</div>
        <div v-else>No items found for "{{ searchInput }}"</div>
      </div>
    </template>

    <!-- Pass through any additional slots, excluding the ones we define -->
    <template v-for="(_, slot) in $slots" v-slot:[slot]="slotProps" :key="slot">
      <slot
        v-if="!['prepend-inner', 'item', 'no-data'].includes(slot.toString())"
        :name="slot"
        v-bind="slotProps"
      />
    </template>
  </v-autocomplete>
</template>
