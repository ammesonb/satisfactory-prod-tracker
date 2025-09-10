/**
 * Creates a memoized version of a function that caches results based on arguments
 */
export function memoize<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  keyGenerator?: (...args: TArgs) => string,
): (...args: TArgs) => TReturn {
  const cache = new Map<string, TReturn>()

  return (...args: TArgs): TReturn => {
    // Generate cache key - use custom key generator or JSON stringify
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

/**
 * Simple memoization for single-argument functions with primitive keys
 */
export function memoizeSimple<TArg extends string | number, TReturn>(
  fn: (arg: TArg) => TReturn,
): (arg: TArg) => TReturn {
  const cache = new Map<TArg, TReturn>()

  return (arg: TArg): TReturn => {
    if (cache.has(arg)) {
      return cache.get(arg)!
    }

    const result = fn(arg)
    cache.set(arg, result)
    return result
  }
}
