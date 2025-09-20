<script setup lang="ts">
import { linkToString, type RecipeNode } from '@/logistics/graph-node'

const props = defineProps<{
  recipe: RecipeNode
}>()
</script>

<template>
  <div class="recipe-inputs">
    <h4 class="text-h6 mb-3">Inputs</h4>
    <div v-if="props.recipe.inputs.length === 0" class="text-caption text-medium-emphasis">
      None
    </div>
    <RecipeLink
      v-for="link in props.recipe.inputs"
      :key="linkToString(link)"
      :link="link"
      :recipe="props.recipe"
      direction="input"
    />
  </div>
</template>
