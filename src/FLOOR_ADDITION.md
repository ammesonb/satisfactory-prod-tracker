# Floor Addition & Removal Implementation Plan

## Overview

Add ability to insert, reorder, and remove floors in the factory editor. This requires careful handling of batch numbers which are currently tied to floor indices.

## Current Architecture Analysis

### Batch Number Usage

`batchNumber` is a property on `RecipeNode` that represents which "batch" (processing tier) a recipe belongs to during the graph solving process. Currently, it's used as:

1. **Floor Assignment** (`factory.ts:64-68`): When adding a factory, recipes are placed into floors based on their `batchNumber`
2. **Recipe Identity** (`useRecipeStatus.ts:37`): Panel value uses `${batchNumber}-${recipeName}` format
3. **DOM IDs** (`utils/floors.ts`): Recipe elements get IDs like `recipe-${batchNumber}-${recipeName}`
4. **Display** (`useLinkData.ts:39`): Shows floor numbers as `batchNumber + 1`
5. **Navigation** (`useFloorNavigation.ts`): Uses batchNumber for expanding/collapsing floors and scrolling to recipes
6. **Floor Moving** (`useFloorManagement.ts:90`): When moving recipes between floors, updates `batchNumber`

### Key Insight

**Batch numbers represent the LOGICAL dependency order of recipes, NOT physical floor assignment!**

The user is correct: we shouldn't need batch numbers for keying. The current mixing of concepts (logical batch tier vs physical floor position) is causing confusion.

However, batch numbers are fundamental to the graph solver's output and represent the actual production dependency chain. We should:

- **Keep batch numbers** as they represent logical production order
- **Decouple floor indices from batch numbers** so floors can be freely inserted/removed/reordered

## Requirements

### 1. Floor Insertion

- Add floors at any position: beginning, middle, or end
- UI shows "+ Insert Floor" buttons between existing floors (Google Docs style)
- Only visible in "Edit All Floors" mode
- Inserting updates floor indices but NOT batch numbers

### 2. Floor Removal

- Delete button (far-right aligned) next to each floor name in edit modal
- Disabled if floor contains any recipes
- Only enabled for empty floors
- Recipes must be moved before deletion is possible

### 3. Floor Name Updates

- When a floor is inserted at index N, all floors with names like "Floor {N+1}", "Floor {N+2}", etc. should increment their numbers
- Custom names (non-numeric) should remain unchanged
- Floor icon should remain unchanged

## Implementation Plan

### Phase 1: Data Model Refactoring

#### 1.1 Separate Floor Position from Batch Number

**File**: `src/types/factory.ts`

- Batch numbers remain on recipes as logical dependency indicators
- Floor position is now just the array index in `Factory.floors[]`
- No direct coupling between the two

**Key Change**: Remove implicit assumption that `floor[i]` contains recipes with `batchNumber === i`

#### 1.2 Update Recipe to Floor Lookup

**Files**:

- `src/stores/factory.ts`
- `src/composables/useFloorManagement.ts`
- `src/composables/useFloorNavigation.ts`

**Changes**:

- Create helper function `getFloorIndexForRecipe(recipe: RecipeNode): number` that searches floors to find which contains the recipe
- Update `moveRecipe()` to maintain batch numbers while changing floor assignment
- Update navigation to use floor index directly rather than assuming `floorIndex === batchNumber`

#### 1.3 Update DOM ID Generation

**File**: `src/utils/floors.ts`

**Current**:

```typescript
formatRecipeId(floorIndex: number, recipeName: string)
```

**New**:

```typescript
formatRecipeId(recipeName: string, recipeInstance?: number)
```

