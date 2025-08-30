import { describe, it, expect } from 'vitest'
import { calculateTransportCapacity } from '../graph-node'

describe('calculateTransportCapacity', () => {
  describe('belt transport (solids)', () => {
    it('should handle single building within MK1 capacity', () => {
      const result = calculateTransportCapacity(false, 30, 20)
      expect(result).toEqual([1])
    })

    it('should handle single building at MK1 capacity limit', () => {
      const result = calculateTransportCapacity(false, 60, 60)
      expect(result).toEqual([1])
    })

    it('should skip MK1 when per-building exceeds capacity', () => {
      const result = calculateTransportCapacity(false, 80, 80)
      expect(result).toEqual([0, 1])
    })

    it('should disperse lower-amount materials across multiple tiers', () => {
      const result = calculateTransportCapacity(false, 65, 186)
      expect(result).toEqual([0, 1, 2])
    })

    it('should handle multiple buildings across tiers', () => {
      // 240 total, 3 buildings = 80/building
      // MK1 (60): 0 buildings (80 > 60)
      // MK2 (120): 1 building (80 <= 120)
      // MK3 (270): 2 buildings (80 + 80 = 160 <= 270)
      const result = calculateTransportCapacity(false, 80, 240)
      expect(result).toEqual([0, 1, 2])
    })

    it('should handle high throughput requiring higher tiers', () => {
      // 1000/building requires MK6
      const result = calculateTransportCapacity(false, 1000, 1000)
      expect(result).toEqual([0, 0, 0, 0, 0, 1])
    })

    it('should handle throughput exceeding highest tier', () => {
      // 1500/building exceeds MK6 capacity - needs multiple channels
      const result = calculateTransportCapacity(false, 1500, 1500)
      expect(result).toEqual([0, 0, 0, 0, 0, 0])
    })

    it('should handle very high throughput needing multiple MK6 channels', () => {
      // 3600 total, 3 buildings = 1200/building exactly MK6 capacity
      const result = calculateTransportCapacity(false, 1200, 3600)
      expect(result).toEqual([0, 0, 0, 0, 0, 1])
    })

    it('should distribute buildings optimally', () => {
      // 300 total, 5 buildings = 60/building
      // All buildings can use MK1 (60 capacity each)
      const result = calculateTransportCapacity(false, 60, 300)
      expect(result).toEqual([1, 1, 2, 1])
    })
  })

  describe('pipeline transport (fluids)', () => {
    it('should use pipeline capacities for fluids', () => {
      const result = calculateTransportCapacity(true, 150, 150)
      expect(result).toEqual([1]) // Within MK1 pipeline (300)
    })

    it('should handle fluid throughput requiring MK2 pipeline', () => {
      const result = calculateTransportCapacity(true, 400, 400)
      expect(result).toEqual([0, 1]) // Exceeds MK1 (300), uses MK2 (600)
    })

    it('should handle more fluid than one pipeline can deliver', () => {
      // 900 total, 3 buildings = 300/building
      // MK1 (300): 1 building (300 <= 300)
      // MK2 (600): 2 buildings (300 + 300 = 600 <= 600)
      const result = calculateTransportCapacity(true, 300, 900)
      expect(result).toEqual([1, 1])
    })

    it('should handle fluid throughput exceeding all pipeline tiers', () => {
      // 700/building exceeds MK2 (600) - needs multiple channels
      const result = calculateTransportCapacity(true, 700, 700)
      expect(result).toEqual([0, 0])
    })

    it('should handle very high fluid throughput needing multiple MK2 channels', () => {
      // 1200 total, 2 buildings = 600/building exactly MK2 capacity
      const result = calculateTransportCapacity(true, 600, 1200)
      expect(result).toEqual([0, 1])
    })
  })

  describe('edge cases', () => {
    it('should throw error for zero per-building amount', () => {
      expect(() => calculateTransportCapacity(false, 0, 1)).toThrow(
        'Invalid total/recipe amounts: per-building amounts = 0',
      )
    })

    it('should handle very small amounts', () => {
      const result = calculateTransportCapacity(false, 0.1, 0.1)
      expect(result).toEqual([1])
    })

    it('should handle fractional remainders', () => {
      const result = calculateTransportCapacity(true, 100, 130)
      expect(result).toEqual([2])
    })

    it('should handle single recipe count', () => {
      const result = calculateTransportCapacity(false, 100, 100)
      expect(result).toEqual([0, 1])
    })

    it('should handle large recipe counts with low per-building throughput', () => {
      // 600 total, 10 buildings = 60/building
      const result = calculateTransportCapacity(false, 60, 600)
      expect(result).toEqual([1, 1, 2, 4, 2])
    })
  })
})
