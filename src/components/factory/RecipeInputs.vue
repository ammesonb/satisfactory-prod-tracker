<script setup lang="ts">
import { linkToString, type RecipeNode } from '@/logistics/graph-node'
import type { Material } from '@/types/factory'

const props = defineProps<{
  links: Material[]
  recipe: RecipeNode
}>()
</script>

<template>
  <div class="recipe-inputs">
    <h4 class="text-h6 mb-3">Inputs</h4>
    <div v-if="props.links.length === 0" class="text-caption text-medium-emphasis">None</div>
    <RecipeLink
      v-for="link in props.links"
      :key="linkToString(link)"
      :link="link"
      :recipe="props.recipe"
      type="input"
    />
  </div>
</template>
