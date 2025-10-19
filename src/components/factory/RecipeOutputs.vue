<script setup lang="ts">
import { computed } from 'vue'

import { useRecipeStatus } from '@/composables/useRecipeStatus'
import { linkToString, type RecipeNode } from '@/logistics/graph-node'

const props = defineProps<{
  recipe: RecipeNode
}>()

const { leftoverProductsAsLinks } = useRecipeStatus()

const links = computed(() => [...props.recipe.outputs, ...leftoverProductsAsLinks(props.recipe)])
</script>

<template>
  <div class="recipe-outputs">
    <h4 class="text-h6 mb-3">Outputs</h4>
    <div v-if="links.length === 0" class="text-caption text-medium-emphasis">None</div>
    <RecipeLink
      v-for="link in links"
      :key="linkToString(link)"
      :link="link"
      :recipe="props.recipe"
      direction="output"
    />
  </div>
</template>
