import { component } from '@/__tests__/vue-test-helpers'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import CachedIcon from '@/components/common/CachedIcon.vue'
import ExternalInputItem from '@/components/modals/add-factory/ExternalInputItem.vue'
import { VBadge, VChip } from 'vuetify/components'

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

    component(wrapper, VChip).assert()
    component(wrapper, CachedIcon).assert()
    component(wrapper, VBadge).assert()
    component(wrapper, VChip).assert({ text: 'Iron Ore' })
  })

  it('displays correct item name and amount', () => {
    const wrapper = createWrapper({ item: IRON_ORE, amount: 250 })

    component(wrapper, VChip).assert({ text: 'Iron Ore' })
    component(wrapper, VBadge).assert({ props: { content: 250 } })
  })

  it('passes correct icon to CachedIcon component', () => {
    const wrapper = createWrapper()

    component(wrapper, CachedIcon).assert({ props: { icon: 'desc-oreiron-c', size: 20 } })
  })

  it('has correct chip properties', () => {
    const wrapper = createWrapper()

    component(wrapper, VChip).assert({
      props: { size: 'large', variant: 'outlined', closable: true },
    })
  })

  it('emits remove event when close button is clicked', async () => {
    const wrapper = createWrapper()

    component(wrapper, VChip).emit('click:close')

    expect(wrapper.emitted('remove')).toHaveLength(1)
    expect(wrapper.emitted('remove')?.[0]).toEqual([])
  })

  it('handles different item types correctly', () => {
    const wrapper = createWrapper({ item: COPPER_ORE, amount: 50 })

    component(wrapper, VChip).assert({ text: 'Copper Ore' })
    component(wrapper, VBadge).assert({ props: { content: 50 } })
    component(wrapper, CachedIcon).assert({ props: { icon: 'desc-orecopper-c' } })
  })
})
