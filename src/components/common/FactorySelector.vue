<script setup lang="ts">
import { toRefs } from 'vue'
import type { Factory } from '@/types/factory'
import { useSelection } from '@/composables/useSelection'

interface Props {
  factories: Factory[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Select Factories',
})

const selectedFactories = defineModel<string[]>({ default: [] })

const { factories } = toRefs(props)

const { allSelected, someSelected, toggleAll, toggleItem, isSelected } = useSelection({
  items: factories,
  selected: selectedFactories,
  getKey: (factory) => factory.name,
})

const toggleFactory = (factoryName: string) => toggleItem(factoryName)
</script>

<template>
  <div>
    <!-- Select All Checkbox -->
    <v-checkbox
      :model-value="allSelected"
      :indeterminate="someSelected && !allSelected"
      label="Select All"
      @click="toggleAll"
      :hide-details="true"
    />

    <!-- Factory List -->
    <v-card variant="outlined" class="mb-4" max-height="300" style="overflow-y: auto">
      <v-list>
        <v-list-item
          v-for="factory in factories"
          :key="factory.name"
          @click="toggleFactory(factory.name)"
        >
          <template v-slot:prepend>
            <div class="d-flex align-center">
              <v-checkbox
                :model-value="isSelected(factory.name)"
                @click.stop="toggleFactory(factory.name)"
                :hide-details="true"
              />
              <CachedIcon :icon="factory.icon" :size="24" />
            </div>
          </template>
          <v-list-item-title>{{ factory.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>
