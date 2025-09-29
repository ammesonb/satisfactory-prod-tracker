import { ref, type Ref } from 'vue'

export interface DataShareComposable {
  exportToClipboard: (data: string) => Promise<void>
  exportToFile: (data: string, filename?: string) => void
  importFromClipboard: () => Promise<string>
  importFromFile: () => void
  handleFileImport: (event: Event) => Promise<string>
  fileInput: Ref<HTMLInputElement | undefined>
}

export function useDataShare(): DataShareComposable {
  const fileInput = ref<HTMLInputElement>()

  const exportToClipboard = async (data: string): Promise<void> => {
    await navigator.clipboard.writeText(data)
  }

  const exportToFile = (data: string, filename?: string): void => {
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `satisfactory-tracker-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importFromClipboard = async (): Promise<string> => {
    return await navigator.clipboard.readText()
  }

  const importFromFile = (): void => {
    fileInput.value?.click()
  }

  const handleFileImport = (event: Event): Promise<string> => {
    return new Promise((resolve, reject) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = (e.target?.result as string) || ''
        resolve(result)
      }
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      reader.readAsText(file)
    })
  }

  return {
    exportToClipboard,
    exportToFile,
    importFromClipboard,
    importFromFile,
    handleFileImport,
    fileInput,
  }
}
