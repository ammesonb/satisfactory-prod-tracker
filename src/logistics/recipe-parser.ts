import type { Recipe } from '@/types/factory'

export const parseRecipeString = (recipeString: string): Recipe => {
  recipeString = recipeString.replace(/"/g, '')
  const amount = Number(recipeString.split(': ')[1].trim())
  const [recipeName, buildingName] = recipeString.split('#', 2)
  return {
    name: recipeName.split('@')[0].trim(),
    building: buildingName.split(':')[0].trim(),
    count: amount,
  }
}
