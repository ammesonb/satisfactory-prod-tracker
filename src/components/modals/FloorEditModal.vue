<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFactoryStore } from '@/stores/factory'
import { useDataStore } from '@/stores/data'
import { type ItemOption } from '@/types/data'

interface Props {
  show: boolean
  factoryName: string
  floorIndices: number[]
}

interface FloorFormData {
  index: number
  name: string | undefined
  item: ItemOption | undefined
  originalName: string | undefined
  originalItem: ItemOption | undefined
}

const props = defineProps<Props>()
const emit = defineEmits(['update:show'])

const dataStore = useDataStore()
const factoryStore = useFactoryStore()

const showDialog = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const floorForms = ref<FloorFormData[]>([])

// Initialize form data when props change
watch(
  () => [props.floorIndices, props.factoryName],
  () => {
    if (props.factoryName && props.floorIndices.length > 0) {
      const factory = factoryStore.factories[props.factoryName]
      if (factory) {
        floorForms.value = props.floorIndices.map((index) => {
          const floor = factory.floors[index]
          // Construct a fake item option with just the image
          const itemOption = floor?.iconItem
            ? {
                value: floor.iconItem,
                name: dataStore.getItemDisplayName(floor.iconItem),
                icon: dataStore.getIcon(floor.iconItem),
                type: 'item' as const,
              }
            : undefined

          return {
            index,
            name: floor?.name,
            item: itemOption,
            originalName: floor?.name,
            originalItem: itemOption,
          }
        })
      }
    }
  },
  { immediate: true },
)

const hasChanges = computed(() => {
  return floorForms.value.some(
    (form) => form.name !== form.originalName || form.item?.value !== form.originalItem?.value,
  )
})

const clear = () => {
  floorForms.value = []
  showDialog.value = false
}

const saveChanges = () => {
  if (!props.factoryName || !hasChanges.value) return

  const updates = floorForms.value
    .filter(
      (form) => form.name !== form.originalName || form.item?.value !== form.originalItem?.value,
    )
    .map((form) => ({
      index: form.index,
      name: form.name,
      iconItem: form.item?.value,
    }))

  if (updates.length > 0) {
    factoryStore.updateFloors(props.factoryName, updates)
  }

  clear()
}
</script>

<template>
  <v-dialog v-model="showDialog" max-width="600px">
    <v-card>
      <v-card-title> Edit Floor{{ floorForms.length > 1 ? 's' : '' }} </v-card-title>
      <v-card-text>
        <v-form v-if="floorForms.length > 0">
          <v-card
            v-for="form in floorForms"
            :key="form.index"
            class="mb-4"
            variant="tonal"
            elevation="0"
          >
            <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
              {{
                factoryStore.getFloorDisplayName(form.index + 1, {
                  name: form.originalName,
                  iconItem: form.originalItem?.value,
                  recipes: [],
                })
              }}
            </v-card-title>

            <v-card-text class="pt-0">
              <v-text-field
                v-model="form.name"
                label="Floor name"
                variant="filled"
                density="compact"
                class="mb-3"
                placeholder="Enter floor name (optional)"
                clearable
              />

              <ItemSelector v-model="form.item" placeholder="Search for a floor icon..." />
            </v-card-text>
          </v-card>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="tonal" @click="clear">Cancel</v-btn>
        <v-btn color="secondary" variant="elevated" @click="saveChanges" :disabled="!hasChanges">
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
