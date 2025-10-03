import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import CachedIcon from '@/components/common/CachedIcon.vue'
import { component } from '@/__tests__/vue-test-helpers'
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
    const img = component(createWrapper(), VImg).getComponent()
    expect(img.props('width')).toBe(24)
    expect(img.props('height')).toBe(24)
    expect(img.attributes('loading')).toBe('lazy')
  })

  it('uses correct source size for small icons', () => {
    const wrapper = createWrapper({ size: 24 })
    component(wrapper, VImg).assert({
      props: {
        src: 'https://example.com/icons/iron-ore_64.png',
      },
    })
  })

  it('uses correct source size for large icons', () => {
    const wrapper = createWrapper({ size: 64 })
    component(wrapper, VImg).assert({
      props: {
        src: 'https://example.com/icons/iron-ore_256.png',
      },
    })
  })

  it('applies custom size prop correctly', () => {
    const wrapper = createWrapper({ size: 48 })
    component(wrapper, VImg).assert({
      props: {
        width: 48,
        height: 48,
      },
    })
  })

  it('applies alt text when provided', () => {
    const wrapper = createWrapper({ alt: 'Iron Ore Icon' })
    component(wrapper, VImg).assert({
      props: {
        alt: 'Iron Ore Icon',
      },
    })
  })

  it('uses undefined alt when not provided', () => {
    const wrapper = createWrapper()
    component(wrapper, VImg).assert({
      props: {
        alt: undefined,
      },
    })
  })

  it('updates icon URL when icon prop changes', async () => {
    const wrapper = createWrapper({ icon: 'copper-ore' })

    component(wrapper, VImg).assert({
      props: {
        src: 'https://example.com/icons/copper-ore_64.png',
      },
    })

    await wrapper.setProps({ icon: 'iron-plate' })

    component(wrapper, VImg).assert({
      props: {
        src: 'https://example.com/icons/iron-plate_64.png',
      },
    })
  })

  it('updates source size when size prop changes', async () => {
    const wrapper = createWrapper({ size: 24 })

    component(wrapper, VImg).assert({
      props: {
        src: 'https://example.com/icons/iron-ore_64.png',
      },
    })

    await wrapper.setProps({ size: 64 })

    component(wrapper, VImg).assert({
      props: {
        src: 'https://example.com/icons/iron-ore_256.png',
      },
    })
  })

  it('has correct CSS classes and styling', () => {
    component(createWrapper(), VImg).assert({
      props: {
        class: 'icon-image',
      },
    })
  })
})
