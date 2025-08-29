<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFactoryStore } from '@/stores/factory'
import IconSelector from '@/components/IconSelector.vue'

interface Props {
  show: boolean
  factoryName: string
  floorIndices: number[]
}

interface FloorFormData {
  index: number
  name: string | undefined
  icon: string | undefined
  originalName: string | undefined
  originalIcon: string | undefined
}

const props = defineProps<Props>()
const emit = defineEmits(['update:show'])

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
          return {
            index,
            name: floor?.name,
            icon: floor?.icon,
            originalName: floor?.name,
            originalIcon: floor?.icon,
          }
        })
      }
    }
  },
  { immediate: true },
)

const hasChanges = computed(() => {
  return floorForms.value.some(
    (form) => form.name !== form.originalName || form.icon !== form.originalIcon,
  )
})

const clear = () => {
  floorForms.value = []
  showDialog.value = false
}

const saveChanges = () => {
  if (!props.factoryName || !hasChanges.value) return

  const updates = floorForms.value
    .filter((form) => form.name !== form.originalName || form.icon !== form.originalIcon)
    .map((form) => ({
      index: form.index,
      name: form.name,
      icon: form.icon,
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
          <div v-for="(form, idx) in floorForms" :key="form.index" class="mb-6">
            <h3 class="text-subtitle-1 font-weight-medium mb-3">
              {{
                factoryStore.getFloorDisplayName(form.index + 1, {
                  name: form.originalName,
                  icon: form.originalIcon,
                  recipes: [],
                })
              }}
            </h3>

            <v-text-field
              v-model="form.name"
              label="Floor name"
              variant="outlined"
              density="compact"
              class="mb-3"
              placeholder="Enter floor name (optional)"
              clearable
            />

            <IconSelector
              v-model="form.icon"
              placeholder="Search for a floor icon..."
              class="mb-4"
            />

            <v-divider v-if="idx < floorForms.length - 1" class="mt-4" />
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="tonal" @click="clear">Cancel</v-btn>
        <v-btn color="green" variant="elevated" @click="saveChanges" :disabled="!hasChanges">
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
