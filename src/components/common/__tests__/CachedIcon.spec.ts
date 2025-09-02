import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CachedIcon from '@/components/common/CachedIcon.vue'
import { itemDatabase } from '@/__tests__/fixtures/data'
import { getIconURL } from '@/logistics/images'

// Import the component test setup
import '@/components/__tests__/component-setup'

// Mock the images module to track calls
vi.mock('@/logistics/images', () => ({
  getIconURL: vi.fn(
    (objectName: string, size: number) =>
      `https://example.com/icons/${objectName.replace(/_/g, '-')}_${size}.png`,
  ),
}))

const mockGetIconURL = vi.mocked(getIconURL)

describe('CachedIcon', () => {
  beforeEach(() => {
    mockGetIconURL.mockClear()
  })

  describe('Image Display Behavior', () => {
    it('displays an image for the correct item', async () => {
      const wrapper = mount(CachedIcon, {
        props: {
          icon: itemDatabase.Desc_IronIngot_C.icon,
          size: 32,
          alt: itemDatabase.Desc_IronIngot_C.name,
        },
      })

      await wrapper.vm.$nextTick()

      // Verify the component requests an icon for the correct item
      expect(mockGetIconURL).toHaveBeenCalledWith(
        itemDatabase.Desc_IronIngot_C.icon,
        expect.any(Number),
      )

      // Verify an image element is rendered
      const vImg = wrapper.findComponent({ name: 'VImg' })
      expect(vImg.exists()).toBe(true)
      expect(vImg.props('src')).toContain(itemDatabase.Desc_IronIngot_C.icon)
    })

    it('shows different images for different items', async () => {
      const wrapper1 = mount(CachedIcon, {
        props: { icon: itemDatabase.Desc_IronIngot_C.icon, size: 32 },
      })

      const wrapper2 = mount(CachedIcon, {
        props: { icon: itemDatabase.Desc_CopperIngot_C.icon, size: 32 },
      })

      await Promise.all([wrapper1.vm.$nextTick(), wrapper2.vm.$nextTick()])

      const vImg1 = wrapper1.findComponent({ name: 'VImg' })
      const vImg2 = wrapper2.findComponent({ name: 'VImg' })

      expect(vImg1.props('src')).toContain(itemDatabase.Desc_IronIngot_C.icon)
      expect(vImg2.props('src')).toContain(itemDatabase.Desc_CopperIngot_C.icon)
      expect(vImg1.props('src')).not.toBe(vImg2.props('src'))
    })
  })

  describe('Resolution Tier Logic', () => {
    it('uses 64px source for small display sizes (≤ 32px)', async () => {
      const wrapper = mount(CachedIcon, {
        props: {
          icon: itemDatabase.Desc_IronIngot_C.icon,
          size: 24,
        },
      })

      await wrapper.vm.$nextTick()

      // Should call getIconURL with 64px for small sizes
      expect(mockGetIconURL).toHaveBeenCalledWith(itemDatabase.Desc_IronIngot_C.icon, 64)

      const vImg = wrapper.findComponent({ name: 'VImg' })
      expect(vImg.props('src')).toContain('_64.png')
    })

    it('uses 256px source for large display sizes (> 32px)', async () => {
      const wrapper = mount(CachedIcon, {
        props: {
          icon: itemDatabase.Desc_IronIngot_C.icon,
          size: 48,
        },
      })

      await wrapper.vm.$nextTick()

      // Should call getIconURL with 256px for large sizes
      expect(mockGetIconURL).toHaveBeenCalledWith(itemDatabase.Desc_IronIngot_C.icon, 256)

      const vImg = wrapper.findComponent({ name: 'VImg' })
      expect(vImg.props('src')).toContain('_256.png')
    })

    it('changes source URL when crossing resolution threshold', async () => {
      const wrapper = mount(CachedIcon, {
        props: {
          icon: itemDatabase.Desc_IronIngot_C.icon,
          size: 24, // Uses 64px source
        },
      })

      await wrapper.vm.$nextTick()
      const vImg = wrapper.findComponent({ name: 'VImg' })
      expect(vImg.props('src')).toContain('_64.png')

      // Cross threshold to large size
      await wrapper.setProps({ size: 48 })

      // Should now use 256px source
      expect(vImg.props('src')).toContain('_256.png')
    })
  })
})
