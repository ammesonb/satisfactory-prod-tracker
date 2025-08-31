<script setup lang="ts">
import { computed } from 'vue'
import type { Factory } from '@/types/factory'

interface Props {
  factories: Factory[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Select Factories',
})

const selectedFactories = defineModel<string[]>({ default: [] })

const selectedSet = computed(() => new Set(selectedFactories.value))

const allSelected = computed(
  () => selectedSet.value.size === props.factories.length && props.factories.length > 0,
)

const someSelected = computed(() => selectedSet.value.size > 0)

const toggleAll = () => {
  if (allSelected.value) {
    selectedFactories.value = []
  } else {
    selectedFactories.value = props.factories.map((f) => f.name)
  }
}

const toggleFactory = (factoryName: string) => {
  if (selectedSet.value.has(factoryName)) {
    selectedFactories.value = selectedFactories.value.filter((name) => name !== factoryName)
  } else {
    selectedFactories.value = [...selectedFactories.value, factoryName]
  }
}
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
                :model-value="selectedSet.has(factory.name)"
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
