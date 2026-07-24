# Break the Blank

> *A curated prompt set to spark direction and overcome the blank page.*

---

## Problem Statement

Every creative project starts in the same place: a blank canvas, a cursor blinking on an empty document, silence before a note is played. The block isn't a lack of ideas — it's a lack of *direction*. Without a defined emotional register, a structural anchor, or a sense of what to avoid, a creator can spend hours circling the same vague impulse without committing to anything.

Existing tools either generate finished content (removing the creator from the process) or offer generic "inspiration" prompts with no structure. Neither approach helps a creator build a coherent creative direction they actually own.

**Break the Blank** is a structured creative-planning tool for visual artists, writers, and musicians. It doesn't make the work for you — it maps the territory so you know where to begin.

---

## Solution Description

Users enter up to 100 words describing a feeling, place, idea, or mood — or click **Random Theme** to seed the session from a curated word list. The app then generates a **prompt set**: eight interconnected creative-planning facets that together define a complete creative direction.

| Facet | What it provides |
|---|---|
| **Emotional Core** | The dominant emotion or psychological state driving the work |
| **Sensory Palette** | Visual palette / prose diction / sonic timbre (varies by medium) |
| **Structural Anchor** | The organizing formal or structural principle |
| **Tension Pair** | Two opposing forces or contradictions |
| **Reference Constellation** | 3–5 named works, artists, or styles that define the aesthetic territory |
| **Constraint** | One productive creative restriction to work within |
| **Avoid List** | 2–3 things to consciously avoid |
| **Subject Matter** | A concrete scene or scenario specific enough to spark an image |

Once generated, users can:
- **Lock** any facet they want to keep and **reroll** the rest (individually or all at once)
- **Save** prompt sets to a local library that persists across sessions
- **Switch medium** (Visual / Writing / Music) to shift the vocabulary of the palette and reference facets
- **Take notes** in a built-in notepad tied to the active theme

The app never generates the final creative work — only the structured decisions that make starting it possible.

---

## AI Approach and Architecture

### Overview

```
Browser (React + Vite)
        │
        │  POST /planner/generate
        │  { keywords, medium, locked_facets }
        ▼
FastAPI backend (Python)
        │
        │  IBM IAM token exchange
        │  Prompt construction
        ▼
IBM watsonx.ai — ibm/granite-4-h-small
        │
        │  JSON response: { facets, theme, quote, palette_colors }
        ▼
FastAPI merges locked + generated facets
        │
        ▼
Browser updates only the unlocked tiles
```

### Single Endpoint, Selective Regeneration

The backend exposes one route: `POST /planner/generate`. Every interaction — first generation, reroll all, single-tile reroll — uses the same endpoint. The request carries a `locked_facets` dict containing the current values of any facets the user has locked. The backend:

1. Derives `unlocked_keys` as the set difference between all eight facets and the locked set
2. Builds a prompt asking the model to generate **only** the unlocked keys
3. Merges the model's response with the locked values
4. Returns all eight facets to the frontend

This means the model is never asked to reproduce work it doesn't need to — reducing token cost and latency on partial rerolls.

### Contextual Regeneration

When a single tile is rerolled, the values of all locked facets are included in the prompt as an *"Existing creative direction"* block. The model generates the new facet in the context of the current session rather than cold, preventing content that belongs to a different aesthetic register.

### Medium-Aware Prompting

Facet descriptions in the prompt change based on the selected medium:

- **Sensory Palette**: Visual → colours and textures; Writing → prose diction, word register, sentence rhythm; Music → timbre, sonic texture, instrumental colour
- **Reference Constellation**: Visual → artists and art movements; Writing → authors, novels, and literary movements; Music → composers, albums, and sonic touchstones

This prevents the model from generating, for example, photography-style references when the user is working on prose.

### Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, plain CSS custom properties |
| Backend | FastAPI, Python 3.9+ |
| AI | IBM watsonx.ai REST API (`/ml/v1/text/chat`) |
| Model | `ibm/granite-4-h-small` |
| Persistence | Browser `localStorage` (no server-side storage) |

