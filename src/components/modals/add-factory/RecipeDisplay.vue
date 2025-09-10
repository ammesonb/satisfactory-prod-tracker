<script setup lang="ts">
import { type RecipeEntry } from '@/types/factory'

interface Props {
  recipes: RecipeEntry[]
}

defineProps<Props>()
const emit = defineEmits<{
  remove: [index: number]
}>()

const removeRecipe = (index: number) => {
  emit('remove', index)
}
</script>

<template>
  <div v-if="recipes.length > 0" class="recipe-display">
    <v-divider class="mb-3" />
    <h4 class="text-subtitle-2 mb-3">Selected Recipes</h4>

    <div class="recipe-entries">
      <v-card
        v-for="(entry, index) in recipes"
        :key="`${entry.recipe}-${entry.building}-${index}`"
        variant="outlined"
        class="mb-2"
      >
        <v-card-text>
          <RecipeListItem
            :entry="entry"
            :row-number="index + 1"
            @remove="removeRecipe(index)"
          />
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.recipe-entries {
  max-height: 300px;
  overflow-y: auto;
}
</style>
