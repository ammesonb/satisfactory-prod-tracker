<script setup lang="ts">
import { linkToString } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'

const props = defineProps<{
  links: Material[]
}>()

const emit = defineEmits<{
  'update:link-built': [linkId: string, value: boolean]
}>()

const updateLinkBuiltState = (linkId: string, value: boolean) => {
  emit('update:link-built', linkId, value)
}
</script>

<template>
  <div class="recipe-outputs">
    <h4 class="text-h6 mb-3">Outputs</h4>
    <div v-if="props.links.length === 0" class="text-caption text-medium-emphasis">None</div>
    <RecipeLink
      v-for="link in props.links"
      :key="linkToString(link)"
      :link="link"
      type="output"
      @update:built="updateLinkBuiltState"
    />
  </div>
</template>
