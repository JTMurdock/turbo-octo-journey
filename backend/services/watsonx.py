import json
import os
import re
from typing import Dict, List

import httpx
from dotenv import load_dotenv

from models.schemas import FacetKey, GenerateRequest, Medium

load_dotenv()

_API_KEY = os.getenv("WATSONX_API_KEY", "")
_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID", "")
_URL = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com").rstrip("/")
_MODEL_ID = os.getenv("WATSONX_MODEL_ID", "ibm/granite-4-h-small")

# Sensory palette label changes per medium
_PALETTE_LABEL: Dict[Medium, str] = {
    Medium.visual: "palette",
    Medium.writing: "diction",
    Medium.music: "timbre",
}

ALL_FACET_KEYS: List[FacetKey] = list(FacetKey)


def _get_iam_token() -> str:
    """Exchange an IBM Cloud API key for a short-lived IAM bearer token."""
    resp = httpx.post(
        "https://iam.cloud.ibm.com/identity/token",
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": _API_KEY,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def _build_messages(keywords: str, medium: Medium, unlocked_keys: List[FacetKey]) -> list:
    palette_label = _PALETTE_LABEL[medium]

    facet_descriptions: Dict[FacetKey, str] = {
        FacetKey.emotional_core: "the dominant emotion or psychological state",
        FacetKey.sensory_palette: f"the {palette_label} — sensory qualities, textures, and tones appropriate for {medium.value} work",
        FacetKey.structural_anchor: "the organizing structural principle or form",
        FacetKey.tension_pair: "two opposing forces or contradictions driving the work",
        FacetKey.reference_constellation: "3–5 named works, artists, or aesthetic descriptors that define the aesthetic territory",
        FacetKey.constraint: "one productive creative constraint to apply",
        FacetKey.avoid_list: "2–3 things to consciously avoid",
    }

    keys_list = [k.value for k in unlocked_keys]
    facet_lines = "\n".join(
        f'  "{k.value}": "<{facet_descriptions[k]}>"'
        for k in unlocked_keys
    )

    system_content = (
        "You are a creative planning assistant. "
        "Respond ONLY with a single valid JSON object — no prose, no markdown, no code fences. "
        "All string values must be concise (one sentence or a short comma-separated list)."
    )

    user_content = (
        f"Medium: {medium.value}\n"
        f"Keywords / theme: {keywords}\n\n"
        f"Generate values for exactly these facet keys: {keys_list}\n\n"
        f"Return a JSON object with this exact shape:\n"
        f"{{\n{facet_lines}\n}}\n\n"
        f'Also include a "theme" key: a short evocative title (3–6 words) for this creative direction.'
    )

    return [
        {"role": "system", "content": system_content},
        {"role": "user", "content": user_content},
    ]


def generate_facets(request: GenerateRequest) -> dict:
    """Call the watsonx chat API and return merged facets + theme."""
    locked = {FacetKey(k): v for k, v in request.locked_facets.items()}
    unlocked_keys = [k for k in ALL_FACET_KEYS if k not in locked]

    if not unlocked_keys:
        return {
            "facets": {k.value: v for k, v in locked.items()},
            "theme": "",
        }

    messages = _build_messages(request.keywords, request.medium, unlocked_keys)
    token = _get_iam_token()

    payload = {
        "model_id": _MODEL_ID,
        "messages": messages,
        "parameters": {
            "max_new_tokens": 600,
        },
        "project_id": _PROJECT_ID,
    }

    resp = httpx.post(
        f"{_URL}/ml/v1/text/chat?version=2023-05-29",
        json=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        timeout=60,
    )
    resp.raise_for_status()

    raw_text: str = resp.json()["choices"][0]["message"]["content"].strip()

    # Strip any accidental markdown fences
    raw_text = re.sub(r"^```[a-z]*\n?", "", raw_text)
    raw_text = re.sub(r"\n?```$", "", raw_text)

    try:
        generated = json.loads(raw_text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if not match:
            raise ValueError(f"Model did not return valid JSON. Raw: {raw_text[:300]}")
        generated = json.loads(match.group())

    theme: str = generated.pop("theme", "")

    facets: Dict[str, str] = {}
    for key in ALL_FACET_KEYS:
        if key in locked:
            facets[key.value] = locked[key]
        else:
            facets[key.value] = generated.get(key.value, "")

    return {"facets": facets, "theme": theme}
