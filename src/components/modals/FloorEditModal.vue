<script setup lang="ts">
import { computed, ref, watch, h } from 'vue'

import { useFloorManagement, type FloorFormData } from '@/composables/useFloorManagement'
import { getStores } from '@/composables/useStores'

const { errorStore } = getStores()

const {
  getFloorDisplayName,
  updateFloorsFromForms,
  showFloorEditor,
  closeFloorEditor,
  editFloorIndex,
  getFloorFormsTemplate,
  hasFloorFormChanges,
  canRemoveFloor,
  removeFloor,
  insertFloor,
} = useFloorManagement()

const floorForms = ref<FloorFormData[]>([])

// Track if we're in "Edit All" mode (editFloorIndex is null) vs single floor mode
const isEditAllMode = computed(() => editFloorIndex.value === null)

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

const handleDeleteFloor = (floorIndex: number) => {
  try {
    removeFloor(floorIndex)

    // If in single floor mode, close the modal since the floor no longer exists
    if (!isEditAllMode.value) {
      clear()
    } else {
      // In Edit All mode, refresh the forms after deletion
      floorForms.value = getFloorFormsTemplate()
    }
  } catch (error) {
    errorStore
      .error()
      .title('Cannot Delete Floor')
      .body(() =>
        h(
          'p',
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while deleting the floor',
        ),
      )
      .show()
  }
}

const handleInsertFloor = (atIndex: number) => {
  insertFloor(atIndex)
  // Refresh the forms after insertion
  floorForms.value = getFloorFormsTemplate()
}
</script>

<template>
  <v-dialog v-model="showFloorEditor" max-width="600px">
    <v-card class="d-flex flex-column" style="height: 80vh">
      <v-card-title> Edit Floor{{ floorForms.length > 1 ? 's' : '' }} </v-card-title>
      <v-card-text class="flex-grow-1 overflow-y-auto">
        <v-form v-if="floorForms.length > 0">
          <!-- Insert floor button at beginning (only in Edit All mode) -->
          <v-btn
            v-if="isEditAllMode"
            variant="text"
            color="primary"
            prepend-icon="mdi-plus"
            class="mb-2"
            block
            @click="handleInsertFloor(0)"
          >
            Insert Floor at Beginning
          </v-btn>

          <template v-for="(form, idx) in floorForms" :key="form.index">
            <v-card class="mb-2" variant="tonal" elevation="0">
              <v-card-title class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
                <span class="flex-grow-1">
                  {{
                    getFloorDisplayName(form.index + 1, {
                      name: form.originalName,
                      iconItem: form.originalItem?.value,
                      recipes: [],
                    })
                  }}
                </span>
                <v-tooltip
                  :text="
                    canRemoveFloor(form.index)
                      ? 'Delete this floor'
                      : 'Floor must be empty to delete'
                  "
                  location="top"
                >
                  <template v-slot:activator="{ props: tooltipProps }">
                    <span v-bind="tooltipProps">
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        variant="text"
                        color="error"
                        :disabled="!canRemoveFloor(form.index)"
                        @click="handleDeleteFloor(form.index)"
                      />
                    </span>
                  </template>
                </v-tooltip>
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

            <!-- Insert floor button between floors (only in Edit All mode) -->
            <v-btn
              v-if="isEditAllMode"
              variant="text"
              color="primary"
              prepend-icon="mdi-plus"
              class="mb-2"
              block
              @click="handleInsertFloor(idx + 1)"
            >
              Insert Floor
            </v-btn>
          </template>
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
