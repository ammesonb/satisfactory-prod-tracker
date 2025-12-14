# CLAUDE.md

## Project Overview

**Satisfactory Production Tracker** is a factory visualization and tracking application that emphasizes links between recipes across multiple factory floors. Unlike traditional Satisfactory production planners that focus solely on recipes and ratios, this tool visualizes the entire supply chain as an interconnected network, helping players track ingredient connections between factories.

### Key Features

- Interactive recipe network visualization with input/output links
- Multi-floor factory management with customizable names and icons
- Recipe dependency resolution and circular dependency detection
- Import/export functionality for sharing factory configurations
- Integration with Satisfactory Tools for recipe importing

## Framework & Technology Stack

### Core Technologies

- **Vue 3** - Frontend framework using Composition API
- **TypeScript** - Type safety throughout the application
- **Vite** - Build tool and development server
- **Vuetify 3** - Material Design component library
- **Pinia** - State management with persistence

### Key Dependencies

- **@vueuse/core** - Vue composition utilities
- **pinia-plugin-persistedstate** - Persistent state management
- **@mdi/font** - Material Design Icons
- **unplugin-vue-components** - Auto-import components

### Testing & Development

- **Vitest** - Unit testing framework with UI support
- **Vue Test Utils** - Vue component testing utilities
- **ESLint** - Code linting with Vue and TypeScript configs
- **Prettier** - Code formatting

## Architecture & Design Patterns

### Component Structure

The application follows a hierarchical component-based architecture:

```
src/components/
├── common/          # Reusable UI components (selectors, inputs, icons)
├── factory/         # Factory visualization components (floors, recipes, links)
├── layout/          # App layout components (navigation, drawers, panels)
└── modals/          # Modal dialogs (import/export, confirmations)
```

### State Management

- **Pinia stores** with TypeScript for type-safe state management:
  - `factory.ts` - Factory data, floors, and recipe management
  - `data.ts` - Game data loading and caching
  - `errors.ts` - Global error handling
  - `theme.ts` - UI theme management

### Core Logic Systems

- **Graph Solver** (`src/logistics/`) - Recipe dependency resolution
- **Recipe Parser** - Satisfactory Tools integration
- **Error Handling** - Type-safe error management with user-friendly messages
- **Image Management** - Satisfactory item/building icon handling

### Folder Organization

- `src/composables/` - Reusable composition functions
- `src/types/` - TypeScript type definitions
- `src/logistics/` - Core business logic for recipe processing
- `src/errors/` - Error handling utilities and type guards
- `src/utils/` - Pure utility functions with no side effects

### Path Aliases

The project uses `@/` as an alias for the `src/` directory for cleaner imports.

## Development Commands

### Daily Development

- `npm run dev` - Start development server with hot reload
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint and auto-fix code issues
- `npm run type-check` - Run TypeScript type checking
- `ck --jsonl --sem <query>` - Search the codebase semantically

### Testing

- `npm test` - Run tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI interface
- `npm run test:run` - Run tests once (CI mode)
- `npm run test:coverage` - Generate test coverage reports

### Building

- `npm run build` - Build for production (includes type checking)
- `npm run build-only` - Build without type checking
- `npm run preview` - Preview production build locally

### Quality Assurance

- `npm run ci` - Full CI pipeline (format check, lint check, type check, tests)
- `npm run format:check` - Check code formatting without fixing
- `npm run lint:check` - Check linting without auto-fixing

### Data Fixtures

- `npm run fixtures:items` - Generate test fixtures for Satisfactory items
- `npm run fixtures:recipes` - Generate test fixtures for recipes
- `npm run fixtures:buildings` - Generate test fixtures for buildings

## Code Conventions

- Use existing functions and components. Do not reinvent the wheel every time.
- Reference fixtures and data stores instead of random strings and numbers.
- Do not assume you fixed the tests until you run them.
- Do not add self-explanatory comments.

### Component Patterns

- Use Composition API with `<script setup lang="ts">`
- Components auto-imported via `unplugin-vue-components`
- Vuetify components available globally
- Scoped CSS for component-specific styles

### State Management Patterns

- Pinia stores with `defineStore()` pattern
- State persistence enabled for factory and theme stores
- Getters for computed values, actions for mutations
- Type-safe store composition with TypeScript

### Import Patterns

- Use `@/` alias for all internal imports
- Barrel exports from type definition files
- Explicit type imports with `type` keyword

## Node.js Requirements

- **Node.js**: ^20.19.0 || >=22.12.0
- Package manager: npm (lockfile present)

## OpenMemory Integration


**Server:** `http://localhost:8080`
**API Key:** `claude-code-satisfactory-tracker`
**Project ID:** `satisfactory-prod-tracker`

### Quick Reference

**IMPORTANT:** All memory operations MUST include `"metadata": {"project": "satisfactory-prod-tracker"}` to isolate this project's memories.

```bash
# Query memories (ALWAYS include metadata filter)
curl -X POST http://localhost:8080/memory/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer claude-code-satisfactory-tracker" \
  -d '{
    "query": "your question here",
    "k": 3,
    "metadata": {"project": "satisfactory-prod-tracker"}
  }'

# Add memory (ALWAYS include metadata and tags)
curl -X POST http://localhost:8080/memory/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer claude-code-satisfactory-tracker" \
  -d '{
    "content": "Your memory content here",
    "tags": ["relevant", "tags"],
    "metadata": {"project": "satisfactory-prod-tracker"}
  }'

# List project memories
curl "http://localhost:8080/memory/all?metadata.project=satisfactory-prod-tracker" \
  -H "Authorization: Bearer claude-code-satisfactory-tracker"
```

### Memory Quality Guidelines

Capture the **WHY** not the **WHAT**:

✅ **Good:** "autoSyncSuspended flag prevents race conditions during bulk operations by disabling auto-save temporarily"

❌ **Bad:** "Function uses parameter order (namespace, factoryName)" (obvious from code)

The code shows WHAT is implemented. Memories should explain WHY design decisions were made.
