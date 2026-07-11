# No More Blank Pages — Build Plan

## Overview

A persistent creative-planning web app that helps artists, writers, and musicians get unstuck at the start of a project. The user provides up to 100 words of input (or triggers a random theme from a local word list), and the app generates seven structured creative-planning facets via IBM watsonx / Granite-3.3-8b-instruct. The app never produces final creative content — only structured decisions the user can react to and refine.

**Stack:**
- Frontend: React + Vite, plain CSS variables (no Tailwind)
- Backend: FastAPI, `ibm-watsonx-ai` SDK
- Model: `ibm/granite-3-3-8b-instruct` via a single `/planner/generate` endpoint
- Persistence: localStorage for saved generations only; active session is in-memory

**Interaction Model:**
- **"Generate" button** — first-time generation; populates all seven facets
- **"Reroll All" button** — regenerates all unlocked facets; locked ones stay fixed
- **Per-card reroll button** — regenerates exactly that one facet regardless of its lock state; all other facets (locked or not) are untouched
- **Restoring a saved snapshot** — shows a confirmation dialog ("This will replace your current session") before overwriting the active panel
- **API error display** — any generation failure shows "Something went wrong, please retry" inline; no automatic retry

**Non-goals for this version:**
- User accounts or server-side persistence
- Exporting or sharing sessions
- Any medium beyond visual / writing / music

---

## Architecture Snapshot

```
/
├── backend/
│   ├── main.py                  # FastAPI app entry
│   ├── routers/planner.py       # /planner/generate endpoint
│   ├── services/watsonx.py      # ibm-watsonx-ai client + prompt builder
│   ├── models/schemas.py        # Pydantic request/response models
│   ├── .env                     # gitignored — secrets live here
│   └── .env.example             # committed — documents required vars
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── KeywordInput.jsx      # textarea + word-count + Generate btn
│   │   │   ├── RandomThemeButton.jsx # picks random seed from word list
│   │   │   ├── MediumSwitcher.jsx    # visual / writing / music tabs
│   │   │   ├── FacetCard.jsx         # single facet: content + lock + reroll
│   │   │   ├── PlannerPanel.jsx      # 7-facet grid
│   │   │   ├── SaveButton.jsx        # saves snapshot to localStorage list
│   │   │   └── SavedList.jsx         # renders saved snapshots
│   │   ├── hooks/
│   │   │   ├── usePlanner.js         # core state machine + API calls
│   │   │   └── useSavedGenerations.js# localStorage read/write
│   │   ├── data/
│   │   │   └── randomWords.js        # curated word list for random theme
│   │   └── styles/
│   │       └── variables.css         # CSS custom properties
│   └── index.html
```

---

## Sub-Tasks

---

### Sub-Task 1 — Project Scaffolding & Environment Setup

**Intent:**  
Create the monorepo folder structure, initialize both the Vite/React frontend and the FastAPI backend, and document all environment variables needed to run the app locally. This gives every subsequent sub-task a stable, runnable skeleton to build on.

**Expected Outcomes:**
- `frontend/` boots with `npm run dev` and shows a default Vite/React page
- `backend/` boots with `uvicorn main:app --reload` and returns `{"status":"ok"}` from `GET /health`
- `.env.example` documents all required watsonx variables
- `.gitignore` covers `node_modules`, `__pycache__`, `.env`, `dist`

**Todo List:**
1. Create `frontend/` via `npm create vite@latest frontend -- --template react`
2. Remove Vite boilerplate (default CSS, SVGs, counter logic); leave a bare `App.jsx` shell
3. Create `backend/` directory; add `requirements.txt` with `fastapi`, `uvicorn[standard]`, `ibm-watsonx-ai`, `python-dotenv`, `pydantic`
4. Write `backend/main.py` with a `/health` GET route
5. Write `backend/.env.example` documenting: `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, `WATSONX_URL` (e.g. `https://us-south.ml.cloud.ibm.com`), `WATSONX_MODEL_ID` (default `ibm/granite-3-3-8b-instruct`)
6. Add root `.gitignore` covering both frontend and backend artifacts
7. Add a root `README.md` with local-run instructions (install, env setup, dev commands)

**Relevant Context:**
- No existing codebase — pure greenfield
- IBM watsonx SDK requires: API key, project ID, regional URL, and model ID at minimum

**Status:** [x] done

---

### Sub-Task 2 — Backend: Schemas, Watsonx Service & `/planner/generate` Endpoint

**Intent:**  
Build the complete backend data contract and AI integration. The endpoint receives the full session state (keywords, medium, which facets are locked) and returns only the unlocked facets, regenerated. This is the only backend route the frontend ever calls.

