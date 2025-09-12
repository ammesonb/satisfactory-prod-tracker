import type { Recipe } from '@/types/data'
import { memoize } from '@/utils/cache'

const recipesToOptionsInternal = (
  recipes: Record<string, Recipe>,
  getRecipeDisplayName: (key: string) => string,
  excludeKeys: string[] = [],
): Array<{ value: string; title: string }> => {
  return Object.keys(recipes)
    .filter((key) => !excludeKeys.includes(key))
    .map((key) => ({
      value: key,
      title: getRecipeDisplayName(key),
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

export const recipesToOptions = memoize(
  recipesToOptionsInternal,
  (recipes, _getRecipeDisplayName, excludeKeys) =>
    `${JSON.stringify(recipes)}-${(excludeKeys || []).join(',')}`,
)
