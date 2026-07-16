# Regeneration Bug Fix Plan

## Top-Level Overview

When a single tile is rerolled, the regenerated content often belongs to the wrong facet type. For example, rerolling "Reference Constellation" in writing mode produces content that looks like tension pairs or subject matter instead of literary references/authors.

There are two root causes:

1. **No context from locked tiles in the AI prompt.** When regenerating a single facet, the backend builds a prompt with only `medium` and `keywords`. The values of the locked tiles (the rest of the creative direction) are never shown to the model. Without that context, the model is generating almost from scratch and can drift to any facet type it feels is appropriate.

2. **Medium-agnostic facet descriptions.** The `reference_constellation` description ("3–5 named works, artists, or aesthetic descriptors that define the aesthetic territory") does not vary by medium. In writing mode the model should be directed toward authors, literary works, and prose styles — not visual references. Some other facets (e.g. `structural_anchor`, `tension_pair`) may also benefit from medium-specific guidance.

Fixing both issues together should eliminate the wrong-type regeneration.

---

## Sub-Tasks

### Sub-Task 1: Pass locked facet values as context to the AI prompt

**Intent**  
When regenerating a single tile (or a subset), the AI model should see the current values of all locked facets so it can generate the new tile in context. This prevents the model from generating an isolated, decontextualised value that doesn't fit the creative direction.

**Expected Outcomes**  
- The `_build_messages` function in `backend/services/watsonx.py` accepts the locked facet dict and includes locked values in the prompt.
- The AI prompt now shows something like `"Existing creative direction: { emotional_core: '...', sensory_palette: '...' }"` before asking for the new value(s).
- Rerolling any single tile produces content that feels consistent with the rest of the prompt set.

**Todo List**  
1. In `backend/services/watsonx.py`, update `_build_messages` to accept an optional `locked_context: Dict[FacetKey, str]` parameter.
2. If `locked_context` is non-empty, prepend a short "Existing creative direction" block in the user message that lists each locked facet key and its current value.
3. In `generate_facets`, pass the `locked` dict into `_build_messages` as `locked_context`.

**Relevant Context**  
- [`backend/services/watsonx.py`](backend/services/watsonx.py) — `_build_messages` (line 43), `generate_facets` (line 106), `messages` construction (line 118)
- The locked dict is already available at line 108 as `locked: Dict[FacetKey, str]`
- Keep the context block concise — just `key: value` pairs, no descriptions needed

**Status** — `[ ] pending`

---

### Sub-Task 2: Add medium-specific descriptions for `reference_constellation`

**Intent**  
The current description for `reference_constellation` ("3–5 named works, artists, or aesthetic descriptors") is biased toward visual references. In writing and music modes the model should be guided toward medium-appropriate touchstones.

**Expected Outcomes**  
- `reference_constellation` has a different description string for each medium.
- In writing mode: directs toward authors, novels, poetry collections, and prose styles.
- In music mode: directs toward composers, albums, genres, and sonic touchstones.
- In visual mode: retains the current description (artists, aesthetic descriptors).
- Rerolling "Reference Constellation" in writing mode produces literary/writerly references.

**Todo List**  
1. In `backend/services/watsonx.py` inside `_build_messages`, replace the single `reference_constellation` entry in `facet_descriptions` with a medium-aware lookup (similar to how `sensory_palette` already uses `palette_label`).
2. Define the three medium-specific strings inline or as a small dict keyed on `Medium`.

**Relevant Context**  
- [`backend/services/watsonx.py`](backend/services/watsonx.py) — `facet_descriptions` dict (lines 46–55), existing `_PALETTE_LABEL` pattern (line 19–23)
- [`backend/models/schemas.py`](backend/models/schemas.py) — `Medium` enum (line 7)

**Status** — `[ ] pending`

---

## Notes for Implementation

- Both sub-tasks are in the same file (`backend/services/watsonx.py`) and can be done in one pass.
- Sub-Task 1 is higher priority — it addresses the core reason wrong content appears.
- Sub-Task 2 is a quality-of-life fix that reduces visual bias in writing/music modes.
- No frontend changes are needed.
- After fixing, test by rerolling "Reference Constellation" in writing mode with some existing facet values to confirm the output is both the right type and contextually coherent.
