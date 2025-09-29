import { describe, it, expect } from 'vitest'
import { asFactory, parseFactoriesFromJson, FACTORY_PARSE_ERRORS, type Factory } from './factory'

describe('asFactory', () => {
  const validFactory: Factory = {
    name: 'Test Factory',
    icon: 'test-icon',
    floors: [
      {
        name: 'Floor 1',
        iconItem: 'floor-icon',
        recipes: [],
      },
    ],
    recipeLinks: {},
  }

  it('should return a valid factory when given correct data', () => {
    const result = asFactory(validFactory)
    expect(result).toEqual(validFactory)
  })

  it('should throw error when data is null', () => {
    expect(() => asFactory(null)).toThrow(FACTORY_PARSE_ERRORS.MUST_BE_OBJECT)
  })

  it('should throw error when data is not an object', () => {
    expect(() => asFactory('string')).toThrow(FACTORY_PARSE_ERRORS.MUST_BE_OBJECT)
    expect(() => asFactory(123)).toThrow(FACTORY_PARSE_ERRORS.MUST_BE_OBJECT)
    expect(() => asFactory([])).toThrow(FACTORY_PARSE_ERRORS.MUST_BE_OBJECT)
  })

  it('should throw error when missing required properties', () => {
    expect(() => asFactory({})).toThrow(FACTORY_PARSE_ERRORS.MISSING_ATTRIBUTES)

    expect(() => asFactory({ name: 'Test' })).toThrow(FACTORY_PARSE_ERRORS.MISSING_ATTRIBUTES)

    expect(() =>
      asFactory({
        name: 'Test',
        icon: 'icon',
        floors: [],
      }),
    ).toThrow(FACTORY_PARSE_ERRORS.MISSING_ATTRIBUTES)
  })

  it('should throw error when name is not a string', () => {
    const invalidFactory = { ...validFactory, name: 123 }
    expect(() => asFactory(invalidFactory)).toThrow(
      FACTORY_PARSE_ERRORS.MISSING_NAME_OR_ICON('123'),
    )
  })

  it('should throw error when icon is not a string', () => {
    const invalidFactory = { ...validFactory, icon: 123 }
    expect(() => asFactory(invalidFactory)).toThrow(
      FACTORY_PARSE_ERRORS.MISSING_NAME_OR_ICON('Test Factory'),
    )
  })

  it('should throw error when floors is not an array', () => {
    const invalidFactory = { ...validFactory, floors: 'not-array' }
    expect(() => asFactory(invalidFactory)).toThrow(
      FACTORY_PARSE_ERRORS.MUST_HAVE_FLOORS_ARRAY('Test Factory'),
    )
  })

  it('should throw error when recipeLinks is not an object', () => {
    const invalidFactory = { ...validFactory, recipeLinks: 'not-object' }
    expect(() => asFactory(invalidFactory)).toThrow(
      FACTORY_PARSE_ERRORS.MUST_HAVE_RECIPE_LINKS('Test Factory'),
    )
  })

  it('should throw error when recipeLinks is null', () => {
    const invalidFactory = { ...validFactory, recipeLinks: null }
    expect(() => asFactory(invalidFactory)).toThrow(
      FACTORY_PARSE_ERRORS.MUST_HAVE_RECIPE_LINKS('Test Factory'),
    )
  })

  it('should accept factory with empty floors array', () => {
    const factoryWithEmptyFloors = { ...validFactory, floors: [] }
    const result = asFactory(factoryWithEmptyFloors)
    expect(result.floors).toEqual([])
  })

  it('should accept factory with empty recipeLinks object', () => {
    const factoryWithEmptyLinks = { ...validFactory, recipeLinks: {} }
    const result = asFactory(factoryWithEmptyLinks)
    expect(result.recipeLinks).toEqual({})
  })
})

describe('parseFactoriesFromJson', () => {
  const validFactoryData = {
    'Factory 1': {
      name: 'Factory 1',
      icon: 'icon1',
      floors: [],
      recipeLinks: {},
    },
    'Factory 2': {
      name: 'Factory 2',
      icon: 'icon2',
      floors: [{ name: 'Floor 1', recipes: [] }],
      recipeLinks: { recipe1: true },
    },
  }

  it('should return empty object for empty string', () => {
    expect(parseFactoriesFromJson('')).toEqual({})
    expect(parseFactoriesFromJson('   ')).toEqual({})
  })

  it('should parse valid factory JSON correctly', () => {
    const jsonString = JSON.stringify(validFactoryData)
    const result = parseFactoriesFromJson(jsonString)

    expect(Object.keys(result)).toHaveLength(2)
    expect(result['Factory 1']).toEqual(validFactoryData['Factory 1'])
    expect(result['Factory 2']).toEqual(validFactoryData['Factory 2'])
  })

  it('should throw error for invalid JSON', () => {
    expect(() => parseFactoriesFromJson('invalid json')).toThrow()
    expect(() => parseFactoriesFromJson('{"incomplete": ')).toThrow()
  })

  it('should throw error when JSON is not an object', () => {
    expect(() => parseFactoriesFromJson('"string"')).toThrow(
      FACTORY_PARSE_ERRORS.IMPORT_DATA_MUST_BE_OBJECT,
    )
    expect(() => parseFactoriesFromJson('123')).toThrow(
      FACTORY_PARSE_ERRORS.IMPORT_DATA_MUST_BE_OBJECT,
    )
    expect(() => parseFactoriesFromJson('[]')).toThrow(
      FACTORY_PARSE_ERRORS.IMPORT_DATA_MUST_BE_OBJECT,
    )
    expect(() => parseFactoriesFromJson('true')).toThrow(
      FACTORY_PARSE_ERRORS.IMPORT_DATA_MUST_BE_OBJECT,
    )
    expect(() => parseFactoriesFromJson('null')).toThrow(
      FACTORY_PARSE_ERRORS.IMPORT_DATA_MUST_BE_OBJECT,
    )
  })

  it('should throw error when factory data is invalid', () => {
    const invalidData = {
      'Factory 1': {
        name: 'Factory 1',
        // missing required properties
      },
    }

    expect(() => parseFactoriesFromJson(JSON.stringify(invalidData))).toThrow(
      FACTORY_PARSE_ERRORS.MISSING_ATTRIBUTES,
    )
  })

  it('should handle single factory', () => {
    const singleFactory = {
      'My Factory': validFactoryData['Factory 1'],
    }

    const result = parseFactoriesFromJson(JSON.stringify(singleFactory))
    expect(Object.keys(result)).toHaveLength(1)
    expect(result['My Factory']).toEqual(validFactoryData['Factory 1'])
  })

  it('should validate all factories in the collection', () => {
    const mixedData = {
      'Valid Factory': validFactoryData['Factory 1'],
      'Invalid Factory': {
        name: 'Invalid',
        // missing icon, floors, recipeLinks
      },
    }

    expect(() => parseFactoriesFromJson(JSON.stringify(mixedData))).toThrow(
      FACTORY_PARSE_ERRORS.MISSING_ATTRIBUTES,
    )
  })
})
