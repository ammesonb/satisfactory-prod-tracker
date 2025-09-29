import { vi } from 'vitest'
import { ref } from 'vue'

// Mock functions for useDataShare
export const mockExportToClipboard = vi.fn()
export const mockExportToFile = vi.fn()
export const mockImportFromClipboard = vi.fn()
export const mockImportFromFile = vi.fn()
export const mockHandleFileImport = vi.fn()
export const mockFileInput = ref<HTMLInputElement>()

export const mockUseDataShare = {
  exportToClipboard: mockExportToClipboard,
  exportToFile: mockExportToFile,
  importFromClipboard: mockImportFromClipboard,
  importFromFile: mockImportFromFile,
  handleFileImport: mockHandleFileImport,
  fileInput: mockFileInput,
}
