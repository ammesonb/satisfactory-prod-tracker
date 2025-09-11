<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFloorManagement, type FloorFormData } from '@/composables/useFloorManagement'

const {
  getFloorDisplayName,
  updateFloorsFromForms,
  showFloorEditor,
  closeFloorEditor,
  getFloorFormsTemplate,
  hasFloorFormChanges,
} = useFloorManagement()

const floorForms = ref<FloorFormData[]>([])

// Initialize form data when modal opens
watch(
  () => showFloorEditor.value,
  (isOpen) => {
    if (isOpen) {
      floorForms.value = getFloorFormsTemplate()
    }
  },
)

const hasChanges = computed(() => hasFloorFormChanges(floorForms.value))

const clear = () => {
  floorForms.value = []
  closeFloorEditor()
}

const saveChanges = () => {
  updateFloorsFromForms(floorForms.value)
  clear()
}
</script>

<template>
  <v-dialog v-model="showFloorEditor" max-width="600px">
    <v-card class="d-flex flex-column" style="height: 80vh">
      <v-card-title> Edit Floor{{ floorForms.length > 1 ? 's' : '' }} </v-card-title>
      <v-card-text class="flex-grow-1 overflow-y-auto">
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
                getFloorDisplayName(form.index + 1, {
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
      <v-card-actions class="flex-shrink-0">
        <v-spacer />
        <v-btn variant="tonal" @click="clear">Cancel</v-btn>
        <v-btn color="secondary" variant="elevated" @click="saveChanges" :disabled="!hasChanges">
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
