<script setup lang="ts">
import { computed } from 'vue'
import { getStores } from '@/composables/useStores'
import { ExpandRecipeState, useFloorNavigation } from '@/composables/useFloorNavigation'
import { useRecipeStatus } from '@/composables/useRecipeStatus'
import { useFloorManagement } from '@/composables/useFloorManagement'

const { factoryStore } = getStores()
const factoryHasFloors = computed(() => (factoryStore.currentFactory?.floors.length ?? 0) > 0)
const { setRecipeExpansionFromCompletion } = useFloorNavigation()
const { isRecipeComplete } = useRecipeStatus()
const { openFloorEditor } = useFloorManagement()

const menuActions = {
  showCompleteRecipes: () =>
    setRecipeExpansionFromCompletion(ExpandRecipeState.Complete, true, isRecipeComplete),
  hideCompleteRecipes: () =>
    setRecipeExpansionFromCompletion(ExpandRecipeState.Complete, false, isRecipeComplete),
  showIncompleteRecipes: () =>
    setRecipeExpansionFromCompletion(ExpandRecipeState.Incomplete, true, isRecipeComplete),
  hideIncompleteRecipes: () =>
    setRecipeExpansionFromCompletion(ExpandRecipeState.Incomplete, false, isRecipeComplete),
}
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
            :disabled="!factoryHasFloors"
          >
            Complete
            <v-icon icon="mdi-menu-down" />
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="menuActions.showCompleteRecipes">
            <v-list-item-title>Show recipes</v-list-item-title>
          </v-list-item>
          <v-list-item @click="menuActions.hideCompleteRecipes">
            <v-list-item-title>Hide recipes</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Incomplete Recipes Menu -->
      <v-menu open-on-hover>
        <template v-slot:activator="{ props }">
          <v-btn
            variant="outlined"
            color="orange"
            prepend-icon="mdi-alert-circle"
            v-bind="props"
            class="ml-2"
            :disabled="!factoryHasFloors"
          >
            Incomplete
            <v-icon icon="mdi-menu-down" />
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="menuActions.showIncompleteRecipes">
            <v-list-item-title>Show recipes</v-list-item-title>
          </v-list-item>
          <v-list-item @click="menuActions.hideIncompleteRecipes">
            <v-list-item-title>Hide recipes</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn
        variant="outlined"
        color="secondary"
        prepend-icon="mdi-pencil-box-multiple"
        @click="openFloorEditor()"
        class="ml-2"
        :disabled="!factoryHasFloors"
      >
        Edit Floors
      </v-btn>
    </v-card-text>
  </v-card>
</template>
