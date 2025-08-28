<script setup lang="ts">
import { ref, computed } from 'vue'
import IconSelector from '@/components/IconSelector.vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'add-factory'])

const form = ref({
  name: '',
  icon: undefined as string | undefined,
  recipes: '',
})

const showDialog = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const clear = () => {
  form.value = { name: '', icon: undefined, recipes: '' }
  showDialog.value = false
}

const addFactory = () => {
  if (form.value.name && form.value.recipes && form.value.icon) {
    emit('add-factory', { ...form.value })
    clear()
  }
}
</script>

<template>
  <v-dialog v-model="showDialog" max-width="600px">
    <v-card>
      <v-card-title>Add a new factory</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="form.name"
            label="Factory name"
            required
            variant="outlined"
            class="mb-4"
          />
          <IconSelector
            v-model="form.icon"
            placeholder="Search for a factory icon..."
            class="mb-4"
          />
          <v-textarea
            v-model="form.recipes"
            label="Recipes"
            placeholder="Enter recipes, one per line"
            rows="8"
            variant="outlined"
            required
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="tonal" @click="clear">Cancel</v-btn>
        <v-btn
          color="green"
          variant="elevated"
          @click="addFactory"
          :disabled="!form.name || !form.recipes || !form.icon"
        >
          Add Factory
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
