import { defineStore } from 'pinia'
import type { VNode } from 'vue'
import type { ErrorBuilder } from '@/types/errors'

export const useErrorStore = defineStore('error', {
  state: () => ({
    show: false,
    level: 'error' as 'error' | 'warning' | 'info',
    summary: '',
    bodyContent: null as VNode | (() => VNode) | null,
  }),
  actions: {
    createBuilder(level: 'error' | 'warning' | 'info'): ErrorBuilder {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const store = this
      return {
        _title: '',
        _bodyContent: null as VNode | (() => VNode) | null,

        title(text: string) {
          this._title = text
          return this
        },

        body(content: VNode | (() => VNode)) {
          this._bodyContent = content
          return this
        },

        show() {
          store.level = level
          store.summary = this._title
          store.bodyContent = this._bodyContent
          store.show = true
        },
      }
    },

    error(): ErrorBuilder {
      return this.createBuilder('error')
    },

    warning(): ErrorBuilder {
      return this.createBuilder('warning')
    },

    info(): ErrorBuilder {
      return this.createBuilder('info')
    },

    hide() {
      this.show = false
      this.summary = ''
      this.bodyContent = null
    },
  },
})
