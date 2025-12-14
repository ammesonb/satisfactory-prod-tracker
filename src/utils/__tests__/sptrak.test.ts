import { describe, expect, it } from 'vitest'

import { makeFactory } from '@/__tests__/fixtures/data/factory'
import { CLOUD_SYNC_ERRORS } from '@/types/cloudSync'
import {
  deserializeSptrak,
  extractFactoryNameFromFilename,
  generateSptrakFilename,
  isCompatibleVersion,
  serializeSptrak,
} from '@/utils/sptrak'

const TEST_FACTORY = makeFactory('Test Factory', [])
const TEST_INSTANCE_ID = 'test-instance-123'
const TEST_NAMESPACE = 'my-namespace'
const TEST_DISPLAY_ID = 'My Device'

describe('sptrak utilities', () => {
  describe('serializeSptrak', () => {
    it('creates valid JSON string with all required fields', () => {
      const result = serializeSptrak(
        TEST_FACTORY,
        TEST_INSTANCE_ID,
        TEST_NAMESPACE,
        TEST_DISPLAY_ID,
      )
      const parsed = JSON.parse(result)

      expect(parsed).toHaveProperty('metadata')
      expect(parsed).toHaveProperty('factory')
      expect(parsed.metadata.version).toBe('1.0')
      expect(parsed.metadata.instanceId).toBe(TEST_INSTANCE_ID)
      expect(parsed.metadata.displayId).toBe(TEST_DISPLAY_ID)
      expect(parsed.metadata.factoryName).toBe(TEST_FACTORY.name)
      expect(parsed.metadata.namespace).toBe(TEST_NAMESPACE)
      expect(parsed.metadata.lastModified).toBeDefined()
    })

    it('includes factory data', () => {
      const result = serializeSptrak(TEST_FACTORY, TEST_INSTANCE_ID, TEST_NAMESPACE)
      const parsed = JSON.parse(result)

      expect(parsed.factory).toEqual(TEST_FACTORY)
    })

    it('works without displayId', () => {
      const result = serializeSptrak(TEST_FACTORY, TEST_INSTANCE_ID, TEST_NAMESPACE)
      const parsed = JSON.parse(result)

      expect(parsed.metadata.displayId).toBeUndefined()
    })
  })

  describe('deserializeSptrak', () => {
    const validSptrak = serializeSptrak(
      TEST_FACTORY,
      TEST_INSTANCE_ID,
      TEST_NAMESPACE,
      TEST_DISPLAY_ID,
    )

    it('parses valid sptrak file', () => {
      const result = deserializeSptrak(validSptrak)

      expect(result.metadata.version).toBe('1.0')
      expect(result.metadata.instanceId).toBe(TEST_INSTANCE_ID)
      expect(result.metadata.displayId).toBe(TEST_DISPLAY_ID)
      expect(result.metadata.factoryName).toBe(TEST_FACTORY.name)
      expect(result.metadata.namespace).toBe(TEST_NAMESPACE)
      expect(result.factory).toEqual(TEST_FACTORY)
    })

    it('throws error for invalid JSON', () => {
      expect(() => deserializeSptrak('not json')).toThrow(CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT)
    })

    it('throws error for non-object JSON', () => {
      expect(() => deserializeSptrak('"string"')).toThrow(CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT)
      expect(() => deserializeSptrak('[]')).toThrow(CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT)
      expect(() => deserializeSptrak('123')).toThrow(CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT)
    })

    it('throws error for missing metadata', () => {
      expect(() => deserializeSptrak('{}')).toThrow(CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT)
      expect(() => deserializeSptrak('{"metadata": null}')).toThrow(
        CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT,
      )
      expect(() => deserializeSptrak('{"metadata": []}')).toThrow(
        CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT,
      )
    })

    it('throws error for missing required metadata fields', () => {
      const requiredFields = ['version', 'instanceId', 'lastModified', 'factoryName', 'namespace']

      for (const field of requiredFields) {
        const metadata: Record<string, string> = {
          version: '1.0',
          instanceId: 'test',
          lastModified: '2024-01-01',
          factoryName: 'test',
          namespace: 'test',
        }
        delete metadata[field]

        const invalidSptrak = JSON.stringify({ metadata, factory: TEST_FACTORY })
        expect(() => deserializeSptrak(invalidSptrak)).toThrow(
          CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT,
        )
      }
    })

    it('throws error for missing factory data', () => {
      const invalidSptrak = JSON.stringify({
        metadata: {
          version: '1.0',
          instanceId: 'test',
          lastModified: '2024-01-01',
          factoryName: 'test',
          namespace: 'test',
        },
      })
      expect(() => deserializeSptrak(invalidSptrak)).toThrow(
        CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT,
      )
    })

    it('throws error for invalid factory data', () => {
      const invalidSptrak = JSON.stringify({
        metadata: {
          version: '1.0',
          instanceId: 'test',
          lastModified: '2024-01-01',
          factoryName: 'test',
          namespace: 'test',
        },
        factory: { invalid: 'data' },
      })
      expect(() => deserializeSptrak(invalidSptrak)).toThrow(
        CLOUD_SYNC_ERRORS.INVALID_SPTRAK_FORMAT,
      )
    })
  })

  describe('isCompatibleVersion', () => {
    it('returns true for version 1.0', () => {
      const sptrak = deserializeSptrak(
        serializeSptrak(TEST_FACTORY, TEST_INSTANCE_ID, TEST_NAMESPACE),
      )
      expect(isCompatibleVersion(sptrak)).toBe(true)
    })

    it('returns false for incompatible versions', () => {
      const sptrak = deserializeSptrak(
        serializeSptrak(TEST_FACTORY, TEST_INSTANCE_ID, TEST_NAMESPACE),
      )
      sptrak.metadata.version = '2.0'
      expect(isCompatibleVersion(sptrak)).toBe(false)
    })
  })

  describe('generateSptrakFilename', () => {
    it('generates filename with .sptrak extension', () => {
      expect(generateSptrakFilename('My Factory')).toBe('My_Factory.sptrak')
    })

    it('replaces spaces with underscores', () => {
      expect(generateSptrakFilename('Steel Production Plant')).toBe('Steel_Production_Plant.sptrak')
    })

    it('sanitizes invalid filename characters', () => {
      expect(generateSptrakFilename('Factory/Name\\Test')).toBe('Factory-Name-Test.sptrak')
      expect(generateSptrakFilename('Factory:Name?Test')).toBe('Factory-Name-Test.sptrak')
      expect(generateSptrakFilename('Factory|Name*Test')).toBe('Factory-Name-Test.sptrak')
    })

    it('trims whitespace', () => {
      expect(generateSptrakFilename('  Factory  ')).toBe('Factory.sptrak')
    })
  })

  describe('extractFactoryNameFromFilename', () => {
    it('removes .sptrak extension', () => {
      expect(extractFactoryNameFromFilename('My_Factory.sptrak')).toBe('My Factory')
    })

    it('replaces underscores with spaces', () => {
      expect(extractFactoryNameFromFilename('Steel_Production_Plant.sptrak')).toBe(
        'Steel Production Plant',
      )
    })

    it('handles case-insensitive extension', () => {
      expect(extractFactoryNameFromFilename('Factory.SPTRAK')).toBe('Factory')
      expect(extractFactoryNameFromFilename('Factory.SpTrAk')).toBe('Factory')
    })

    it('handles filename without extension', () => {
      expect(extractFactoryNameFromFilename('My_Factory')).toBe('My Factory')
    })
  })

  describe('roundtrip serialization', () => {
    it('deserializes back to original factory', () => {
      const serialized = serializeSptrak(
        TEST_FACTORY,
        TEST_INSTANCE_ID,
        TEST_NAMESPACE,
        TEST_DISPLAY_ID,
      )
      const deserialized = deserializeSptrak(serialized)

      expect(deserialized.factory).toEqual(TEST_FACTORY)
      expect(deserialized.metadata.instanceId).toBe(TEST_INSTANCE_ID)
      expect(deserialized.metadata.namespace).toBe(TEST_NAMESPACE)
      expect(deserialized.metadata.displayId).toBe(TEST_DISPLAY_ID)
    })
  })
})
