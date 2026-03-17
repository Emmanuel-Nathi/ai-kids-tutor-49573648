

# Refactor ChildSetupWizard into Sub-Components

## Approach

Extract each step's UI into its own component under `src/components/wizard/`, keeping the parent `ChildSetupWizard` responsible only for step navigation, state management, and the final Supabase submission.

## New Files

### `src/components/wizard/NameStep.tsx`
Props: `{ name, setName, onNext }` — the name input with Enter-to-advance.

### `src/components/wizard/CurriculumStep.tsx`
Props: `{ curriculum, setCurriculum }` — the three curriculum cards (CAPS/IEB/Cambridge).

### `src/components/wizard/GradeStep.tsx`
Props: `{ grade, setGrade }` — the 8-button grade grid.

### `src/components/wizard/PinStep.tsx`
Props: `{ pin, setPin }` — PIN display dots + numeric keypad. Handles digit add/delete internally.

## Modified File

### `src/components/ChildSetupWizard.tsx`
- Remove all step-specific JSX (lines 89-184)
- Replace with `<NameStep />`, `<CurriculumStep />`, `<GradeStep />`, `<PinStep />` based on current step
- Keep: step state, form data state, `canNext` logic, `owlMessage`, navigation buttons, `handleComplete`

## No breaking changes
Same exports, same routes, identical UI and behavior.

