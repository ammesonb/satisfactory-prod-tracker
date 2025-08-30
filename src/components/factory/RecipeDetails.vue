<script setup lang="ts">
import { computed } from 'vue'
import { type RecipeNode } from '@/logistics/graph-node'
import { getIconURL } from '@/logistics/images'
import { useDataStore } from '@/stores/data'

const props = defineProps<{
  recipe: RecipeNode
}>()

const data = useDataStore()

const ingredients = computed(() => data.recipeIngredients(props.recipe.recipe.name))
const products = computed(() => data.recipeProducts(props.recipe.recipe.name))
const craftTime = computed(() => data.recipes[props.recipe.recipe.name].time)
</script>

<template>
  <v-card class="recipe-details pa-3" color="surface" variant="elevated">
    <div class="d-flex align-center gap-3 mb-3">
      <v-icon size="small" icon="mdi-clock-outline" color="primary" class="mr-2" />
      <span class="text-body-2 font-weight-medium text-on-surface">Craft Time</span>
      <v-spacer />
      <v-chip size="small" color="primary" class="text-caption">{{ craftTime.toFixed(1) }}s</v-chip>
    </div>

    <div class="mb-3" v-if="ingredients.length > 0">
      <h4 class="text-caption text-uppercase font-weight-bold mb-2 text-primary">Ingredients</h4>
      <div
        v-for="ingredient in ingredients"
        :key="ingredient.item"
        class="d-flex align-center gap-3 mb-1"
      >
        <img
          :src="getIconURL(data.getIcon(ingredient.item), 64)"
          :alt="ingredient.item"
          class="icon-small mr-1"
        />
        <span class="text-body-2 text-on-surface mr-2">{{
          data.getItemDisplayName(ingredient.item)
        }}</span>
        <v-spacer />
        <v-chip size="small" color="orange" class="text-caption"
          >{{ ingredient.amount.toFixed(1) }}/min</v-chip
        >
      </div>
    </div>

    <div v-if="products.length > 0">
      <h4 class="text-caption text-uppercase font-weight-bold mb-2 text-primary">Products</h4>
      <div v-for="product in products" :key="product.item" class="d-flex align-center gap-3 mb-1">
        <img
          :src="getIconURL(data.getIcon(product.item), 64)"
          :alt="product.item"
          class="icon-small mr-1"
        />
        <span class="text-body-2 text-on-surface mr-2">{{
          data.getItemDisplayName(product.item)
        }}</span>
        <v-spacer />
        <v-chip size="small" color="green" class="text-caption"
          >{{ product.amount.toFixed(1) }}/min</v-chip
        >
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.recipe-details {
  min-width: 150px;
  max-width: 500px;
}

.icon-small {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
</style>
