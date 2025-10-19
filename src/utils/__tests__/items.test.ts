import { describe, expect, it, vi } from 'vitest'

import type { Item, ItemOption } from '@/types/data'
import type { IDataStore } from '@/types/stores'

// Mock the cache module to test the core logic without memoization
vi.mock('../cache', () => ({
  memoize: vi.fn((fn) => fn), // Return the function unwrapped for testing
}))

// Import after mocking
import { getItemDetails, itemsToOptions } from '../items'

describe('items utilities', () => {
  // Helper to create mock item data
  const createMockItem = (name: string, className: string, icon?: string): Item => ({
    slug: className
      .toLowerCase()
      .replace(/^desc_/, '')
      .replace(/_c$/, ''),
    icon: icon || `/icons/${className.toLowerCase()}.png`,
    name,
    description: `Description for ${name}`,
    sinkPoints: 1,
    className,
    stackSize: 100,
    energyValue: 0,
    radioactiveDecay: 0,
    liquid: false,
    fluidColor: { r: 0, g: 0, b: 0, a: 1 },
  })

  // Helper to create mock data store
  const createMockDataStore = (items: Record<string, Item>): IDataStore => {
    return {
      items,
      recipes: {},
      buildings: {},
      getItemDisplayName: vi.fn((itemName: string) => items[itemName]?.name || itemName),
      getRecipeDisplayName: vi.fn(),
      getBuildingDisplayName: vi.fn(),
      getRecipeProductionBuildings: vi.fn(),
      recipeIngredients: vi.fn(),
      recipeProducts: vi.fn(),
      getIcon: vi.fn(
        (objectName: string) => items[objectName]?.icon || `/default/${objectName}.png`,
      ),
      loadData: vi.fn(),
    } as IDataStore
  }

  // Helper to verify option structure
  const expectValidItemOption = (
    option: ItemOption,
    expectedValue: string,
    expectedName: string,
    expectedIcon: string,
  ) => {
    expect(option).toEqual({
      value: expectedValue,
      name: expectedName,
      icon: expectedIcon,
      type: 'item',
    })
    expect(typeof option.value).toBe('string')
    expect(typeof option.name).toBe('string')
    expect(typeof option.icon).toBe('string')
    expect(option.type).toBe('item')
  }

  describe('getItemDetails', () => {
    describe('basic functionality', () => {
      it('should return item details for existing item', () => {
        const testItemData = {
          name: 'Iron Ore',
          className: 'Desc_OreIron_C',
          icon: '/icons/iron-ore.png',
        }
        const mockItem = createMockItem(
          testItemData.name,
          testItemData.className,
          testItemData.icon,
        )
        const items = { [testItemData.className]: mockItem }
        const dataStore = createMockDataStore(items)

        const result = getItemDetails(dataStore, testItemData.className)

        expect(result).toEqual({
          item: mockItem,
          displayName: testItemData.name,
          icon: testItemData.icon,
        })

        expect(dataStore.getItemDisplayName).toHaveBeenCalledWith(testItemData.className)
        expect(dataStore.getIcon).toHaveBeenCalledWith(testItemData.className)
      })

      it('should return complete item object with all properties', () => {
        const testItemData = {
          name: 'Copper Ingot',
          className: 'Desc_CopperIngot_C',
        }
        const mockItem = createMockItem(testItemData.name, testItemData.className)
        const items = { [testItemData.className]: mockItem }
        const dataStore = createMockDataStore(items)

        const result = getItemDetails(dataStore, testItemData.className)

        expect(result.item).toBe(mockItem)
        expect(result.item).toHaveProperty('slug')
        expect(result.item).toHaveProperty('icon')
        expect(result.item).toHaveProperty('name')
        expect(result.item).toHaveProperty('description')
        expect(result.item).toHaveProperty('className')
        expect(result.item).toHaveProperty('stackSize')
      })

      it('should call dataStore methods with correct parameters', () => {
        const testItemData = {
          name: 'Steel Ingot',
          className: 'Desc_SteelIngot_C',
        }
        const mockItem = createMockItem(testItemData.name, testItemData.className)
        const items = { [testItemData.className]: mockItem }
        const dataStore = createMockDataStore(items)

        getItemDetails(dataStore, testItemData.className)

        expect(dataStore.getItemDisplayName).toHaveBeenCalledTimes(1)
        expect(dataStore.getItemDisplayName).toHaveBeenCalledWith(testItemData.className)
        expect(dataStore.getIcon).toHaveBeenCalledTimes(1)
        expect(dataStore.getIcon).toHaveBeenCalledWith(testItemData.className)
      })
    })

    describe('error handling', () => {
      it('should throw error for non-existent item', () => {
        const nonExistentClassName = 'NonExistent_Item_C'
        const dataStore = createMockDataStore({})

        expect(() => getItemDetails(dataStore, nonExistentClassName)).toThrow(
          `Item not found: ${nonExistentClassName}`,
        )
      })

      it('should throw error with correct item name in message', () => {
        const missingClassName = 'Desc_MissingItem_C'
        const dataStore = createMockDataStore({})

        expect(() => getItemDetails(dataStore, missingClassName)).toThrow(
          `Item not found: ${missingClassName}`,
        )
      })

      it('should not call display methods if item does not exist', () => {
        const nonExistentClassName = 'NonExistent_C'
        const dataStore = createMockDataStore({})

        expect(() => getItemDetails(dataStore, nonExistentClassName)).toThrow()
        expect(dataStore.getItemDisplayName).not.toHaveBeenCalled()
        expect(dataStore.getIcon).not.toHaveBeenCalled()
      })
    })

    describe('edge cases', () => {
      it('should handle items with special characters in names', () => {
        const specialItemData = {
          name: 'Item with "quotes" & symbols!',
          className: 'Desc_Special_C',
        }
        const mockItem = createMockItem(specialItemData.name, specialItemData.className)
        const items = { [specialItemData.className]: mockItem }
        const dataStore = createMockDataStore(items)

        const result = getItemDetails(dataStore, specialItemData.className)

        expect(result.displayName).toBe(specialItemData.name)
        expect(result.item.name).toBe(specialItemData.name)
      })

      it('should handle empty or undefined item properties gracefully', () => {
        const emptyItemData = {
          name: '',
          className: 'Desc_Empty_C',
          icon: '',
        }
        const mockItem = createMockItem(
          emptyItemData.name,
          emptyItemData.className,
          emptyItemData.icon,
        )
        const items = { [emptyItemData.className]: mockItem }
        const dataStore = createMockDataStore(items)

        const result = getItemDetails(dataStore, emptyItemData.className)

        expect(result.item).toBe(mockItem)
        expect(typeof result.displayName).toBe('string')
        expect(typeof result.icon).toBe('string')
      })
    })
  })

  describe('itemsToOptions', () => {
    describe('basic functionality', () => {
      it('should convert items with icons to ItemOptions', () => {
        const ironOreItem = {
          className: 'Desc_OreIron_C',
          name: 'Iron Ore',
          icon: '/icons/iron-ore.png',
        }
        const copperOreItem = {
          className: 'Desc_OreCopper_C',
          name: 'Copper Ore',
          icon: '/icons/copper-ore.png',
        }
        const coalItem = { className: 'Desc_Coal_C', name: 'Coal', icon: '/icons/coal.png' }

        const items = {
          [ironOreItem.className]: { name: ironOreItem.name, icon: ironOreItem.icon },
          [copperOreItem.className]: { name: copperOreItem.name, icon: copperOreItem.icon },
          [coalItem.className]: { name: coalItem.name, icon: coalItem.icon },
        }

        const result = itemsToOptions(items)

        expect(result).toHaveLength(3)
        expectValidItemOption(result[0], ironOreItem.className, ironOreItem.name, ironOreItem.icon)
        expectValidItemOption(
          result[1],
          copperOreItem.className,
          copperOreItem.name,
          copperOreItem.icon,
        )
        expectValidItemOption(result[2], coalItem.className, coalItem.name, coalItem.icon)
      })

      it('should filter out items without icons', () => {
        const validIronItem = {
          className: 'Desc_OreIron_C',
          name: 'Iron Ore',
          icon: '/icons/iron-ore.png',
        }
        const invalidNoIconItem = { className: 'Desc_WithoutIcon_C', name: 'No Icon Item' }
        const validCopperItem = {
          className: 'Desc_OreCopper_C',
          name: 'Copper Ore',
          icon: '/icons/copper-ore.png',
        }
        const invalidEmptyIconItem = { className: 'Desc_EmptyIcon_C', name: 'Empty Icon', icon: '' }

        const items = {
          [validIronItem.className]: { name: validIronItem.name, icon: validIronItem.icon },
          [invalidNoIconItem.className]: { name: invalidNoIconItem.name }, // No icon property
          [validCopperItem.className]: { name: validCopperItem.name, icon: validCopperItem.icon },
          [invalidEmptyIconItem.className]: {
            name: invalidEmptyIconItem.name,
            icon: invalidEmptyIconItem.icon,
          }, // Empty icon
        }

        const result = itemsToOptions(items)

        expect(result).toHaveLength(2) // Only items with non-empty icons
        expectValidItemOption(
          result[0],
          validIronItem.className,
          validIronItem.name,
          validIronItem.icon,
        )
        expectValidItemOption(
          result[1],
          validCopperItem.className,
          validCopperItem.name,
          validCopperItem.icon,
        )
      })

      it('should handle empty items object', () => {
        const items = {}
        const result = itemsToOptions(items)

        expect(result).toEqual([])
        expect(Array.isArray(result)).toBe(true)
      })

      it('should handle single item', () => {
        const singleItem = {
          className: 'Desc_OreIron_C',
          name: 'Iron Ore',
          icon: '/icons/iron-ore.png',
        }
        const items = {
          [singleItem.className]: { name: singleItem.name, icon: singleItem.icon },
        }

        const result = itemsToOptions(items)

        expect(result).toHaveLength(1)
        expectValidItemOption(result[0], singleItem.className, singleItem.name, singleItem.icon)
      })
    })

    describe('edge cases', () => {
      it('should handle items with special characters in names', () => {
        const specialCharItem = {
          className: 'Desc_Special_C',
          name: 'Item with "quotes" & symbols!',
          icon: '/icons/special.png',
        }
        const unicodeItem = {
          className: 'Desc_Unicode_C',
          name: 'Item with émojis 🔧',
          icon: '/icons/unicode.png',
        }

        const items = {
          [specialCharItem.className]: { name: specialCharItem.name, icon: specialCharItem.icon },
          [unicodeItem.className]: { name: unicodeItem.name, icon: unicodeItem.icon },
        }

        const result = itemsToOptions(items)

        expect(result).toHaveLength(2)
        expectValidItemOption(
          result[0],
          specialCharItem.className,
          specialCharItem.name,
          specialCharItem.icon,
        )
        expectValidItemOption(result[1], unicodeItem.className, unicodeItem.name, unicodeItem.icon)
      })

      it('should handle various icon path formats', () => {
        const testItems = [
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

        const items = Object.fromEntries(
          testItems.map((item) => [item.className, { name: item.name, icon: item.icon }]),
        )

        const result = itemsToOptions(items)

        expect(result).toHaveLength(testItems.length)
        result.forEach((option) => {
          expect(option.type).toBe('item')
          expect(typeof option.icon).toBe('string')
          expect(option.icon.length).toBeGreaterThan(0)
        })
      })

      it('should handle items with undefined, null, or falsy icon values', () => {
        const validItem = {
          className: 'Desc_Valid_C',
          name: 'Valid Item',
          icon: '/icons/valid.png',
        }
        const undefinedIconItem = {
          className: 'Desc_Undefined_C',
          name: 'Undefined Icon',
          icon: undefined,
        }
        const nullIconItem = { className: 'Desc_Null_C', name: 'Null Icon', icon: null }
        const falseIconItem = { className: 'Desc_False_C', name: 'False Icon', icon: false }
        const zeroIconItem = { className: 'Desc_Zero_C', name: 'Zero Icon', icon: 0 }
        const invalidItems = [undefinedIconItem, nullIconItem, falseIconItem, zeroIconItem]

        const items = {
          [validItem.className]: { name: validItem.name, icon: validItem.icon },
          ...Object.fromEntries(
            invalidItems.map((item) => [item.className, { name: item.name, icon: item.icon }]),
          ),
        } as Record<string, { name: string; icon?: string }>

        const result = itemsToOptions(items)
        const expectedValidCount = 1

        expect(result).toHaveLength(expectedValidCount)
        expectValidItemOption(result[0], validItem.className, validItem.name, validItem.icon)
      })

      it('should preserve original key-value relationships', () => {
        const firstItem = { className: 'Item_A', name: 'First Item', icon: '/icon-a.png' }
        const secondItem = { className: 'Item_B', name: 'Second Item', icon: '/icon-b.png' }
        const thirdItem = { className: 'Item_C', name: 'Third Item', icon: '/icon-c.png' }
        const testItems = [firstItem, secondItem, thirdItem]

        const items = Object.fromEntries(
          testItems.map((item) => [item.className, { name: item.name, icon: item.icon }]),
        )

        const result = itemsToOptions(items)

        expect(result).toHaveLength(testItems.length)

        // Verify that each option uses the correct key as value
        testItems.forEach((testItem) => {
          const option = result.find((opt) => opt.value === testItem.className)
          expect(option).toBeDefined()
          expect(option?.name).toBe(testItem.name)
          expect(option?.icon).toBe(testItem.icon)
        })
      })
    })

    describe('result structure validation', () => {
      it('should return array of objects with correct ItemOption structure', () => {
        const testItem = { className: 'Test_Item_C', name: 'Test Item', icon: '/test-icon.png' }
        const expectedKeys = ['value', 'name', 'icon', 'type']
        const items = {
          [testItem.className]: { name: testItem.name, icon: testItem.icon },
        }

        const result = itemsToOptions(items)
        const expectedLength = 1
        const expectedType = 'item'

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

      it('should maintain type consistency across multiple items', () => {
        const firstTestItem = { className: 'Item1', name: 'First', icon: '/icon1.png' }
        const secondTestItem = { className: 'Item2', name: 'Second', icon: '/icon2.png' }
        const thirdTestItem = { className: 'Item3', name: 'Third', icon: '/icon3.png' }
        const testItems = [firstTestItem, secondTestItem, thirdTestItem]

        const items = Object.fromEntries(
          testItems.map((item) => [item.className, { name: item.name, icon: item.icon }]),
        )

        const result = itemsToOptions(items)

        expect(result).toHaveLength(testItems.length)

        result.forEach((option, index) => {
          const testItem = testItems[index]
          expectValidItemOption(option, testItem.className, testItem.name, testItem.icon)
        })
      })
    })

    describe('performance and large datasets', () => {
      it('should handle large number of items efficiently', () => {
        // Create a large dataset
        const items: Record<string, { name: string; icon: string }> = {}
        for (let i = 0; i < 1000; i++) {
          const className = `Item_${i}`
          items[className] = { name: `Item ${i}`, icon: `/icon-${i}.png` }
        }

        const result = itemsToOptions(items)

        expect(result).toHaveLength(1000)
        expect(result[0].type).toBe('item')
        expect(result[999].type).toBe('item')
      })

      it('should handle mixed valid and invalid items in large dataset', () => {
        const items: Record<string, { name: string; icon?: string }> = {}

        // Add 100 valid items
        for (let i = 0; i < 100; i++) {
          const className = `Valid_${i}`
          items[className] = { name: `Valid Item ${i}`, icon: `/icon-${i}.png` }
        }

        // Add 50 invalid items (no icon)
        for (let i = 0; i < 50; i++) {
          const className = `Invalid_${i}`
          items[className] = { name: `Invalid Item ${i}` }
        }

        const result = itemsToOptions(items)

        // Only valid items should be included
        expect(result).toHaveLength(100)
        result.forEach((option) => {
          expect(option.type).toBe('item')
          expect(option.value).toMatch(/^Valid_\d+$/)
        })
      })
    })
  })

  describe('integration between getItemDetails and itemsToOptions', () => {
    it('should work together for consistent item handling', () => {
      const integrationTestData = {
        name: 'Iron Ore',
        className: 'Desc_OreIron_C',
        icon: '/icons/iron-ore.png',
      }
      const mockItem = createMockItem(
        integrationTestData.name,
        integrationTestData.className,
        integrationTestData.icon,
      )
      const items = { [integrationTestData.className]: mockItem }
      const dataStore = createMockDataStore(items)

      // Get item details
      const details = getItemDetails(dataStore, integrationTestData.className)

      // Convert to options
      const simpleItems = {
        [integrationTestData.className]: { name: mockItem.name, icon: mockItem.icon },
      }
      const options = itemsToOptions(simpleItems)

      // Both should reference the same item consistently
      expect(details.item.className).toBe(integrationTestData.className)
      expect(options[0].value).toBe(integrationTestData.className)
      expect(details.displayName).toBe(options[0].name)
      expect(details.icon).toBe(options[0].icon)
    })
  })
})
