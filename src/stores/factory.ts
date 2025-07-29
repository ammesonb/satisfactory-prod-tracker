import { defineStore } from 'pinia'
import type { Factory } from '@/types/factory'

export const useFactoryStore = defineStore('factory', {
  state: () => ({
    selected: '',
    factories: {} as Record<string, Factory>,
  }),
  getters: {
    currentFactory: (state) => state.factories[state.selected],
  },
  actions: {
    setSelectedFactory(factoryName: string) {
      this.selected = factoryName
    },
    // TODO: this will need a list of recipes that get parsed into floors
    addFactory(name: string) {
      this.factories[name] = {
        name,
        floors: [],
      }
    },
  },
  persist: true,
})
