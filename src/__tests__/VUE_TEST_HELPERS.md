# Vue Test Helpers

Fluent API for cleaner test assertions: `element(wrapper, selector)` and `component(wrapper, type)`.

## Quick Examples

```ts
import { component, element } from '@/__tests__/vue-test-helpers'
import { VBtn } from 'vuetify/components'

import Modal from '@/components/modals/Modal.vue'

// Basic assertions (default: exists: true)
component(wrapper, VBtn).assert()
element(wrapper, '#error').assert({ exists: false })
component(wrapper, VBtn).assert({ count: 3 })

// Match and interact
await component(wrapper, VBtn)
  .match((btn) => btn.text().includes('Save'))
  .click()

// Emit events
await component(wrapper, Modal).emit('close', ['arg1', 2, 3.14])

// Chain matchers
component(wrapper, VBtn)
  .match((btn) => btn.props().color === 'primary')
  .match((btn) => !btn.props().disabled)
  .assert()

// Reuse matched helpers
const saveBtn = component(wrapper, VBtn).match((btn) => btn.text() === 'Save')
saveBtn.assert()
await saveBtn.click()
saveBtn.match((btn) => btn.props().disabled).assert()

// Get typed wrappers
const btn = component(wrapper, VBtn).getComponent()
// btn is VueWrapper<InstanceType<typeof VBtn>>

const allButtons = component(wrapper, VBtn).getComponents()
```

## Key Features

**Matchers are functions** - Provides maximum flexibility for filtering:

```ts
.match((el) => el.text().includes('text'))
.match((el) => el.props().value === expected)
.match((el) => !el.attributes('disabled'))
```

**Reuse helper instances** - Store matched helpers to avoid recreating matchers:

```ts
const btn = component(wrapper, VBtn).match((b) => b.text() === 'Save')
btn.assert()
await btn.click()
```

**Force clicks** - For hidden/disabled elements:

```ts
await component(wrapper, VBtn).click(true)
```

**Full type inference** - `getComponent()` returns fully typed wrappers:

```ts
const btn = component(wrapper, VBtn).getComponent()
// btn.vm is fully typed
```

## API Reference

- `match(fn)` - Filter with predicate (chainable)
- `assert(options?)` - Check existence/count (default: `{ exists: true }`)
- `click(force?)` - Click and wait for Vue update
- `emit(event, ...args)` - Emit event (components only)
- `getElement()` / `getComponent()` - Get single typed wrapper
- `getElements()` / `getComponents()` - Get all matches
