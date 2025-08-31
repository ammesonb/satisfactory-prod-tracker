<script setup lang="ts">
import { useFactoryStore } from '@/stores/factory'

const factoryStore = useFactoryStore()
const steps = [
  {
    title: 'Add Factory',
    description: 'Click the + button and enter a factory name and icon.',
  },
  {
    title: 'Enter Recipes',
    description:
      'Add recipes one by one using the recipe form, or import from Satisfactory Tools using the guide below.',
  },
  {
    title: 'Track Progress',
    description:
      'Use the checkboxes to mark recipes and connections as built to track your factory construction progress.',
  },
]

const sampleRecipes = `"Recipe_Alternate_SteelRod_C@100#Desc_ConstructorMk1_C": "2.5",
"Recipe_Alternate_PureIronIngot_C@100#Desc_OilRefinery_C": "2.87179",
"Recipe_ModularFrame_C@100#Desc_AssemblerMk1_C": "10",
"Recipe_Alternate_SteelCastedPlate_C@100#Desc_FoundryMk1_C": "2.222222222222",
"Recipe_Alternate_Wire_1_C@100#Desc_ConstructorMk1_C": "8.888888888888",
"Recipe_Alternate_ReinforcedIronPlate_2_C@100#Desc_AssemblerMk1_C": "5.333333333333",
"Recipe_Alternate_IngotSteel_1_C@100#Desc_FoundryMk1_C": "1.055555555555"`

const addSampleFactory = () => {
  try {
    factoryStore.addFactory('Sample Factory', 'desc-modularframe-c', sampleRecipes.trim(), [])
    factoryStore.setSelectedFactory('Sample Factory')
  } catch (error) {
    console.error('Failed to add sample factory:', error)
  }
}
</script>

<template>
  <v-card class="mx-auto" max-width="800">
    <v-card-title class="text-h5 d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-rocket-launch</v-icon>
        Get Started
      </div>
      <v-btn
        color="secondary"
        variant="elevated"
        prepend-icon="mdi-play-circle"
        @click="addSampleFactory"
      >
        Try Sample Recipes
      </v-btn>
    </v-card-title>
    <v-card-text>
      <p class="text-body-1 mb-4">
        Welcome! To begin tracking your factory production, follow these simple steps:
      </p>

      <div class="mb-4">
        <div v-for="(step, index) in steps" :key="index" class="mb-4">
          <div class="text-subtitle-1 font-weight-medium mb-1">
            {{ index + 1 }}. {{ step.title }}
          </div>
          <div class="text-body-2 text-medium-emphasis" v-html="step.description"></div>
        </div>
      </div>

      <v-alert type="info" variant="tonal" class="mt-4">
        <strong>Want to import from Satisfactory Tools?</strong><br />
        Check out the
        <a
          href="https://github.com/ammesonb/satisfactory-prod-tracker/wiki/Import-from-Satisfactory-Tools"
          target="_blank"
          class="text-decoration-none"
          >import guide</a
        >
        for step-by-step instructions.
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<style scoped>
code {
  color: green;
}
</style>
