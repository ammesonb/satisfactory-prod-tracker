<script setup lang="ts">
import { computed } from 'vue'
import { useFactoryStore } from '@/stores/factory'
import { useDataStore } from '@/stores/data'
import { getIconURL } from '@/logistics/images'

const emit = defineEmits<{
  close: []
  navigate: [elementId: string]
}>()

const factoryStore = useFactoryStore()
const dataStore = useDataStore()

const currentFactory = computed(() => factoryStore.currentFactory)

const handleFloorClick = (floorIndex: number) => {
  emit('navigate', `floor-${floorIndex}`)
}

const handleRecipeClick = (floorIndex: number, recipeName: string) => {
  emit('navigate', `recipe-${floorIndex}-${recipeName}`)
}
</script>

<template>
  <v-card v-if="currentFactory" class="nav-panel" elevation="8">
    <v-card-title class="text-subtitle-1 pa-3 pb-2 d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-map</v-icon>
        Navigation
      </div>
      <v-btn icon="mdi-close" size="small" variant="text" @click="emit('close')" />
    </v-card-title>

    <v-divider />

    <div class="nav-content">
      <v-list density="compact" class="py-0">
        <template v-for="(floor, floorIndex) in currentFactory.floors" :key="floorIndex">
          <!-- Floor Header -->
          <v-list-item
            @click="handleFloorClick(floorIndex)"
            class="floor-item"
            :prepend-icon="floor.icon ? undefined : 'mdi-factory'"
          >
            <template v-if="floor.icon" #prepend>
              <v-avatar size="24">
                <v-img :src="getIconURL(floor.icon, 64)" />
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium">
              {{ factoryStore.getFloorDisplayName(floorIndex + 1, floor) }}
            </v-list-item-title>

            <template #append>
              <v-chip size="x-small" color="secondary" variant="outlined">
                {{ floor.recipes.length }}
              </v-chip>
            </template>
          </v-list-item>

          <!-- Recipes for this floor -->
          <div class="recipe-list">
            <v-list-item
              v-for="recipe in floor.recipes"
              :key="`${floorIndex}-${recipe.recipe.name}`"
              @click="handleRecipeClick(floorIndex, recipe.recipe.name)"
              class="recipe-item"
              density="compact"
            >
              <template #prepend>
                <v-avatar size="20" class="me-2">
                  <v-img :src="getIconURL(dataStore.getIcon(recipe.recipe.name), 64)" />
                </v-avatar>
              </template>

              <v-list-item-title class="text-body-2">
                {{ dataStore.getRecipeDisplayName(recipe.recipe.name) }}
              </v-list-item-title>

              <template #append>
                <v-icon v-if="factoryStore.recipeComplete(recipe)" size="16" color="success">
                  mdi-check-circle
                </v-icon>
              </template>
            </v-list-item>
          </div>
        </template>
      </v-list>
    </div>
  </v-card>
</template>

<style scoped>
.nav-panel {
  position: absolute;
  bottom: 4rem; /* Just above the plus FAB */
  right: 0;
  width: 20rem;
  max-width: calc(100vw - 6rem);
  max-height: 60vh;
}

.nav-content {
  overflow-y: auto;
  max-height: calc(60vh - 60px);
}

.floor-item {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.recipe-list {
  border-left: 2px solid rgba(var(--v-theme-outline), 0.3);
  margin-left: 20px;
}

.recipe-item {
  padding-left: 16px !important;
  min-height: 36px;
}

.recipe-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.floor-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

@media (min-width: 1440px) {
  .nav-panel {
    bottom: 5rem;
    width: 22rem;
  }
}

@media (max-width: 600px) {
  .nav-panel {
    bottom: 3rem;
    width: 18rem;
    max-width: calc(100vw - 4rem);
  }
}
</style>
