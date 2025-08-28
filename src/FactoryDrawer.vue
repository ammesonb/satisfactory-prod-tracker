<script setup lang="ts">
import { ref } from 'vue'

const collapsed = ref(true)
</script>

<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer expand-on-hover permanent v-model:rail="collapsed" :rail-width="64">
        <v-list>
          <v-list-item class="pl-2">
            <v-btn color="green" icon="mdi-plus" size="small" v-if="collapsed" />
            <v-btn color="green" prepend-icon="mdi-plus" v-else>Add Factory</v-btn>
          </v-list-item>
        </v-list>
        <v-divider />
        <v-list>
          <!-- factories go here -->
        </v-list>
      </v-navigation-drawer>
    </v-layout>
  </v-card>
</template>
