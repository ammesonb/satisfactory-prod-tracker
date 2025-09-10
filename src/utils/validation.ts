/**
 * Validates that a number is greater than zero, allowing fractional values
 */
export const isPositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && !isNaN(value) && value > 0
}
