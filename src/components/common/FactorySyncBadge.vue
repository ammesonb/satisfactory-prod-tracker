<script setup lang="ts">
import { computed } from 'vue'

import { getStores } from '@/composables/useStores'
import type { Factory } from '@/types/factory'
import { FactorySyncStatus } from '@/types/cloudSync'
import { getFactorySyncTooltip, getSyncStatusColor, getSyncStatusIcon } from '@/utils/cloudSync'

interface Props {
  factory: Factory
  rail?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  rail: false,
})

const { cloudSyncStore, googleAuthStore } = getStores()

const syncBadge = computed(() => {
  const status = props.factory.syncStatus?.status || FactorySyncStatus.CLEAN
  const isAuthenticated = googleAuthStore.isAuthenticated
  const isAutoSynced = cloudSyncStore.isFactoryAutoSynced(props.factory.name)

  return {
    color: getSyncStatusColor(status),
    icon: getSyncStatusIcon(status),
    tooltip: getFactorySyncTooltip(props.factory.syncStatus?.status, isAuthenticated),
    show: isAuthenticated && isAutoSynced,
    spinning: status === FactorySyncStatus.SAVING,
  }
})
</script>

<template>
  <v-tooltip :text="syncBadge.tooltip" location="right" :disabled="!syncBadge.show">
    <template v-slot:activator="{ props: tooltipProps }">
      <template v-if="syncBadge.show">
        <!-- Rail mode: use dot badge -->
        <v-badge v-if="rail" :color="syncBadge.color" dot location="top left" v-bind="tooltipProps">
          <slot />
        </v-badge>
        <!-- Expanded mode: colored icon without background -->
        <div v-else class="sync-badge-container" v-bind="tooltipProps">
          <slot />
          <v-icon
            :icon="syncBadge.icon"
            :color="syncBadge.color"
            :class="['sync-icon', { 'mdi-spin': syncBadge.spinning }]"
          />
        </div>
      </template>
      <slot v-else />
    </template>
  </v-tooltip>
</template>

<style scoped>
.sync-badge-container {
  position: relative;
  display: inline-block;
}

.sync-icon {
  position: absolute;
  top: -4px;
  left: -4px;
  font-size: 20px !important;
}
</style>
