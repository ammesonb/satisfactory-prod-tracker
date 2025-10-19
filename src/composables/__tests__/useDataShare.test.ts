import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDataShare } from '@/composables/useDataShare'

describe('useDataShare', () => {
  let dataShare: ReturnType<typeof useDataShare>

  beforeEach(() => {
    dataShare = useDataShare()

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue(''),
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('initializes with undefined fileInput', () => {
      expect(dataShare.fileInput.value).toBeUndefined()
    })

    it('exposes all required methods', () => {
      expect(dataShare.exportToClipboard).toBeDefined()
      expect(dataShare.exportToFile).toBeDefined()
      expect(dataShare.importFromClipboard).toBeDefined()
      expect(dataShare.importFromFile).toBeDefined()
      expect(dataShare.handleFileImport).toBeDefined()
    })
  })

  describe('exportToClipboard', () => {
    it('writes data to clipboard', async () => {
      const testData = '{"test": "data"}'

      await dataShare.exportToClipboard(testData)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testData)
    })

    it('handles empty string', async () => {
      await dataShare.exportToClipboard('')

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('')
    })

    it('handles JSON data', async () => {
      const jsonData = JSON.stringify({ factory: 'test', floors: [] })

      await dataShare.exportToClipboard(jsonData)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(jsonData)
    })
  })

  describe('exportToFile', () => {
    let createObjectURLSpy: ReturnType<typeof vi.fn>
    let revokeObjectURLSpy: ReturnType<typeof vi.fn>
    let clickSpy: ReturnType<typeof vi.fn>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let createElementSpy: any

    beforeEach(() => {
      createObjectURLSpy = vi.fn().mockReturnValue('blob:mock-url')
      revokeObjectURLSpy = vi.fn()
      clickSpy = vi.fn()

      global.URL.createObjectURL = createObjectURLSpy
      global.URL.revokeObjectURL = revokeObjectURLSpy

      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        click: clickSpy,
        href: '',
        download: '',
      } as unknown as HTMLAnchorElement)
    })

    afterEach(() => {
      createElementSpy.mockRestore()
    })

    it('creates blob with correct content type', () => {
      const testData = '{"test": "data"}'

      dataShare.exportToFile(testData)

      expect(createObjectURLSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'application/json',
        }),
      )
    })

    it('uses custom filename when provided', () => {
      const testData = '{"test": "data"}'
      const filename = 'custom-export.json'

      dataShare.exportToFile(testData, filename)

      const anchor = createElementSpy.mock.results[0].value as HTMLAnchorElement
      expect(anchor.download).toBe(filename)
    })

    it('generates default filename with date', () => {
      const testData = '{"test": "data"}'

      dataShare.exportToFile(testData)

      const anchor = createElementSpy.mock.results[0].value as HTMLAnchorElement
      expect(anchor.download).toMatch(/^satisfactory-tracker-\d{4}-\d{2}-\d{2}\.json$/)
    })

    it('triggers download by clicking anchor', () => {
      const testData = '{"test": "data"}'

      dataShare.exportToFile(testData)

      expect(clickSpy).toHaveBeenCalled()
    })

    it('revokes object URL after download', () => {
      const testData = '{"test": "data"}'

      dataShare.exportToFile(testData)

      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')
    })
  })

  describe('importFromClipboard', () => {
    it('reads text from clipboard', async () => {
      vi.mocked(navigator.clipboard.readText).mockResolvedValue('clipboard content')
      const result = await dataShare.importFromClipboard()

      expect(navigator.clipboard.readText).toHaveBeenCalled()
      expect(result).toBe('clipboard content')
    })

    it('returns clipboard content', async () => {
      const testData = '{"factory": "test"}'
      vi.mocked(navigator.clipboard.readText).mockResolvedValue(testData)

      const result = await dataShare.importFromClipboard()

      expect(result).toBe(testData)
    })
  })

  describe('importFromFile', () => {
    it('triggers file input click when fileInput is set', () => {
      const mockInput = { click: vi.fn() } as unknown as HTMLInputElement
      dataShare.fileInput.value = mockInput

      dataShare.importFromFile()

      expect(mockInput.click).toHaveBeenCalled()
    })

    it('does nothing when fileInput is undefined', () => {
      dataShare.fileInput.value = undefined

      expect(() => dataShare.importFromFile()).not.toThrow()
    })
  })

  describe('handleFileImport', () => {
    it('reads file content successfully', async () => {
      const fileContent = '{"test": "data"}'
      const mockFile = new File([fileContent], 'test.json', { type: 'application/json' })
      const mockEvent = {
        target: { files: [mockFile] },
      } as unknown as Event

      const result = await dataShare.handleFileImport(mockEvent)

      expect(result).toBe(fileContent)
    })

    it('rejects when no file is selected', async () => {
      const mockEvent = {
        target: { files: [] },
      } as unknown as Event

      await expect(dataShare.handleFileImport(mockEvent)).rejects.toThrow('No file selected')
    })

    it('rejects when target has no files', async () => {
      const mockEvent = {
        target: { files: null },
      } as unknown as Event

      await expect(dataShare.handleFileImport(mockEvent)).rejects.toThrow('No file selected')
    })

    it('handles file read errors', async () => {
      const mockFile = new File(['content'], 'test.json', { type: 'application/json' })
      const mockEvent = {
        target: { files: [mockFile] },
      } as unknown as Event

      const originalFileReader = global.FileReader
      global.FileReader = class extends FileReader {
        readAsText() {
          setTimeout(() => this.onerror?.({} as ProgressEvent<FileReader>), 0)
        }
      } as typeof FileReader

      await expect(dataShare.handleFileImport(mockEvent)).rejects.toThrow('Failed to read file')

      global.FileReader = originalFileReader
    })

    it('handles empty file content', async () => {
      const mockFile = new File([''], 'empty.json', { type: 'application/json' })
      const mockEvent = {
        target: { files: [mockFile] },
      } as unknown as Event

      const result = await dataShare.handleFileImport(mockEvent)

      expect(result).toBe('')
    })

    it('handles large JSON files', async () => {
      const largeData = JSON.stringify({ data: new Array(1000).fill({ test: 'value' }) })
      const mockFile = new File([largeData], 'large.json', { type: 'application/json' })
      const mockEvent = {
        target: { files: [mockFile] },
      } as unknown as Event

      const result = await dataShare.handleFileImport(mockEvent)

      expect(result).toBe(largeData)
    })
  })

  describe('Integration', () => {
    it('can export and import the same data via clipboard', async () => {
      const testData = '{"factory": "test", "floors": []}'
      let clipboardContent = ''

      vi.mocked(navigator.clipboard.writeText).mockImplementation((text: string) => {
        clipboardContent = text
        return Promise.resolve()
      })
      vi.mocked(navigator.clipboard.readText).mockImplementation(() =>
        Promise.resolve(clipboardContent),
      )

      await dataShare.exportToClipboard(testData)
      const imported = await dataShare.importFromClipboard()

      expect(imported).toBe(testData)
    })

    it('can export and import the same data via file', async () => {
      const testData = '{"factory": "test", "floors": []}'

      global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
      global.URL.revokeObjectURL = vi.fn()

      vi.spyOn(document, 'createElement').mockReturnValue({
        click: vi.fn(),
        href: '',
        download: '',
      } as unknown as HTMLAnchorElement)

      dataShare.exportToFile(testData)

      const mockFile = new File([testData], 'test.json', { type: 'application/json' })
      const mockEvent = {
        target: { files: [mockFile] },
      } as unknown as Event

      const imported = await dataShare.handleFileImport(mockEvent)

      expect(imported).toBe(testData)
    })
  })
})
