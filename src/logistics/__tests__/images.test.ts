import { describe, expect, it } from 'vitest'

import { getIconURL } from '@/logistics/images'

describe('images', () => {
  describe('getIconURL', () => {
    it('should generate correct URL for 64x64 size', () => {
      const result = getIconURL('Desc_IronIngot_C', 64)
      expect(result).toBe(
        'https://github.com/greeny/SatisfactoryTools/blob/master/www/assets/images/items/Desc-IronIngot-C_64.png?raw=true',
      )
    })

    it('should generate correct URL for 256x256 size', () => {
      const result = getIconURL('Desc_IronIngot_C', 256)
      expect(result).toBe(
        'https://github.com/greeny/SatisfactoryTools/blob/master/www/assets/images/items/Desc-IronIngot-C_256.png?raw=true',
      )
    })
  })
})
