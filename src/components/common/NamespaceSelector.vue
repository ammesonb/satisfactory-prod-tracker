<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  hint?: string
  disabled?: boolean
  availableNamespaces?: string[]
}

withDefaults(defineProps<Props>(), {
  label: 'Namespace',
  hint: 'Organize your factories by game, save, or playthrough',
  disabled: false,
  availableNamespaces: () => [],
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

/**
 * Validation rules for Google Drive folder names
 * Based on Google Drive folder name restrictions
 */
const namespaceRules = [
  (v: string) => !!v || 'Namespace is required',
  (v: string) => !['', '.', '..'].includes(v.trim()) || 'Invalid folder name',
  (v: string) => !v.includes('/') || 'Cannot contain forward slash',
  (v: string) => v.trim().length > 0 || 'Cannot be empty or only spaces',
  (v: string) => new Blob([v]).size <= 255 || 'Name too long (max 255 bytes)',
]
</script>

<template>
  <v-combobox
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :items="availableNamespaces"
    :label="label"
    :hint="hint"
    :disabled="disabled"
    :rules="namespaceRules"
    persistent-hint
    clearable
  >
    <template v-slot:prepend>
      <v-icon>mdi-folder</v-icon>
    </template>
  </v-combobox>
</template>