**Expected Outcomes:**
- `POST /planner/generate` accepts the defined request schema and returns a valid JSON response matching the response schema
- Locked facets are passed through unchanged; only unlocked ones are sent to the model
- The model is prompted with structured instructions that enforce JSON output for all seven facets
- A `random: true` flag on the request causes the backend to treat the keyword field as a pre-formed random seed (no special backend logic needed — random theme is assembled on the frontend)
- The endpoint can be tested with `curl` or the FastAPI `/docs` UI

**Todo List:**
1. Write `backend/models/schemas.py`:
   - `Medium` enum: `visual | writing | music`
   - `FacetKey` enum: `emotional_core | sensory_palette | structural_anchor | tension_pair | reference_constellation | constraint | avoid_list`
   - `FacetValue`: content string
   - `GenerateRequest`: `keywords: str` (max 100 words), `medium: Medium`, `locked_facets: dict[FacetKey, FacetValue]`
   - `GenerateResponse`: `facets: dict[FacetKey, FacetValue]`, `theme: str`
2. Write `backend/services/watsonx.py`:
   - Load credentials from `.env` via `python-dotenv`
   - Initialize `ibm-watsonx-ai` `ModelInference` client
   - `build_prompt(keywords, medium, unlocked_keys)` — constructs a system+user prompt that instructs the model to return a JSON object with exactly the unlocked facet keys, using medium-appropriate vocabulary labels (palette for visual, diction for writing, timbre for music)
   - `generate_facets(request)` — calls the model, parses JSON response, merges locked facets back in
3. Write `backend/routers/planner.py` with `POST /planner/generate`
4. Register the router in `main.py`; add CORS middleware permitting `localhost:5173`
5. Manually test end-to-end with a `curl` call and confirm JSON shape

**Relevant Context:**
- Sensory palette label/vocabulary changes per medium: `palette` (visual), `diction` (writing), `timbre` (music)
- Reference constellation should produce a mix of named works/artists and abstract aesthetic descriptors
- The model must be instructed to return strict JSON — use a system prompt that says "respond only with a JSON object, no prose"
- `ibm-watsonx-ai` SDK: `ModelInference(model_id=..., credentials=Credentials(api_key=..., url=...), project_id=...)`
- **Note:** `ibm-watsonx-ai` requires Python ≥3.10; this project uses the watsonx REST API directly via `httpx` instead.

**Status:** [x] done

---

### Sub-Task 3 — Frontend: State, API Hook & Random Word List

**Intent:**  
Build the core client-side logic: the `usePlanner` hook that owns all session state (keywords, medium, facets, lock states) and the `useSavedGenerations` hook for localStorage persistence of saved snapshots. Also produce the curated random word list.

**Expected Outcomes:**
- `usePlanner` exposes: `keywords`, `setKeywords`, `medium`, `setMedium`, `facets`, `lockStates`, `toggleLock(facetKey)`, `generate()`, `reroll(facetKey)`, `isLoading`, `error`
- `generate()` sends all state to `/planner/generate` and merges the response into local facet state
- `rerollAll()` sends state with current lock map — backend returns only unlocked facets
- `reroll(facetKey)` targets exactly one facet: sends a request with all facets locked except that one key; all other lock states are unchanged after the response
- `useSavedGenerations` exposes: `savedList`, `saveSnapshot(facets, theme, medium)`, `deleteSnapshot(id)`; reads/writes `localStorage` under key `nmbp_saved`
- `randomWords.js` exports a curated list of ~60–80 evocative words/phrases grouped loosely (moods, textures, times, places, objects) from which 3–5 are sampled to form a random seed

**Todo List:**
1. Create `frontend/src/data/randomWords.js` with ~60–80 words across mood, texture, time-of-day, place, and object categories
2. Write `frontend/src/hooks/usePlanner.js` with the full state machine described above
3. Write `frontend/src/hooks/useSavedGenerations.js` with localStorage read/write and snapshot schema `{id, timestamp, theme, medium, facets}`
4. Define the seven facet keys as a shared constant (e.g. `FACET_KEYS` array) accessible to both hooks and components

**Relevant Context:**
- `reroll(facetKey)` temporarily marks every facet locked except the target key before calling the API, then restores the previous lock map exactly after the response — so per-card reroll never disturbs any other card's lock state
- `rerollAll()` simply sends the current lock map as-is; the backend handles which facets to regenerate
- The API base URL should be read from `import.meta.env.VITE_API_URL` (defaulting to `http://localhost:8000`)
- Saved snapshots are in-memory during a session and survive refresh via localStorage

**Status:** [x] done

---

### Sub-Task 4 — Frontend: UI Components

