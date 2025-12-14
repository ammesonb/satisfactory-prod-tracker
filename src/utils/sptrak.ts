import type { SptrakFile } from '@/types/cloudSync'
import { CLOUD_SYNC_ERRORS } from '@/types/cloudSync'
import { asFactory, type Factory } from '@/types/factory'

const SPTRAK_VERSION = '1.0'

/**
 * Serialize a factory to .sptrak format
 */
export function serializeSptrak(
  factory: Factory,
  instanceId: string,
  namespace: string,
  displayId?: string,
): string {
  const sptrakFile: SptrakFile = {
    metadata: {
      version: SPTRAK_VERSION,
      instanceId,
      displayId,
      lastModified: new Date().toISOString(),
      factoryName: factory.name,
      namespace,
    },
    factory,
  }

  return JSON.stringify(sptrakFile, null, 2)
}

/**
 * Deserialize a .sptrak file from JSON string
 */
export function deserializeSptrak(content: string): SptrakFile {
  let parsed: unknown

  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error(`${CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT}: Invalid JSON`)
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT}: Must be an object`)
  }

  const file = parsed as Record<string, unknown>

  if (!file.metadata || typeof file.metadata !== 'object' || Array.isArray(file.metadata)) {
    throw new Error(`${CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT}: Missing or invalid metadata`)
  }

  const metadata = file.metadata as Record<string, unknown>

  const requiredMetadataFields = [
    'version',
    'instanceId',
    'lastModified',
    'factoryName',
    'namespace',
  ]
  for (const field of requiredMetadataFields) {
    if (!(field in metadata) || typeof metadata[field] !== 'string') {
      throw new Error(
        `${CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT}: Missing or invalid metadata.${field}`,
      )
    }
  }

  if (!file.factory) {
    throw new Error(`${CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT}: Missing factory data`)
  }

  try {
    asFactory(file.factory)
  } catch (error) {
    throw new Error(
      `${CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT}: Invalid factory data - ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return file as unknown as SptrakFile
}

/**
 * Validate that a .sptrak file has the correct version
 */
export function isCompatibleVersion(sptrakFile: SptrakFile): boolean {
  return sptrakFile.metadata.version === SPTRAK_VERSION
}

/**
 * Generate a filename for a .sptrak file
 */
export function generateSptrakFilename(factoryName: string): string {
  const sanitized = factoryName
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')

  return `${sanitized}.sptrak`
}

/**
 * Extract factory name from a .sptrak filename
 */
export function extractFactoryNameFromFilename(filename: string): string {
  const nameWithoutExt = filename.replace(/\.sptrak$/i, '')
  return nameWithoutExt.replace(/_/g, ' ')
}
