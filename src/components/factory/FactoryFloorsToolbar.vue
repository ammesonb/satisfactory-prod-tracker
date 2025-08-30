<script setup lang="ts">
import { useFactoryStore } from '@/stores/factory'
import { useFloorNavigation } from '@/composables/useFloorNavigation'

const emit = defineEmits<{
  'edit-all-floors': []
}>()

const factoryStore = useFactoryStore()
const { expandFloor, collapseFloor } = useFloorNavigation()

const updateRecipeExpandedStates = (isComplete: boolean, expanded: boolean) => {
  if (!factoryStore.currentFactory) return

  for (const floor of factoryStore.currentFactory.floors) {
    for (const recipe of floor.recipes) {
      // only change state of the requested complete/incomplete recipes
      if (factoryStore.recipeComplete(recipe) === isComplete) {
        recipe.expanded = expanded
      }
    }

    const anyExpanded = floor.recipes.some((r) => r.expanded)
    // if expanding recipes and any are expanded on this floor, then make sure the floor is visible
    if (expanded && anyExpanded) expandFloor(floor.recipes[0].batchNumber!)
    // otherwise if hiding and no recipes are expanded, then collapse the whole floor
    else if (!expanded && !anyExpanded) collapseFloor(floor.recipes[0].batchNumber!)
  }
}

const showCompleteRecipes = () => updateRecipeExpandedStates(true, true)
const hideCompleteRecipes = () => updateRecipeExpandedStates(true, false)
const showIncompleteRecipes = () => updateRecipeExpandedStates(false, true)
const hideIncompleteRecipes = () => updateRecipeExpandedStates(false, false)
</script>

<template>
  <v-card class="mb-4" color="transparent" elevation="0">
    <v-card-text class="d-flex align-center py-2">
      <v-spacer />

      <!-- Complete Recipes Menu -->
      <v-menu open-on-hover>
        <template v-slot:activator="{ props }">
          <v-btn
            variant="outlined"
            color="success"
            prepend-icon="mdi-check-circle"
            v-bind="props"
            :disabled="
              !factoryStore.currentFactory || factoryStore.currentFactory.floors.length === 0
            "
          >
            Complete
            <v-icon icon="mdi-menu-down" />
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="showCompleteRecipes">
            <v-list-item-title>Show recipes</v-list-item-title>
          </v-list-item>
          <v-list-item @click="hideCompleteRecipes">
            <v-list-item-title>Hide recipes</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Incomplete Recipes Menu -->
      <v-menu open-on-hover>
        <template v-slot:activator="{ props }">
          <v-btn
            variant="outlined"
            color="warning"
            prepend-icon="mdi-alert-circle"
            v-bind="props"
            class="ml-2"
            :disabled="
              !factoryStore.currentFactory || factoryStore.currentFactory.floors.length === 0
            "
          >
            Incomplete
            <v-icon icon="mdi-menu-down" />
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="showIncompleteRecipes">
            <v-list-item-title>Show recipes</v-list-item-title>
          </v-list-item>
          <v-list-item @click="hideIncompleteRecipes">
            <v-list-item-title>Hide recipes</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn
        variant="outlined"
        color="secondary"
        prepend-icon="mdi-pencil-box-multiple"
        @click="emit('edit-all-floors')"
        class="ml-2"
        :disabled="!factoryStore.currentFactory || factoryStore.currentFactory.floors.length === 0"
      >
        Edit Floors
      </v-btn>
    </v-card-text>
  </v-card>
</template>
