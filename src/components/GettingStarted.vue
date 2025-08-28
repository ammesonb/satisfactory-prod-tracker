<script setup lang="ts">
const steps = [
  {
    title: 'Configure Factory on Satisfactory Tools',
    description:
      'Create a factory, enter products, and configure alternative recipes, inputs, etc.',
  },
  {
    title: 'Open Dev Tools',
    description:
      'Open the dev tools for your browser (F12, or search a guide - it is usually quite easy).',
  },
  {
    title: 'Find Network Call',
    description: `Check the network tab + call list for one named <code class="text-green">solver</code>
      (you may need to reload the page for it to show up).
    `,
  },
  {
    title: 'Copy Data',
    description: `Copy anything starting with <code class="text-green">Recipe_</code> (including quotes and numbers) from the response tab.
      <br />
      Ex: <code class="text-green">"Recipe_IngotIron@0.823#Desc_SmelterMk1_C" : "1.376"</code>
    `,
  },
  {
    title: 'Add Factory',
    description:
      'Open the "Add Factory" modal and enter a factory name and icon, then paste in the copied recipes from Satisfactory Tools.',
  },
]
</script>

<template>
  <v-card class="mx-auto" max-width="800">
    <v-card-title class="text-h5">
      <v-icon class="mr-2" color="primary">mdi-information</v-icon>
      Get Started
    </v-card-title>
    <v-card-text>
      <p class="text-body-1 mb-4">
        Welcome! To begin tracking your factory production, you'll need to add a factory using the +
        button below.
      </p>

      <v-alert type="info" variant="tonal" class="mb-4">
        <strong>First, create your factory in Satisfactory Tools:</strong><br />
        Visit
        <a
          href="https://www.satisfactorytools.com/1.0/production"
          target="_blank"
          class="text-decoration-none"
          >Satisfactory Tools</a
        >
        to design and optimize your factory layout.
      </v-alert>

      <v-card variant="outlined">
        <v-card-title class="text-h6">
          <v-icon class="mr-2">mdi-download</v-icon>
          How to Import Recipe Data
        </v-card-title>
        <v-card-text>
          <div class="pa-4">
            <div v-for="(step, index) in steps" :key="index" class="mb-4">
              <div class="text-subtitle-1 font-weight-medium mb-1">
                {{ index + 1 }}. {{ step.title }}
              </div>
              <div class="text-body-2 text-medium-emphasis" v-html="step.description"></div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<style scoped>
code {
  color: green;
}
</style>