Recipe names are unique within a factory (you can't have the same recipe twice), so we don't need floor index in the ID. If we ever support duplicate recipes, add an instance counter.

**Impact**: Update all callsites (10+ files)

### Phase 2: Floor Management Functions

#### 2.1 Add Floor Insertion

**File**: `src/composables/useFloorManagement.ts`

```typescript
const insertFloor = (atIndex: number) => {
  if (!factoryStore.currentFactory) return

  const newFloor: Floor = { recipes: [] }
  factoryStore.currentFactory.floors.splice(atIndex, 0, newFloor)

  // Update floor names that reference numeric positions >= atIndex
  updateFloorNamesAfterInsertion(atIndex)
}

const updateFloorNamesAfterInsertion = (insertedIndex: number) => {
  factoryStore.currentFactory?.floors.forEach((floor, index) => {
    if (floor.name && index > insertedIndex) {
      // Check if name matches pattern "Floor {number}"
      const match = floor.name.match(/^Floor (\d+)$/i)
      if (match) {
        const oldNumber = parseInt(match[1])
        if (oldNumber > insertedIndex) {
          floor.name = `Floor ${oldNumber + 1}`
        }
      }
    }
  })
}
```

#### 2.2 Add Floor Removal

**File**: `src/composables/useFloorManagement.ts`

```typescript
const removeFloor = (floorIndex: number) => {
  if (!factoryStore.currentFactory) return

  const floor = factoryStore.currentFactory.floors[floorIndex]
  if (!floor || floor.recipes.length > 0) {
    throw new Error('Cannot remove floor with recipes')
  }

  factoryStore.currentFactory.floors.splice(floorIndex, 1)

  // Update floor names that reference numeric positions > floorIndex
  updateFloorNamesAfterRemoval(floorIndex)
}

const updateFloorNamesAfterRemoval = (removedIndex: number) => {
  factoryStore.currentFactory?.floors.forEach((floor, index) => {
    if (floor.name && index >= removedIndex) {
      const match = floor.name.match(/^Floor (\d+)$/i)
      if (match) {
        const oldNumber = parseInt(match[1])
        if (oldNumber > removedIndex + 1) {
          floor.name = `Floor ${oldNumber - 1}`
        }
      }
    }
  })
}

const canRemoveFloor = (floorIndex: number): boolean => {
  const floor = factoryStore.currentFactory?.floors[floorIndex]
  return !!floor && floor.recipes.length === 0
}
```

### Phase 3: UI Updates

#### 3.1 FloorEditModal Updates

**File**: `src/components/modals/FloorEditModal.vue`

**Changes**:

1. Add delete icon button next to each floor name (far-right aligned)
2. Disable delete button when `!canRemoveFloor(form.index)`
3. Show tooltip explaining why it's disabled ("Floor must be empty to delete")
4. Add "+ Insert Floor" buttons between floors (only in "Edit All Floors" mode)
5. Handle deletion: remove from forms array, call `removeFloor()`
6. Handle insertion: insert empty floor in forms array, call `insertFloor()`

**UI Structure**:

```
┌─────────────────────────────────────┐
│  + Insert Floor (Beginning)         │
├─────────────────────────────────────┤
│ Floor 1 - Iron Processing     [🗑️]  │
│   [Floor Name Input]                │
│   [Icon Selector]                   │
├─────────────────────────────────────┤
│  + Insert Floor                      │
├─────────────────────────────────────┤
│ Floor 2 - Steel Production    [🗑️]  │
│   [Floor Name Input]                │
│   [Icon Selector]                   │
├─────────────────────────────────────┤
│  + Insert Floor (End)                │
└─────────────────────────────────────┘
```

#### 3.2 Form Data Management

**File**: `src/components/modals/FloorEditModal.vue`

**Challenge**: When inserting/removing floors during edit, we need to:

1. Update all form indices after the insertion/removal point
2. Maintain original indices for comparison (to detect changes)
3. Handle the case where user inserts, edits, then removes a floor

**Solution**: Track insertions/deletions separately:

```typescript
interface FloorEdit {
  type: 'update' | 'insert' | 'delete'
  index: number // current index in the form array
  originalIndex?: number // original index in factory (for updates)
  floor: FloorFormData
}
```

#### 3.3 Single Floor Edit Mode

**File**: `src/components/modals/FloorEditModal.vue`

When editing a single floor (clicking pencil icon on floor):

- Show only that floor's edit form
- NO insert buttons (insertion only available in "Edit All Floors")
- Show delete button, but disabled if floor has recipes

### Phase 4: Navigation & Display Updates

#### 4.1 Update Recipe Navigation

**Files**:

- `src/composables/useFloorNavigation.ts`
- `src/components/layout/NavPanel.vue`
- `src/components/factory/RecipeNode.vue`

**Change**: Use actual floor index from search rather than batch number

#### 4.2 Update Floor Display Numbers

**Files**:

- `src/composables/useFloorManagement.ts` (getFloorDisplayName)
- All components displaying "Floor X"

**Change**: Display uses `floorIndex + 1`, not `batchNumber + 1`

#### 4.3 Update Link Display

**File**: `src/composables/useLinkData.ts`

**Change**: When showing floor number for a recipe link:

```typescript
// OLD: targetRecipe.batchNumber + 1
// NEW: getFloorIndexForRecipe(targetRecipe) + 1
```

### Phase 5: Import/Export Compatibility

#### 5.1 Backward Compatibility

**File**: `src/types/factory.ts`

When importing old factories:

- Recipes will have batch numbers
- Floors may not exist or may be misaligned
- Solution: Reconstruct floors based on batch numbers (current behavior)

#### 5.2 Forward Compatibility

New exports will:

- Still include batch numbers (for dependency order visualization)
- Include explicit floor array with recipes in their floor positions
- On import, trust the floor array, not batch numbers

### Phase 6: Testing

#### 6.1 Unit Tests

**New test files**:

- `src/composables/__tests__/useFloorManagement.insert-remove.test.ts`

**Test cases**:

- Insert floor at beginning
- Insert floor in middle
- Insert floor at end
- Remove empty floor
- Cannot remove floor with recipes
- Floor name updates after insertion
- Floor name updates after removal
- Custom floor names unchanged during insert/remove
- Recipe batch numbers remain unchanged during floor operations

#### 6.2 Integration Tests

**Files**:

- `src/components/modals/__tests__/FloorEditModal.integration.test.ts` (new)

**Test cases**:

- Insert floor button appears in "Edit All" mode
- Insert floor button hidden in "Edit Single" mode
- Delete button disabled for non-empty floors
- Delete button enabled for empty floors
- Inserting floor updates subsequent floor numbers
- Removing floor updates subsequent floor numbers

#### 6.3 Navigation Tests

**Files**:

- Update existing navigation tests to work with new ID scheme

## Migration Strategy

### Breaking Changes

1. DOM IDs for recipes will change from `recipe-${batchNumber}-${name}` to `recipe-${name}`
2. Recipe panel values will change from `${batchNumber}-${name}` to just `${name}` (or with instance counter)

### Mitigation

1. Persisted state (localStorage) will auto-migrate because:
   - Floor arrays are stored directly
   - Recipe expansion state will reset (acceptable UX)
   - Navigation state is ephemeral

2. No external API impact (import/export handles both formats)

## Implementation Order

1. **Phase 4.3, 4.2, 4.1** - Fix navigation/display to not assume batch = floor (non-breaking prep work)
2. **Phase 1.3** - Update DOM ID generation (this is the breaking change - do all at once)
3. **Phase 1.2** - Update lookups to search instead of assuming alignment
4. **Phase 2** - Add insert/remove functions
5. **Phase 3** - Update FloorEditModal UI
6. **Phase 6** - Tests
7. **Phase 5** - Import/export updates (if needed)

## Open Questions

1. **Should we visualize batch numbers separately from floor positions?**
   - Could add a "Production Order" badge showing batch number
   - Helps users understand dependency chains
   - Not in initial scope, but worth considering

2. **Should we allow recipes to move batch numbers?**
   - Currently batch is determined by graph solver
   - Manual override could break dependency chains
   - Suggest: No, keep batch numbers immutable after import

3. **How to handle merged batch numbers (multiple batches on one floor)?**
   - User might move batch 0 and batch 2 recipes to same floor
   - This is actually fine - floor is just organization
   - Display could show batch badges to maintain visibility

4. **Should empty floors be auto-cleaned on save?**
   - User creates floor, doesn't use it
   - Option 1: Keep it (user intent)
   - Option 2: Remove on save (cleaner)
   - Suggest: Keep it, let user explicitly delete

## Edge Cases

1. **Import factory with misaligned batch/floor mapping**: Already works, reconstruct floors
2. **Move all recipes from floor, then delete**: Works with new `canRemoveFloor()`
3. **Insert floor, then immediately delete**: Should cancel out, no net change
4. **Rapid insertions/deletions**: Use unique keys in v-for to prevent Vue rendering issues
5. **Floor names with "Floor" but non-numeric**: Regex won't match, name preserved ✓
6. **Floor names with numbers elsewhere**: e.g. "Building 2 - Floor Alpha" - preserved ✓

## Success Criteria

- ✅ Can insert empty floor at any position
- ✅ Floor numbers in default names update automatically
- ✅ Custom floor names preserved during insert/remove
- ✅ Cannot delete floors with recipes
- ✅ Can delete empty floors
- ✅ Recipe navigation still works after floor changes
- ✅ Batch numbers remain unchanged
- ✅ Import/export preserves floor structure
- ✅ All existing tests pass
- ✅ New operations have test coverage

## Timeline Estimate

- Phase 1: 3-4 hours (refactoring, lots of callsites)
- Phase 2: 1-2 hours (new functions)
- Phase 3: 3-4 hours (UI work, forms are complex)
- Phase 4: 1-2 hours (navigation updates)
- Phase 5: 1 hour (import/export, likely minimal)
- Phase 6: 3-4 hours (comprehensive testing)

**Total: 12-17 hours of development time**

## Future Enhancements

1. Drag-and-drop floor reordering
2. Drag-and-drop recipe moving between floors
3. Batch number visualization badges
4. Floor collapse/expand state persistence
5. Bulk floor operations (delete all empty, merge floors, etc.)
