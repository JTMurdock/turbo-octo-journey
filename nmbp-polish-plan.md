# No More Blank Pages — Polish & Feature Expansion Plan

## Overview

The app's core generation logic is complete. This plan covers a visual and structural overhaul to match the design mockup: a sidebar-nav shell, visual color palette swatches, an Inspiration tab powered by Pixabay, a Saved Themes tab integrated into the sidebar, and a new "Subject Matter" facet card that gives the user a concrete scene/scenario jumping-off point.

**Scope of changes:**
- Frontend: full layout restructure (sidebar + main panel), new components, Pixabay API integration, CSS overhaul
- Backend: extend `GenerateResponse` to include structured color palette data; add `subject_matter` to the `FacetKey` enum and prompt builder

**Non-goals for this pass:**
- User accounts or server-side persistence (still localStorage only)
- Export / share functionality
- Mobile-first responsive breakpoints (desktop-first, same as current)

---

## Sub-Tasks

---

### Sub-Task 1 — Backend: Add `subject_matter` Facet & Structured Color Palette

**Intent:**
Extend the backend to generate two new pieces of data:
1. A `subject_matter` facet — a concrete scene or scenario idea appropriate for the medium (e.g. "two strangers share an umbrella on a rain-soaked platform" for visual).
2. A structured color palette (for `visual` medium only) — 4 hex colors with names, so the frontend can render actual swatches instead of prose text.

The color data should live in a new top-level key on `GenerateResponse` (`palette_colors`) rather than replacing `sensory_palette`, so the prose description is preserved and the swatches are additive.

**Expected Outcomes:**
- `FacetKey` enum gains `subject_matter` as the 8th key.
- `GenerateResponse` gains an optional `palette_colors: list[PaletteColor]` field where `PaletteColor` is `{hex: str, name: str}`.
- The watsonx prompt builder requests `subject_matter` alongside the other facets.
- For `visual` medium, the prompt also requests a `palette_colors` array of exactly 4 objects `{hex, name}` in the response JSON.
- For `writing` and `music` mediums, `palette_colors` is omitted from both the prompt and the response.
- The existing 7 facets continue to work unchanged.

**Todo List:**
1. In `backend/models/schemas.py`: add `subject_matter = "subject_matter"` to `FacetKey`; add `PaletteColor(BaseModel)` with `hex: str` and `name: str`; add `palette_colors: Optional[List[PaletteColor]] = None` to `GenerateResponse`.
2. In `backend/services/watsonx.py`: add `subject_matter` description to `facet_descriptions`; for `visual` medium, append a `palette_colors` instruction to the user prompt (ask for exactly 4 objects with `hex` and `name` keys); extract and validate `palette_colors` from the model JSON response; pass it through in the return dict.
3. Verify with a manual `curl` call that the response includes `palette_colors` for visual and omits it for writing/music.

**Relevant Context:**
- `backend/models/schemas.py` — `FacetKey` enum, `GenerateResponse`
- `backend/services/watsonx.py` — `_build_messages()` and `generate_facets()`
- The model already returns strict JSON; adding `palette_colors` to the schema instructions should be sufficient
- Subject matter description example: "a concrete scene, scenario, or subject — specific enough to spark an immediate mental image (e.g. 'two strangers share an umbrella on a rain-soaked platform')"

**Status:** [x] done

---

### Sub-Task 2 — Frontend: Add `subject_matter` Facet & Palette Swatches to FacetCard

**Intent:**
Surface the new backend data in the UI:
1. Register `subject_matter` in the frontend facet constants and ensure it renders as a normal card in the grid.
2. Extend `FacetCard` so that when `facetKey === "sensory_palette"` and `medium === "visual"`, it renders the `palette_colors` swatches (colored squares + hex + name) below the prose description instead of showing prose alone.

`usePlanner` needs to forward `palette_colors` from the API response down to `PlannerPanel` → `FacetCard`.

**Expected Outcomes:**
- The facet grid now has 8 cards; `subject_matter` appears last.
- For `visual` medium, the Palette card shows 4 color swatches (each ~48×48px square, hex code, and color name label) beneath the prose.
- For `writing` and `music`, the Palette card shows prose only (unchanged behavior).
- Swatches use inline styles derived from the hex values returned by the backend.

**Todo List:**
1. In `frontend/src/constants/facetKeys.js`: add `"subject_matter"` to `FACET_KEYS` array; add label `"Subject Matter"` to `FACET_LABELS`.
2. In `frontend/src/hooks/usePlanner.js`: capture `data.palette_colors` from API responses; expose it as `paletteColors` state; reset to `null` on `generate()`; preserve on `rerollAll()` and `reroll()` unless the palette card is being rerolled.
3. In `frontend/src/components/FacetCard.jsx`: accept a `paletteColors` prop; when `facetKey === "sensory_palette"` and `medium === "visual"` and `paletteColors` is truthy, render a `.facet-card__swatches` div containing one `.facet-card__swatch` element per color.
4. In `frontend/src/components/FacetCard.css`: add swatch styles — small square with `background-color`, hex label below in `--color-text-muted`, flex row wrapping, subtle border radius.
5. Wire `paletteColors` through `App.jsx` → `PlannerPanel` → `FacetCard` (only the `sensory_palette` card receives it).