---

## Selected Challenge Theme

**Creativity & Expression** — the app is explicitly designed for creators facing the blank page. It augments the creative process at its most vulnerable moment (the beginning) without replacing human authorship. Every facet is a decision prompt, not a generated artifact.

---

## How IBM Bob Was Used

IBM Bob was used throughout the full development lifecycle of this project:

- **Planning** — Bob produced the initial build plan ([`no-more-blank-pages-plan.md`](no-more-blank-pages-plan.md)) breaking the project into discrete sub-tasks with clear intent, expected outcomes, and relevant file context. Each sub-task was implemented incrementally with Bob in Agent mode.
- **Architecture decisions** — Bob surfaced the tradeoff between using the `ibm-watsonx-ai` Python SDK vs. direct `httpx` REST calls, and recommended the REST approach for flexibility and to avoid SDK version constraints.
- **Prompt engineering** — Bob designed the initial prompt structure (system + user message, JSON-only output, facet description schema) and later debugged why regeneration was producing wrong-type content — tracing the issue to missing locked-facet context and medium-agnostic descriptions, then implementing both fixes.
- **Bug investigation** — When regenerated tiles were returning wrong content types (e.g. tension-pair content appearing in the reference constellation slot), Bob read the full request/response chain, identified the two root causes, wrote a diagnosis plan, and applied the targeted fixes in a single backend file.
- **Polish pass** — Bob reviewed the diction facet output, identified that the description was inadvertently prompting sensory imagery instead of prose style guidance, and corrected the description to produce actionable writing-mode results.
- **Code review and refinement** — Bob enforced minimal-change discipline throughout, avoiding unnecessary refactors or feature creep beyond what each task required.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| Python | 3.9+ |
| pip | latest |

You also need an **IBM watsonx.ai** account with:
- An API key (IBM Cloud → Manage → Access → API Keys)
- A project with `ibm/granite-4-h-small` deployed (or any available Granite model)
- Your project's region and project ID

---

## Project Structure

```
/
├── backend/          FastAPI app + watsonx integration
│   ├── main.py
│   ├── routers/planner.py
│   ├── services/watsonx.py
│   ├── models/schemas.py
│   └── .env.example
├── frontend/         React + Vite app
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── constants/
│       └── data/
├── .gitignore
└── README.md
```

---

## Setup

### 1. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and fill in your watsonx credentials
```

#### Environment Variables (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `WATSONX_API_KEY` | ✅ | IBM Cloud API key with watsonx.ai access |
| `WATSONX_PROJECT_ID` | ✅ | watsonx.ai project ID (project settings → Manage tab) |
| `WATSONX_URL` | ✅ | Regional endpoint, e.g. `https://us-south.ml.cloud.ibm.com` |
| `WATSONX_MODEL_ID` | ➖ | Defaults to `ibm/granite-4-h-small` |

> **Tip:** The `WATSONX_URL` region must match the region your IBM Cloud resource group lives in. No trailing slash.

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables (optional — defaults to localhost:8000)
cp .env.example .env
```

#### Environment Variables (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ➖ | Backend base URL, defaults to `http://localhost:8000` |

---

## Running Locally

Open two terminals:

**Terminal 1 — Backend**
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload
# → http://localhost:8000
# → API docs: http://localhost:8000/docs
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

---

## Usage

1. Type up to 100 words describing a feeling, place, or idea — or click **Random Theme** to get a generated seed
2. Select your medium (Visual / Writing / Music)
3. Click **Generate** to populate all eight planning facets
4. **Lock** any facet you want to keep, then click **Reroll All** to regenerate the rest
5. Or click the **↻** icon on an individual card to reroll just that facet
6. Click **Save** to store the current panel to your saved list (persists across refreshes)
7. Restore any saved panel by clicking it in the Saved list (you'll be asked to confirm)
8. Use the **Notepad** tab to capture ideas tied to the current theme
