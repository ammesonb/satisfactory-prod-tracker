/**
 * Google Drive API Constants
 *
 * Google's gapi library does not provide these as constants,
 * so we define them here for maintainability and type safety.
 */

/**
 * Google Drive OAuth 2.0 Scopes
 * @see https://developers.google.com/drive/api/guides/api-specific-auth
 */
export const GOOGLE_DRIVE_SCOPES = {
  /** Full access to all files */
  DRIVE: 'https://www.googleapis.com/auth/drive',
  /** Access only to files created by this app */
  DRIVE_FILE: 'https://www.googleapis.com/auth/drive.file',
  /** Read-only access to all files */
  DRIVE_READONLY: 'https://www.googleapis.com/auth/drive.readonly',
  /** Read-only access to file metadata */
  DRIVE_METADATA_READONLY: 'https://www.googleapis.com/auth/drive.metadata.readonly',
} as const

/**
 * Google Drive API URLs
 */
export const GOOGLE_DRIVE_API_URLS = {
  /** Discovery document for Drive v3 API */
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  /** Base upload URL for multipart uploads */
  UPLOAD_BASE: 'https://www.googleapis.com/upload/drive/v3/files',
} as const

/**
 * Google Drive MIME types
 * @see https://developers.google.com/drive/api/guides/mime-types
 */
export const GOOGLE_DRIVE_MIME_TYPES = {
  /** Google Drive folder */
  FOLDER: 'application/vnd.google-apps.folder',
  /** JSON file */
  JSON: 'application/json',
  /** Plain text */
  TEXT: 'text/plain',
  /** PDF document */
  PDF: 'application/pdf',
} as const

/**
 * Query operators for Google Drive file searches
 * @see https://developers.google.com/drive/api/guides/ref-search-terms
 */
export const GOOGLE_DRIVE_QUERY_OPERATORS = {
  /** File/folder is in specified parent folder */
  IN_PARENTS: (parentId: string) => `'${parentId}' in parents`,
  /** File/folder name equals value */
  NAME_EQUALS: (name: string) => `name='${name}'`,
  /** File/folder name contains value */
  NAME_CONTAINS: (text: string) => `name contains '${text}'`,
  /** MIME type equals value */
  MIME_TYPE_EQUALS: (mimeType: string) => `mimeType='${mimeType}'`,
  /** Result is folder */
  IS_FOLDER: `mimeType = "${GOOGLE_DRIVE_MIME_TYPES.FOLDER}"`,
  /** File is not trashed */
  NOT_TRASHED: 'trashed = false',
  /** File is trashed */
  IS_TRASHED: 'trashed = true',
  /** Combine multiple queries with AND */
  AND: (...queries: string[]) => queries.join(' and '),
  /** Combine multiple queries with OR */
  OR: (...queries: string[]) => queries.join(' or '),
} as const

/**
 * Common field selectors for Google Drive API responses
 * @see https://developers.google.com/drive/api/guides/fields-parameter
 */
export const GOOGLE_DRIVE_FIELDS = {
  /** Basic file metadata */
  FILE_BASIC: 'id, name, mimeType, modifiedTime, createdTime, size',
  /** File list with basic metadata */
  FILE_LIST_BASIC: 'files(id, name, mimeType, modifiedTime, createdTime, size)',
  /** Just file ID */
  FILE_ID_ONLY: 'id',
} as const

/**
 * HTTP header names and formats
 */
export const HTTP_HEADERS = {
  /** Authorization header with Bearer token */
  AUTHORIZATION_BEARER: (token: string) => `Bearer ${token}`,
  /** Content-Type header */
  CONTENT_TYPE: 'Content-Type',
} as const

/**
 * HTTP content types
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  TEXT: 'text/plain',
  FORM_DATA: 'multipart/form-data',
} as const
