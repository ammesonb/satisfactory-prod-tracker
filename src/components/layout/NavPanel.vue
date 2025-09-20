<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useFloorManagement } from '@/composables/useFloorManagement'
import { useRecipeStatus } from '@/composables/useRecipeStatus'
import { getStores } from '@/composables/useStores'
import { getIconURL } from '@/logistics/images'
import { formatFloorId, formatRecipeId } from '@/utils/floors'

const emit = defineEmits<{
  close: []
  navigate: [elementId: string]
}>()

const { factoryStore, dataStore } = getStores()
const { getFloorDisplayName } = useFloorManagement()
const { isRecipeComplete } = useRecipeStatus()
const searchQuery = ref('')
const searchInput = ref()

const currentFactory = computed(() => factoryStore.currentFactory)

const filteredFloors = computed(() => {
  // only filter if search query present
  if (!currentFactory.value || !searchQuery.value) {
    return (
      currentFactory.value?.floors.map((floor, index) => ({ ...floor, originalIndex: index })) || []
    )
  }

  const query = searchQuery.value.toLowerCase()

  return currentFactory.value.floors
    .map((floor, floorIndex) => {
      const floorName = getFloorDisplayName(floorIndex + 1, floor).toLowerCase()
      const floorMatches = floorName.includes(query)

      // only filter recipes if the floor does not match
      const filteredRecipes = floorMatches
        ? floor.recipes
        : floor.recipes.filter((recipe) => {
            const recipeName = dataStore.getRecipeDisplayName(recipe.recipe.name).toLowerCase()
            return recipeName.includes(query)
          })

      if (floorMatches || filteredRecipes.length > 0) {
        return {
          ...floor,
          originalIndex: floorIndex,
          recipes: filteredRecipes,
        }
      }

      return null
    })
    .filter((floor) => floor !== null)
})

const handleFloorClick = (floorIndex: number) => {
  emit('navigate', formatFloorId(floorIndex))
}

const handleRecipeClick = (floorIndex: number, recipeName: string) => {
  emit('navigate', formatRecipeId(floorIndex, recipeName))
}

onMounted(() => {
  if (searchInput.value) {
    searchInput.value.focus()
  }
})
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

    <div class="pa-3 pt-0">
      <v-text-field
        ref="searchInput"
        v-model="searchQuery"
        placeholder="Search floors and recipes..."
        prepend-inner-icon="mdi-magnify"
        density="compact"
        hide-details
        clearable
      />
    </div>

    <v-divider />

    <div class="nav-content">
      <v-list density="compact" class="py-0">
        <template v-for="floor in filteredFloors" :key="floor.originalIndex">
          <!-- Floor Header -->
          <v-list-item
            @click="handleFloorClick(floor.originalIndex)"
            class="floor-item"
            :prepend-icon="floor.iconItem ? dataStore.getIcon(floor.iconItem) : 'mdi-factory'"
          >
            <template v-if="floor.iconItem" #prepend>
              <v-avatar size="24">
                <v-img :src="getIconURL(dataStore.getIcon(floor.iconItem), 64)" />
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium">
              {{ getFloorDisplayName(floor.originalIndex + 1, floor) }}
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
              :key="`${floor.originalIndex}-${recipe.recipe.name}`"
              @click="handleRecipeClick(floor.originalIndex, recipe.recipe.name)"
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
                <v-icon v-if="isRecipeComplete(recipe)" size="16" color="success">
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
  position: fixed;
  bottom: 5rem; /* Just above the plus FAB */
  right: 1rem;
  width: 20rem;
  max-width: calc(100vw - 2rem);
  max-height: calc(100vh - 10rem); /* Leave space for FAB and top/bottom margins */
}

.nav-content {
  overflow-y: auto;
  max-height: calc(100vh - 15rem); /* Adjust for panel padding, search bar, and margins */
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
