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
    expect(
      component(createWrapper({ size: 24 }), VImg)
        .getComponent()
        .props('src'),
    ).toBe('https://example.com/icons/iron-ore_64.png')
  })

  it('uses correct source size for large icons', () => {
    expect(
      component(createWrapper({ size: 64 }), VImg)
        .getComponent()
        .props('src'),
    ).toBe('https://example.com/icons/iron-ore_256.png')
  })

  it('applies custom size prop correctly', () => {
    const img = component(createWrapper({ size: 48 }), VImg).getComponent()
    expect(img.props('width')).toBe(48)
    expect(img.props('height')).toBe(48)
  })

  it('applies alt text when provided', () => {
    expect(
      component(createWrapper({ alt: 'Iron Ore Icon' }), VImg)
        .getComponent()
        .props('alt'),
    ).toBe('Iron Ore Icon')
  })

  it('uses undefined alt when not provided', () => {
    expect(component(createWrapper(), VImg).getComponent().props('alt')).toBeUndefined()
  })

  it('updates icon URL when icon prop changes', async () => {
    const wrapper = createWrapper({ icon: 'copper-ore' })

    expect(component(wrapper, VImg).getComponent().props('src')).toBe(
      'https://example.com/icons/copper-ore_64.png',
    )

    await wrapper.setProps({ icon: 'iron-plate' })

    expect(component(wrapper, VImg).getComponent().props('src')).toBe(
      'https://example.com/icons/iron-plate_64.png',
    )
  })

  it('updates source size when size prop changes', async () => {
    const wrapper = createWrapper({ size: 24 })

    expect(component(wrapper, VImg).getComponent().props('src')).toBe(
      'https://example.com/icons/iron-ore_64.png',
    )

    await wrapper.setProps({ size: 64 })

    expect(component(wrapper, VImg).getComponent().props('src')).toBe(
      'https://example.com/icons/iron-ore_256.png',
    )
  })

  it('has correct CSS classes and styling', () => {
    expect(component(createWrapper(), VImg).getComponent().props('class')).toBe('icon-image')
  })
})
