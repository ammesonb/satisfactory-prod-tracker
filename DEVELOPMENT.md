# Development Guide

## Overview

A Vue 3 application for tracking and visualizing Satisfactory factory production chains.
Users can create multiple factories, add recipes, and view production chains and links.

## Tech Stack

- **Frontend**: Vue 3 with Composition API, Vuetify 3 UI framework
- **State Management**: Pinia with persistence
- **Build Tool**: Vite with Vue DevTools
- **Testing**: Vitest with coverage reporting
- **Code Quality**: ESLint, Prettier, TypeScript
- **Icons**: Material Design Icons (@mdi/font)

## Prerequisites

- Node.js ^20.19.0 || >=22.12.0
- npm (comes with Node.js)

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Setup

```bash
npm install
```

## Development Commands

| Command                      | Description                              |
| ---------------------------- | ---------------------------------------- |
| `npm run dev`                | Start development server with hot reload |
| `npm run build`              | Full build with type checking            |
| `npm run build-only`         | Build without type checking              |
| `npm run preview`            | Preview production build                 |
| `npm run lint`               | ESLint with auto-fix                     |
| `npm run format`             | Prettier formatting                      |
| `npm run type-check`         | TypeScript type checking                 |
| `npm test`                   | Run tests                                |
| `npm run test:ui`            | Test UI interface                        |
| `npm run test:coverage`      | Coverage report                          |
| `npm run fixtures:items`     | Generate item fixtures                   |
| `npm run fixtures:recipes`   | Generate recipe fixtures                 |
| `npm run fixtures:buildings` | Generate building fixtures               |

## Project Structure

```
src/
├── components/          # Vue components
│   ├── common/         # Reusable components
│   ├── factory/        # Factory-specific components
│   ├── layout/         # Layout components
│   └── modals/         # Modal dialogs
├── composables/        # Vue composables
├── errors/             # Error handling
├── logistics/          # Recipe parsing & graph solving
├── stores/             # Pinia stores
└── types/              # TypeScript definitions
```

## Development Notes

- Uses `@` alias for `src/` directory
- Auto-imports Vuetify components via unplugin-vue-components
- Persistent state via pinia-plugin-persistedstate
- Vue DevTools enabled in development
- Happy DOM for testing environment
