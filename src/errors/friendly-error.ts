export interface UserFriendlyError {
  toErrorMessage(): { summary: string; details: string }
}
