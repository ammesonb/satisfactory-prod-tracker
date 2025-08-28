import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import type {
  GameData,
  Item,
  Recipe,
  RecipeIngredient,
  RecipeProduct,
  Building,
} from '@/types/data'

function loadGameData(): GameData {
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const dataPath = path.join(dirname, '../../../public/data.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  return JSON.parse(rawData) as GameData
}

function analyzeItems(items: Record<string, Item>) {
  for (const [key, value] of Object.entries(items)) {
    if (key.startsWith('Desc_')) {
      console.log(`${key}: {name: '${value.name}'},`)
    }
  }
}

function analyzeBuildings(buildings: Record<string, Building>) {
  for (const [key, building] of Object.entries(buildings)) {
    if (key.startsWith('Desc_') && building?.metadata?.manufacturingSpeed > 0) {
      console.log(`${key}: {name: '${building.name}'},`)
    }
  }
}

function analyzeRecipes(recipes: Record<string, Recipe>) {
  for (const [key, value] of Object.entries(recipes)) {
    if (value.forBuilding) {
      continue
    }

    const craftsPerMin = 60 / value.time

    console.log(`${key}: {
      name: '${value.name}',
      ingredients: [
      ${value.ingredients
        .map(
          (ingredient: RecipeIngredient) => ` {
        item: '${ingredient.item}',
        amount: ${ingredient.amount * craftsPerMin}
      }`,
        )
        .join(', ')}],
      products: [
      ${value.products
        .map(
          (product: RecipeProduct) => ` {
        item: '${product.item}',
        amount: ${product.amount * craftsPerMin}
      }`,
        )
        .join(', ')}],
    },`)
  }
}

function main() {
  // Get command line arguments
  const args = process.argv.slice(2)
  const dataType = args[0]?.toLowerCase()

  try {
    const gameData = loadGameData()

    if (dataType === 'items') {
      analyzeItems(gameData.items)
    } else if (dataType === 'recipes') {
      analyzeRecipes(gameData.recipes)
    } else if (dataType === 'buildings') {
      analyzeBuildings(gameData.buildings)
    } else {
      console.error('Please specify "items", "recipes", or "buildings" as the first argument')
      process.exit(1)
    }
  } catch (error) {
    console.error('Error analyzing data:', error)
    process.exit(1)
  }
}

main()
