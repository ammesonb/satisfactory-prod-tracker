import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import NamespaceSelector from '@/components/common/NamespaceSelector.vue'
import { VCombobox } from 'vuetify/components'

describe('NamespaceSelector', () => {
  it('renders combobox with available namespaces', () => {
    const wrapper = mount(NamespaceSelector, {
      props: {
        modelValue: '',
        availableNamespaces: ['Main Game', 'Alt Save'],
      },
    })

    const combobox = wrapper.findComponent(VCombobox)
    expect(combobox.exists()).toBe(true)
    expect(combobox.props('items')).toEqual(['Main Game', 'Alt Save'])
    expect(combobox.props('clearable')).toBe(true)
  })

  it('displays current value', () => {
    const wrapper = mount(NamespaceSelector, {
      props: {
        modelValue: 'Main Game',
        availableNamespaces: ['Main Game'],
      },
    })

    const combobox = wrapper.findComponent(VCombobox)
    expect(combobox.props('modelValue')).toBe('Main Game')
  })

  it('emits updates when value changes', async () => {
    const wrapper = mount(NamespaceSelector, {
      props: {
        modelValue: '',
        availableNamespaces: ['Main Game'],
      },
    })

    const combobox = wrapper.findComponent(VCombobox)
    await combobox.vm.$emit('update:modelValue', 'Main Game')

    expect(wrapper.emitted('update:modelValue')).toEqual([['Main Game']])
  })

  it('supports custom label and hint', () => {
    const wrapper = mount(NamespaceSelector, {
      props: {
        modelValue: '',
        availableNamespaces: [],
        label: 'Save Game',
        hint: 'Choose your save',
      },
    })

    const combobox = wrapper.findComponent(VCombobox)
    expect(combobox.props('label')).toBe('Save Game')
    expect(combobox.props('hint')).toBe('Choose your save')
  })

  it('respects disabled state', () => {
    const wrapper = mount(NamespaceSelector, {
      props: {
        modelValue: '',
        availableNamespaces: [],
        disabled: true,
      },
    })

    const combobox = wrapper.findComponent(VCombobox)
    expect(combobox.props('disabled')).toBe(true)
  })

  it('provides validation rules', () => {
    const wrapper = mount(NamespaceSelector, {
      props: {
        modelValue: '',
        availableNamespaces: [],
      },
    })

    const combobox = wrapper.findComponent(VCombobox)
    const rules = combobox.props('rules') as Array<(v: string) => string | boolean>

    expect(rules).toHaveLength(5)
    expect(rules[0]('')).toBe('Namespace is required')
    expect(rules[1]('.')).toBe('Invalid folder name')
    expect(rules[2]('invalid/name')).toBe('Cannot contain forward slash')
    expect(rules[3]('   ')).toBe('Cannot be empty or only spaces')
  })
})
