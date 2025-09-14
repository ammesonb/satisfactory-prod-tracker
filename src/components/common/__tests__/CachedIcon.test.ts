import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import CachedIcon from '@/components/common/CachedIcon.vue'

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

    const img = wrapper.findComponent({ name: 'VImg' })
    expect(img.exists()).toBe(true)
    expect(img.props('width')).toBe(24)
    expect(img.props('height')).toBe(24)
    expect(img.attributes('loading')).toBe('lazy')
  })

  it('uses correct source size for small icons', () => {
    const wrapper = createWrapper({ size: 24 })

    const img = wrapper.findComponent({ name: 'VImg' })
    expect(img.props('src')).toBe('https://example.com/icons/iron-ore_64.png')
  })

  it('uses correct source size for large icons', () => {
    const wrapper = createWrapper({ size: 64 })

    const img = wrapper.findComponent({ name: 'VImg' })
    expect(img.props('src')).toBe('https://example.com/icons/iron-ore_256.png')
  })

  it('applies custom size prop correctly', () => {
    const wrapper = createWrapper({ size: 48 })

    const img = wrapper.findComponent({ name: 'VImg' })
    expect(img.props('width')).toBe(48)
    expect(img.props('height')).toBe(48)
  })

  it('applies alt text when provided', () => {
    const wrapper = createWrapper({ alt: 'Iron Ore Icon' })

    const img = wrapper.findComponent({ name: 'VImg' })
    expect(img.props('alt')).toBe('Iron Ore Icon')
  })

  it('uses undefined alt when not provided', () => {
    const wrapper = createWrapper()

    const img = wrapper.findComponent({ name: 'VImg' })
    expect(img.props('alt')).toBeUndefined()
  })

  it('updates icon URL when icon prop changes', async () => {
    const wrapper = createWrapper({ icon: 'copper-ore' })

    let img = wrapper.findComponent({ name: 'VImg' })
    expect(img.props('src')).toBe('https://example.com/icons/copper-ore_64.png')

    await wrapper.setProps({ icon: 'iron-plate' })

    img = wrapper.findComponent({ name: 'VImg' })
    expect(img.props('src')).toBe('https://example.com/icons/iron-plate_64.png')
  })

  it('updates source size when size prop changes', async () => {
    const wrapper = createWrapper({ size: 24 })

    let img = wrapper.findComponent({ name: 'VImg' })
    expect(img.props('src')).toBe('https://example.com/icons/iron-ore_64.png')

    await wrapper.setProps({ size: 64 })

    img = wrapper.findComponent({ name: 'VImg' })
    expect(img.props('src')).toBe('https://example.com/icons/iron-ore_256.png')
  })

  it('has correct CSS classes and styling', () => {
    const wrapper = createWrapper()

    const img = wrapper.findComponent({ name: 'VImg' })
    expect(img.classes()).toContain('icon-image')
  })
})
