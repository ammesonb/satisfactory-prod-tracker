import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import ExternalInputItem from '@/components/modals/add-factory/ExternalInputItem.vue'
import CachedIcon from '@/components/common/CachedIcon.vue'
import { VChip, VBadge } from 'vuetify/components'
import { expectElementExists, expectElementText, expectProps } from '@/__tests__/vue-test-helpers'

// Mock composables with centralized fixtures
vi.mock('@/composables/useStores', async () => {
  const { mockUseStores } = await import('@/__tests__/fixtures/composables')
  return mockUseStores
})

describe('ExternalInputItem Integration', () => {
  const IRON_ORE = 'Desc_OreIron_C'
  const COPPER_ORE = 'Desc_OreCopper_C'

  const defaultProps = {
    item: IRON_ORE,
    amount: 100,
  }

  const createWrapper = (props = {}) => {
    return mount(ExternalInputItem, {
      props: { ...defaultProps, ...props },
    })
  }

  it('renders with default props', () => {
    const wrapper = createWrapper()

    expectElementExists(wrapper, VChip)
    expectElementExists(wrapper, CachedIcon)
    expectElementExists(wrapper, VBadge)
    expectElementText(wrapper, VChip, 'Iron Ore')
  })

  it('displays correct item name and amount', () => {
    const wrapper = createWrapper({ item: IRON_ORE, amount: 250 })

    expectElementText(wrapper, VChip, 'Iron Ore')
    expectProps(wrapper, VBadge, { content: 250 })
  })

  it('passes correct icon to CachedIcon component', () => {
    const wrapper = createWrapper()

    expectProps(wrapper, CachedIcon, {
      icon: 'desc-oreiron-c',
      size: 20,
    })
  })

  it('has correct chip properties', () => {
    const wrapper = createWrapper()

    expectProps(wrapper, VChip, {
      size: 'large',
      variant: 'outlined',
      closable: true,
    })
  })

  it('emits remove event when close button is clicked', async () => {
    const wrapper = createWrapper()

    const chip = wrapper.findComponent(VChip)
    await chip.vm.$emit('click:close')

    expect(wrapper.emitted('remove')).toHaveLength(1)
    expect(wrapper.emitted('remove')?.[0]).toEqual([])
  })

  it('handles different item types correctly', () => {
    const wrapper = createWrapper({ item: COPPER_ORE, amount: 50 })

    expectElementText(wrapper, VChip, 'Copper Ore')
    expectProps(wrapper, VBadge, { content: 50 })
    expectProps(wrapper, CachedIcon, { icon: 'desc-orecopper-c' })
  })
})