**Relevant Context:**
- `frontend/src/constants/facetKeys.js` — `FACET_KEYS`, `FACET_LABELS`
- `frontend/src/hooks/usePlanner.js` — `callApi()`, state declarations
- `frontend/src/components/FacetCard.jsx` and `FacetCard.css`
- `frontend/src/components/PlannerPanel.jsx` — props forwarding

**Status:** [x] done

---

### Sub-Task 3 — Frontend: Full Layout Redesign (Sidebar Shell)

**Intent:**
Restructure `App.jsx` and its CSS into a two-column shell: a narrow fixed left sidebar with icon-nav tabs, and a main content panel that renders different tab views. The sidebar has four nav items matching the mockup: **Prompt Set** (the current planner), **Inspiration** (Pixabay images), **Saved** (saved themes), and a **Settings** stub. The current top-of-page header, input controls, and planner panel all move into the Prompt Set tab view.

This is a layout restructure — no generation logic changes.

**Expected Outcomes:**
- App renders a fixed left sidebar (~80px wide) with icon + label for each tab; active tab is highlighted.
- Main content area fills the remaining width and height.
- Clicking a sidebar tab switches the active view.
- The Prompt Set tab shows everything the current app shows (input controls + planner panel).
- Inspiration and Saved tabs show placeholder content (to be filled in Sub-Tasks 4 & 5).
- Settings tab shows a minimal stub.
- The app's dark color palette and CSS variable system are preserved; the new layout uses the existing `--color-*` and `--space-*` variables.

**Todo List:**
1. Create `frontend/src/components/Sidebar.jsx` and `Sidebar.css` — renders the vertical nav; accepts `activeTab` and `onTabChange` props; tabs: `prompt-set`, `inspiration`, `saved`, `settings` with appropriate SVG icons or Unicode symbols.
2. Refactor `frontend/src/App.jsx` to be a shell: manage `activeTab` state; render `<Sidebar>` on the left and a `<main>` content panel on the right; conditionally render tab content based on `activeTab`.
3. Create `frontend/src/components/PromptSetView.jsx` — extract the existing input controls + planner panel + save button JSX from `App.jsx` into this component; it receives all the same props it did before.
4. Update `frontend/src/App.css` to implement the two-column shell layout (`display: flex`, `height: 100vh`, `overflow: hidden` on `.app`; sidebar fixed width; main panel `flex: 1; overflow-y: auto`).
5. Add placeholder components `InspirationView.jsx` and `SavedView.jsx` (simple `<div>Tab coming soon</div>` stubs for now).

**Relevant Context:**
- `frontend/src/App.jsx` — current monolithic layout to be split
- `frontend/src/App.css` — layout CSS to restructure
- `frontend/src/styles/variables.css` — all CSS custom properties to reuse
- The mockup shows the sidebar at ~80px wide with icon + small label per tab

**Status:** [x] done

---

### Sub-Task 4 — Frontend: Inspiration Tab (Pixabay Integration)

**Intent:**
Implement the Inspiration tab: when active, it searches Pixabay for images matching the current theme and displays a masonry-style grid of photos. The search query is derived from the active theme string (or falls back to the current keywords). Fetching is lazy — images are only loaded when the Inspiration tab is opened or when the theme changes while the tab is open.

**Expected Outcomes:**
- `InspirationView` component makes a Pixabay API call using the current `theme` (or `keywords` if no theme yet) as the search query.
- Displays up to 12 images in a responsive grid (3–4 columns).
- Each image tile shows the photo with a subtle overlay on hover and attribution (photographer name + link to Pixabay page).
- A "Refresh" button triggers a new search.
- If `theme` and `keywords` are both empty, shows a prompt: "Generate a theme first to see inspiration images."
- Loading state: skeleton placeholders while images are fetching.
- Error state: "Could not load images. Check your API key." message.
- Pixabay API key is stored in `frontend/.env` as `VITE_PIXABAY_API_KEY` (documented in `.env.example`).

**Todo List:**
1. Add `VITE_PIXABAY_API_KEY=your_key_here` to `frontend/.env.example`.
2. Create `frontend/src/hooks/useInspirationImages.js` — manages fetch state (`images`, `isLoading`, `error`); calls `https://pixabay.com/api/?key={KEY}&q={query}&image_type=photo&per_page=12&safesearch=true`; re-fetches when query changes.
3. Build `frontend/src/components/InspirationView.jsx` and `InspirationView.css` — renders the image grid using data from `useInspirationImages`; includes skeleton placeholders and refresh button.
4. Wire `theme` and `keywords` from `usePlanner` through `App.jsx` into `InspirationView` (they are already available in App).
5. Replace the stub `InspirationView` from Sub-Task 3 with the real component.

