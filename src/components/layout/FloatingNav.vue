<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFactoryStore } from '@/stores/factory'
import { useDataStore } from '@/stores/data'
import { getIconURL } from '@/logistics/images'

const factoryStore = useFactoryStore()
const dataStore = useDataStore()

const isOpen = ref(false)

const currentFactory = computed(() => factoryStore.currentFactory)

const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (element) {
    const yOffset = -80 // Account for app bar height
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

const scrollToFloor = (floorIndex: number) => {
  scrollToElement(`floor-${floorIndex}`)
  isOpen.value = false
}

const scrollToRecipe = (floorIndex: number, recipeName: string) => {
  scrollToElement(`recipe-${floorIndex}-${recipeName}`)
  isOpen.value = false
}
</script>

<template>
  <div class="floating-nav">
    <!-- Toggle Button -->
    <v-btn
      fab
      icon
      color="primary"
      class="floating-toggle"
      @click="isOpen = !isOpen"
      elevation="4"
      v-show="!isOpen"
    >
      <v-icon>mdi-map</v-icon>
    </v-btn>

    <!-- Navigation Panel -->
    <v-card v-if="isOpen && currentFactory" class="floating-panel" elevation="8" max-height="70vh">
      <v-card-title class="text-subtitle-1 pa-3 pb-2 d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-map</v-icon>
          Navigation
        </div>
        <v-btn icon="mdi-close" size="small" variant="text" @click="isOpen = false" />
      </v-card-title>

      <v-divider />

      <div class="nav-content">
        <v-list density="compact" class="py-0">
          <template v-for="(floor, floorIndex) in currentFactory.floors" :key="floorIndex">
            <!-- Floor Header -->
            <v-list-item
              @click="scrollToFloor(floorIndex)"
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
                @click="scrollToRecipe(floorIndex, recipe.recipe.name)"
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
  </div>
</template>

<style scoped>
.floating-nav {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
}

.floating-toggle {
  position: relative;
  z-index: 1001;
}

.floating-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  max-width: calc(100vw - 100px);
}

.nav-content {
  overflow-y: auto;
  max-height: calc(70vh - 60px);
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

@media (max-width: 600px) {
  .floating-nav {
    right: 10px;
  }

  .floating-panel {
    width: 280px;
    max-width: calc(100vw - 80px);
  }
}
</style>