**Intent:**  
Build all React components that compose the planning panel. Components are presentational where possible; they receive state and callbacks from `usePlanner` via `App.jsx`. Styling uses plain CSS variables — no Tailwind or CSS-in-JS.

**Expected Outcomes:**
- `KeywordInput` renders a textarea with a live word count (capped at 100) and a "Generate" button
- `RandomThemeButton` picks 3–5 random words from the word list and calls `setKeywords`
- `MediumSwitcher` renders three tab buttons (Visual / Writing / Music) and calls `setMedium`
- `FacetCard` renders: facet label (medium-aware), content text, a lock toggle icon button, a reroll icon button (disabled when locked)
- `PlannerPanel` renders the 7-facet grid using `FacetCard`
- `SaveButton` calls `saveSnapshot` and shows a brief confirmation
- `SavedList` renders saved snapshots as cards with a timestamp, theme label, and delete button; clicking a card restores that snapshot to the active panel

**Todo List:**
1. Write `frontend/src/styles/variables.css` — define CSS custom properties for colors, spacing, font sizes, border radius, and a dark/light neutral palette fitting a creative tool aesthetic
2. Build `KeywordInput.jsx` with word-count guard (disable input or trim at 100 words)
3. Build `RandomThemeButton.jsx` that samples from `randomWords.js`
4. Build `MediumSwitcher.jsx` with active-tab styling
5. Build `FacetCard.jsx` — include lock icon (🔒/🔓) and a per-card reroll icon (↻); per-card reroll is always enabled regardless of lock state (lock only affects "Reroll All")
6. Build `PlannerPanel.jsx` — 7-card grid layout; includes a "Reroll All" button above the grid
7. Build `SaveButton.jsx` with a brief "Saved!" flash state
8. Build `SavedList.jsx` with restore-on-click (shows a confirmation dialog: "This will replace your current session. Continue?") and delete per item
9. Wire everything together in `App.jsx` using `usePlanner` and `useSavedGenerations`

**Relevant Context:**
- Sensory palette facet label changes per medium: "Palette" (visual), "Diction" (writing), "Timbre" (music) — this mapping belongs in a shared constant
- The theme string returned by the backend should be displayed prominently above the facet grid (e.g. as a subtitle under the app title)
- Loading state should disable all interactive controls (Generate, Reroll All, per-card reroll, lock toggles) and show a visual indicator on the affected cards
- Per-card reroll button is always clickable (not gated by lock state) — lock only gates "Reroll All"
- `SavedList` should appear below or beside the main panel — a collapsed/expandable section works well

**Status:** [x] done

---

### Sub-Task 5 — Integration, Polish & README

**Intent:**  
Connect frontend and backend in a running local environment, verify the full user journey end-to-end, fix any integration seams, and finalize the README so a new developer can clone and run the project with zero guesswork.

**Expected Outcomes:**
- Full user flow works: enter keywords → Generate → see 7 facets → lock one → Reroll others → Save → refresh page → saved item still in list → restore it
- Random theme button populates keywords and triggering Generate works identically to manual input
- Medium switch changes vocabulary labels on facet cards without resetting facet content
- `.env.example` is accurate and complete; README covers: prerequisites, env setup, install steps, dev run commands for both frontend and backend
- No console errors in the browser; no unhandled exceptions in the backend logs

**Todo List:**
1. Add `VITE_API_URL=http://localhost:8000` to `frontend/.env.example`
2. Verify CORS is configured correctly so `localhost:5173` → `localhost:8000` calls succeed
3. Smoke-test each interaction: generate, lock, reroll, save, delete, restore, medium switch, random theme
4. Add inline error display: any failed API call (network error, malformed JSON, model error) shows "Something went wrong, please retry" near the Generate / Reroll All button; no automatic retry logic
5. Finalize `README.md` with complete setup instructions, environment variable table, and dev commands

**Relevant Context:**
- FastAPI auto-docs at `http://localhost:8000/docs` are useful for manual backend testing
- Common watsonx pitfall: the regional URL must match the resource group region (e.g. `us-south` vs `eu-de`)
- The `ibm-watsonx-ai` SDK may require the `WATSONX_URL` to end without a trailing slash

**Status:** [ ] pending

---

## Environment Variable Reference

| Variable | Required | Description |
|---|---|---|
| `WATSONX_API_KEY` | Yes | IBM Cloud API key with watsonx.ai access |
| `WATSONX_PROJECT_ID` | Yes | watsonx.ai project ID (found in project settings) |
| `WATSONX_URL` | Yes | Regional endpoint, e.g. `https://us-south.ml.cloud.ibm.com` |
| `WATSONX_MODEL_ID` | No | Defaults to `ibm/granite-3-3-8b-instruct` |

Frontend:

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Backend base URL, defaults to `http://localhost:8000` |
