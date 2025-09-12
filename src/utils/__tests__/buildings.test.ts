import { describe, it, expect, vi } from 'vitest'
import type { ItemOption } from '@/types/data'

// Mock the cache module to test the core logic without memoization
vi.mock('../cache', () => ({
  memoize: vi.fn((fn) => fn), // Return the function unwrapped for testing
}))

// Import after mocking
import { buildingsToOptions } from '../buildings'

describe('buildings utilities', () => {
  // Helper to create mock building data
  const createMockBuilding = (name: string, icon?: string) => ({
    name,
    ...(icon && { icon }),
  })

  // Helper to verify option structure
  const expectValidBuildingOption = (
    option: ItemOption,
    expectedValue: string,
    expectedName: string,
    expectedIcon: string,
  ) => {
    expect(option).toEqual({
      value: expectedValue,
      name: expectedName,
      icon: expectedIcon,
      type: 'building',
    })
    expect(typeof option.value).toBe('string')
    expect(typeof option.name).toBe('string')
    expect(typeof option.icon).toBe('string')
    expect(option.type).toBe('building')
  }

  describe('buildingsToOptions', () => {
    describe('basic functionality', () => {
      it('should convert buildings with icons to ItemOptions', () => {
        const building1 = {
          className: 'Desc_SmelterMk1_C',
          name: 'Smelter Mk.1',
          icon: '/icons/smelter-mk1.png',
        }
        const building2 = {
          className: 'Desc_ConstructorMk1_C',
          name: 'Constructor',
          icon: '/icons/constructor.png',
        }
        const building3 = {
          className: 'Desc_AssemblerMk1_C',
          name: 'Assembler Mk.1',
          icon: '/icons/assembler-mk1.png',
        }

        const buildings = {
          [building1.className]: createMockBuilding(building1.name, building1.icon),
          [building2.className]: createMockBuilding(building2.name, building2.icon),
          [building3.className]: createMockBuilding(building3.name, building3.icon),
        }

        const result = buildingsToOptions(buildings)

        expect(result).toHaveLength(3)
        expectValidBuildingOption(result[0], building1.className, building1.name, building1.icon)
        expectValidBuildingOption(result[1], building2.className, building2.name, building2.icon)
        expectValidBuildingOption(result[2], building3.className, building3.name, building3.icon)
      })

      it('should filter out buildings without icons', () => {
        const validBuilding1 = {
          className: 'Desc_SmelterMk1_C',
          name: 'Smelter Mk.1',
          icon: '/icons/smelter-mk1.png',
        }
        const invalidBuilding1 = { className: 'Desc_WithoutIcon_C', name: 'No Icon Building' }
        const validBuilding2 = {
          className: 'Desc_ConstructorMk1_C',
          name: 'Constructor',
          icon: '/icons/constructor.png',
        }
        const invalidBuilding2 = { className: 'Desc_EmptyIcon_C', name: 'Empty Icon', icon: '' }

        const buildings = {
          [validBuilding1.className]: createMockBuilding(validBuilding1.name, validBuilding1.icon),
          [invalidBuilding1.className]: createMockBuilding(invalidBuilding1.name), // No icon property
          [validBuilding2.className]: createMockBuilding(validBuilding2.name, validBuilding2.icon),
          [invalidBuilding2.className]: createMockBuilding(
            invalidBuilding2.name,
            invalidBuilding2.icon,
          ), // Empty icon
        }

        const result = buildingsToOptions(buildings)

        expect(result).toHaveLength(2) // Only buildings with non-empty icons
        expectValidBuildingOption(
          result[0],
          validBuilding1.className,
          validBuilding1.name,
          validBuilding1.icon,
        )
        expectValidBuildingOption(
          result[1],
          validBuilding2.className,
          validBuilding2.name,
          validBuilding2.icon,
        )
      })

      it('should handle empty buildings object', () => {
        const buildings = {}
        const result = buildingsToOptions(buildings)

        expect(result).toEqual([])
        expect(Array.isArray(result)).toBe(true)
      })

      it('should handle single building', () => {
        const building = {
          className: 'Desc_SmelterMk1_C',
          name: 'Smelter Mk.1',
          icon: '/icons/smelter-mk1.png',
        }
        const buildings = {
          [building.className]: createMockBuilding(building.name, building.icon),
        }

        const result = buildingsToOptions(buildings)

        expect(result).toHaveLength(1)
        expectValidBuildingOption(result[0], building.className, building.name, building.icon)
      })
    })

    describe('edge cases', () => {
      it('should handle buildings with special characters in names', () => {
        const building1 = {
          className: 'Desc_Special_C',
          name: 'Building with "quotes" & symbols!',
          icon: '/icons/special.png',
        }
        const building2 = {
          className: 'Desc_Unicode_C',
          name: 'Building with émojis 🏭',
          icon: '/icons/unicode.png',
        }

        const buildings = {
          [building1.className]: createMockBuilding(building1.name, building1.icon),
          [building2.className]: createMockBuilding(building2.name, building2.icon),
        }

        const result = buildingsToOptions(buildings)

        expect(result).toHaveLength(2)
        expectValidBuildingOption(result[0], building1.className, building1.name, building1.icon)
        expectValidBuildingOption(result[1], building2.className, building2.name, building2.icon)
      })

      it('should handle various icon path formats', () => {
        const testBuildings = [
          { className: 'Desc_Relative_C', name: 'Relative Path', icon: 'icons/relative.png' },
          { className: 'Desc_Absolute_C', name: 'Absolute Path', icon: '/icons/absolute.png' },
          { className: 'Desc_HTTP_C', name: 'HTTP URL', icon: 'http://example.com/icon.png' },
          { className: 'Desc_HTTPS_C', name: 'HTTPS URL', icon: 'https://example.com/icon.png' },
          {
            className: 'Desc_Data_C',
            name: 'Data URL',
            icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          },
        ]

        const buildings = Object.fromEntries(
          testBuildings.map((building) => [
            building.className,
            createMockBuilding(building.name, building.icon),
          ]),
        )

        const result = buildingsToOptions(buildings)

        expect(result).toHaveLength(testBuildings.length)
        result.forEach((option) => {
          expect(option.type).toBe('building')
          expect(typeof option.icon).toBe('string')
          expect(option.icon.length).toBeGreaterThan(0)
        })
      })

      it('should handle buildings with undefined, null, or falsy icon values', () => {
        const validBuilding = {
          className: 'Desc_Valid_C',
          name: 'Valid Building',
          icon: '/icons/valid.png',
        }
        const invalidBuildings = [
          { className: 'Desc_Undefined_C', name: 'Undefined Icon', icon: undefined },
          { className: 'Desc_Null_C', name: 'Null Icon', icon: null },
          { className: 'Desc_False_C', name: 'False Icon', icon: false },
          { className: 'Desc_Zero_C', name: 'Zero Icon', icon: 0 },
        ]

        const buildings = {
          [validBuilding.className]: createMockBuilding(validBuilding.name, validBuilding.icon),
          ...Object.fromEntries(
            invalidBuildings.map((building) => [
              building.className,
              { name: building.name, icon: building.icon },
            ]),
          ),
        } as Record<string, { name: string; icon?: string }>

        const result = buildingsToOptions(buildings)

        // Only the valid building should be included
        expect(result).toHaveLength(1)
        expectValidBuildingOption(
          result[0],
          validBuilding.className,
          validBuilding.name,
          validBuilding.icon,
        )
      })

      it('should preserve original key-value relationships', () => {
        const buildingA = { className: 'Building_A', name: 'First Building', icon: '/icon-a.png' }
        const buildingB = { className: 'Building_B', name: 'Second Building', icon: '/icon-b.png' }
        const buildingC = { className: 'Building_C', name: 'Third Building', icon: '/icon-c.png' }
        const expectedLength = 3

        const buildings = {
          [buildingA.className]: createMockBuilding(buildingA.name, buildingA.icon),
          [buildingB.className]: createMockBuilding(buildingB.name, buildingB.icon),
          [buildingC.className]: createMockBuilding(buildingC.name, buildingC.icon),
        }

        const result = buildingsToOptions(buildings)

        expect(result).toHaveLength(expectedLength)

        // Verify that each option uses the correct key as value
        const optionA = result.find((opt) => opt.value === buildingA.className)
        const optionB = result.find((opt) => opt.value === buildingB.className)
        const optionC = result.find((opt) => opt.value === buildingC.className)

        expect(optionA).toBeDefined()
        expect(optionB).toBeDefined()
        expect(optionC).toBeDefined()

        expect(optionA?.name).toBe(buildingA.name)
        expect(optionB?.name).toBe(buildingB.name)
        expect(optionC?.name).toBe(buildingC.name)
      })
    })

    describe('result structure validation', () => {
      it('should return array of objects with correct ItemOption structure', () => {
        const testBuilding = {
          className: 'Test_Building_C',
          name: 'Test Building',
          icon: '/test-icon.png',
        }
        const expectedKeys = ['value', 'name', 'icon', 'type']
        const expectedType = 'building'
        const expectedLength = 1

        const buildings = {
          [testBuilding.className]: createMockBuilding(testBuilding.name, testBuilding.icon),
        }

        const result = buildingsToOptions(buildings)

        expect(Array.isArray(result)).toBe(true)
        expect(result).toHaveLength(expectedLength)

        const option = result[0]

        // Check all required properties exist
        expectedKeys.forEach((key) => {
          expect(option).toHaveProperty(key)
        })

        // Check property types
        expect(typeof option.value).toBe('string')
        expect(typeof option.name).toBe('string')
        expect(typeof option.icon).toBe('string')
        expect(option.type).toBe(expectedType)

        // Check no extra properties
        const actualKeys = Object.keys(option)
        expect(actualKeys.sort()).toEqual(expectedKeys.sort())
      })

      it('should maintain type consistency across multiple buildings', () => {
        const firstBuilding = { className: 'Building1', name: 'First', icon: '/icon1.png' }
        const secondBuilding = { className: 'Building2', name: 'Second', icon: '/icon2.png' }
        const thirdBuilding = { className: 'Building3', name: 'Third', icon: '/icon3.png' }
        const testBuildings = [firstBuilding, secondBuilding, thirdBuilding]
        const expectedLength = 3

        const buildings = Object.fromEntries(
          testBuildings.map((building) => [
            building.className,
            createMockBuilding(building.name, building.icon),
          ]),
        )

        const result = buildingsToOptions(buildings)

        expect(result).toHaveLength(expectedLength)

        result.forEach((option, index) => {
          const expectedBuilding = testBuildings[index]
          expectValidBuildingOption(
            option,
            expectedBuilding.className,
            expectedBuilding.name,
            expectedBuilding.icon,
          )
        })
      })
    })

    describe('performance and large datasets', () => {
      it('should handle large number of buildings efficiently', () => {
        const buildingCount = 1000
        const expectedType = 'building'
        const buildings: Record<string, { name: string; icon?: string }> = {}

        // Create a large dataset
        for (let i = 0; i < buildingCount; i++) {
          const className = `Building_${i}`
          buildings[className] = createMockBuilding(`Building ${i}`, `/icon-${i}.png`)
        }

        const result = buildingsToOptions(buildings)

        expect(result).toHaveLength(buildingCount)
        expect(result[0].type).toBe(expectedType)
        expect(result[buildingCount - 1].type).toBe(expectedType)
      })

      it('should handle mixed valid and invalid buildings in large dataset', () => {
        const validBuildingCount = 100
        const invalidBuildingCount = 50
        const expectedType = 'building'
        const validBuildingPattern = /^Valid_\d+$/
        const buildings: Record<string, { name: string; icon?: string }> = {}

        // Add valid buildings
        for (let i = 0; i < validBuildingCount; i++) {
          const className = `Valid_${i}`
          buildings[className] = createMockBuilding(`Valid Building ${i}`, `/icon-${i}.png`)
        }

        // Add invalid buildings (no icon)
        for (let i = 0; i < invalidBuildingCount; i++) {
          const className = `Invalid_${i}`
          buildings[className] = createMockBuilding(`Invalid Building ${i}`)
        }

        const result = buildingsToOptions(buildings)

        // Only valid buildings should be included
        expect(result).toHaveLength(validBuildingCount)
        result.forEach((option) => {
          expect(option.type).toBe(expectedType)
          expect(option.value).toMatch(validBuildingPattern)
        })
      })
    })
  })
})
