# satisfactory-prod-tracker

## IDEAS:

- have building on mouseover show raw recipe with native amounts
- show belt tier for ingredients/products into building
- also show building counts so we know e.g. 680 iron ore @ 65 ore / min for each building
- how many tier 1 belts, tier 2 belts, etc before having to switch?

- display checkboxes for linked materials (inputs + outputs) and buildings like

```
input 1 -----            ----- output 1
input 2 ----- building 1 ----- output 2
input 3 -----            -----
```

such that a building will only be hidden if all the inputs, itself, and outputs are checked off
if an output from say, iron -> iron rod is checked, the INPUT for iron rod should also be checked

- still want to show building name, count, etc as well as the amounts and percentages for inputs and outputs
- anchor-based hyperlink for inputs and outputs

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