**Relevant Context:**
- Pixabay free API: `GET https://pixabay.com/api/?key=KEY&q=QUERY&image_type=photo&per_page=12` — returns `hits[]` with `webformatURL`, `pageURL`, `user`, `tags`
- No backend proxy needed — Pixabay supports browser-side CORS requests
- `frontend/src/App.jsx` — `theme` and `keywords` are already in scope from `usePlanner`
- `frontend/.env.example` — add the new key here

**Status:** [x] done

---

### Sub-Task 5 — Frontend: Saved Tab (Saved Themes in Sidebar)

**Intent:**
Move saved themes out of the inline `SavedList` component and into the dedicated Saved sidebar tab. The `SavedView` component replaces the old `SavedList` component in the main content area, providing a richer display: each saved item shows the theme name, medium badge, timestamp, a preview of 2–3 facets, and restore/delete actions. The restore confirmation dialog stays in `App.jsx`.

**Expected Outcomes:**
- Clicking the Saved sidebar tab opens `SavedView` as the main content.
- `SavedView` renders each snapshot as a card: theme title, medium chip, date, a short excerpt of 2 facets, and Restore + Delete buttons.
- Restoring switches the active tab back to Prompt Set and loads the snapshot.
- Deleting removes the item with no confirmation (same as current behavior).
- The inline `SavedList` component is removed from the Prompt Set view (no longer rendered there).
- Empty state: "No saved themes yet. Generate a theme and click Save to keep it." 

**Todo List:**
1. Build `frontend/src/components/SavedView.jsx` and `SavedView.css` — grid of saved snapshot cards; each card shows theme, medium, date, short excerpt, Restore, and Delete buttons.
2. In `frontend/src/App.jsx`: pass `savedList`, `onRestore`, `onDelete` into `SavedView`; on restore, also call `setActiveTab("prompt-set")` to switch back to the planner.
3. Remove `<SavedList>` from `PromptSetView` / `App.jsx`.
4. The restore confirmation dialog in `App.jsx` stays as-is.

**Relevant Context:**
- `frontend/src/hooks/useSavedGenerations.js` — `savedList`, `saveSnapshot`, `deleteSnapshot`
- `frontend/src/components/SavedList.jsx` — existing component to replace/supersede
- `frontend/src/App.jsx` — `pendingRestore`, `handleRestoreRequest`, `handleRestoreConfirm` dialog logic stays here

**Status:** [x] done

---

## Implementation Notes

- Sub-Tasks 1 and 2 are backend/frontend counterparts for the same data change — do them sequentially (1 then 2).
- Sub-Task 3 (layout shell) must be done before Sub-Tasks 4 and 5 (they fill in the tab stubs it creates).
- Sub-Tasks 4 and 5 are independent of each other and can be done in either order after Sub-Task 3.
- Each sub-task should be self-contained and produce a reviewable, runnable state before the next one starts.

---

## New Environment Variables

| Variable | Location | Required | Description |
|---|---|---|---|
| `VITE_PIXABAY_API_KEY` | `frontend/.env` | Yes (for Inspiration tab) | Pixabay API key — get one free at pixabay.com/api |

---

## File Map (new + changed files)

| File | Status | Sub-Task |
|---|---|---|
| `backend/models/schemas.py` | Modified | 1 |
| `backend/services/watsonx.py` | Modified | 1 |
| `frontend/src/constants/facetKeys.js` | Modified | 2 |
| `frontend/src/hooks/usePlanner.js` | Modified | 2 |
| `frontend/src/components/FacetCard.jsx` | Modified | 2 |
| `frontend/src/components/FacetCard.css` | Modified | 2 |
| `frontend/src/components/PlannerPanel.jsx` | Modified | 2 |
| `frontend/src/App.jsx` | Modified | 3, 5 |
| `frontend/src/App.css` | Modified | 3 |
| `frontend/src/components/Sidebar.jsx` | New | 3 |
| `frontend/src/components/Sidebar.css` | New | 3 |
| `frontend/src/components/PromptSetView.jsx` | New | 3 |
| `frontend/src/components/InspirationView.jsx` | New (stub→real) | 3, 4 |
| `frontend/src/components/InspirationView.css` | New | 4 |
| `frontend/src/hooks/useInspirationImages.js` | New | 4 |
| `frontend/.env.example` | Modified | 4 |
| `frontend/src/components/SavedView.jsx` | New | 5 |
| `frontend/src/components/SavedView.css` | New | 5 |
