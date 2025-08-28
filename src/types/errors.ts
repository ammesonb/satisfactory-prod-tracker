import type { VNode } from 'vue'

export interface ErrorBuilder {
  _title: string
  _bodyContent: VNode | (() => VNode) | null

  title(text: string): ErrorBuilder
  body(content: VNode | (() => VNode)): ErrorBuilder
  show(): void
}

export interface UserFriendlyError {
  showError(errorStore: { error(): ErrorBuilder }): void
}
