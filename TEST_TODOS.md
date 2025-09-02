# Test TODOs

## E2E Tests (Playwright)

### CachedIcon Component - Browser Image Caching Behavior
- [ ] Verify that changing icon size within same resolution tier (24px -> 32px) doesn't trigger new network requests
- [ ] Verify that changing icon size across resolution tiers (32px -> 48px) does trigger new network requests  
- [ ] Verify that switching back to a previously loaded size uses cached image (no new network request)

### Factory Management
- [ ] Add a factory, verify the factory added has the same name/icon
- [ ] Floor edit does set a name and icon, values persist after saving/opening

## Component Tests (Vitest + Vue Test Utils)

### Theme Switcher
- [ ] Theme switcher updates theme state correctly
- [ ] Theme changes are reflected in component styling

### Item Selector
- [ ] Item selector shows the correct icon for items
- [ ] Search functionality filters items correctly
- [ ] Selection triggers correct events

### Factory Filtering
- [ ] Filtering factories in the drawer works correctly
- [ ] Filter state persists during navigation