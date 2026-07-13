# No More Blank Pages

A creative-planning web app that helps artists, writers, and musicians get unstuck at the start of a project. Enter up to 100 words (or use a random theme) and the app generates seven structured creative-planning facets — emotional core, sensory palette, structural anchor, tension pair, reference constellation, constraint, and an avoid list. Lock the ones you like and reroll the rest individually or all at once.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18 + |
| Python | 3.9 + |
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
├── frontend/         React + Vite app
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
3. Click **Generate** to populate all seven planning facets
4. **Lock** any facet you want to keep, then click **Reroll All** to regenerate the rest
5. Or click the **↻** icon on an individual card to reroll just that facet
6. Click **Save** to store the current panel to your saved list (persists across refreshes)
7. Restore any saved panel by clicking it in the Saved list (you'll be asked to confirm)
