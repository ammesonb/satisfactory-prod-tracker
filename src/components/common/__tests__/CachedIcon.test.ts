import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import CachedIcon from '@/components/common/CachedIcon.vue'
import { expectProps } from '@/__tests__/vue-test-helpers'
import { VImg } from 'vuetify/components'

vi.mock('@/logistics/images', () => ({
  getIconURL: vi.fn(
    (icon: string, size: number) => `https://example.com/icons/${icon}_${size}.png`,
  ),
}))

describe('CachedIcon Integration', () => {
  const createWrapper = (props = {}) => {
    return mount(CachedIcon, {
      props: {
        icon: 'iron-ore',
        ...props,
      },
    })
  }

  it('renders with default props', () => {
    const wrapper = createWrapper()

    expectProps(wrapper, VImg, {
      width: 24,
      height: 24,
    })
    expect(wrapper.findComponent(VImg).attributes('loading')).toBe('lazy')
  })

  it('uses correct source size for small icons', () => {
    const wrapper = createWrapper({ size: 24 })

    expectProps(wrapper, VImg, {
      src: 'https://example.com/icons/iron-ore_64.png',
    })
  })

  it('uses correct source size for large icons', () => {
    const wrapper = createWrapper({ size: 64 })

    expectProps(wrapper, VImg, {
      src: 'https://example.com/icons/iron-ore_256.png',
    })
  })

  it('applies custom size prop correctly', () => {
    const wrapper = createWrapper({ size: 48 })

    expectProps(wrapper, VImg, {
      width: 48,
      height: 48,
    })
  })

  it('applies alt text when provided', () => {
    const wrapper = createWrapper({ alt: 'Iron Ore Icon' })

    expectProps(wrapper, VImg, {
      alt: 'Iron Ore Icon',
    })
  })

  it('uses undefined alt when not provided', () => {
    const wrapper = createWrapper()

    expectProps(wrapper, VImg, {
      alt: undefined,
    })
  })

  it('updates icon URL when icon prop changes', async () => {
    const wrapper = createWrapper({ icon: 'copper-ore' })

    expectProps(wrapper, VImg, {
      src: 'https://example.com/icons/copper-ore_64.png',
    })

    await wrapper.setProps({ icon: 'iron-plate' })

    expectProps(wrapper, VImg, {
      src: 'https://example.com/icons/iron-plate_64.png',
    })
  })

  it('updates source size when size prop changes', async () => {
    const wrapper = createWrapper({ size: 24 })

    expectProps(wrapper, VImg, {
      src: 'https://example.com/icons/iron-ore_64.png',
    })

    await wrapper.setProps({ size: 64 })

    expectProps(wrapper, VImg, {
      src: 'https://example.com/icons/iron-ore_256.png',
    })
  })

  it('has correct CSS classes and styling', () => {
    const wrapper = createWrapper()

    expectProps(wrapper, VImg, {
      class: 'icon-image',
    })
  })
})
