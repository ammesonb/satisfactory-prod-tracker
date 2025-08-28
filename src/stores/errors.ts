import { defineStore } from 'pinia'

export const useErrorStore = defineStore('error', {
  state: () => ({
    show: false,
    level: 'error' as 'error' | 'warning' | 'info',
    summary: '',
    details: '',
  }),
  actions: {
    setError(summary: string, details: string) {
      this.show = true
      this.level = 'error'
      this.summary = summary
      this.details = details
    },
    setWarning(summary: string, details: string) {
      this.show = true
      this.level = 'warning'
      this.summary = summary
      this.details = details
    },
    setInfo(summary: string, details: string) {
      this.show = true
      this.level = 'info'
      this.summary = summary
      this.details = details
    },
    hide() {
      this.show = false
      this.summary = ''
      this.details = ''
    },
  },
})
