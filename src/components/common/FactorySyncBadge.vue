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
  }
})
</script>

<template>
  <v-tooltip :text="syncBadge.tooltip" location="right" :disabled="!syncBadge.show">
    <template v-slot:activator="{ props: tooltipProps }">
      <v-badge
        v-if="syncBadge.show"
        :color="syncBadge.color"
        :icon="syncBadge.icon"
        :dot="rail"
        overlap
        offset-y="4"
        :width="rail ? undefined : '24'"
        :height="rail ? undefined : '24'"
        v-bind="tooltipProps"
      >
        <slot />
      </v-badge>
      <slot v-else />
    </template>
  </v-tooltip>
</template>
