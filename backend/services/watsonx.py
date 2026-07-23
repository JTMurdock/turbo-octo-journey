import json
import logging
import os
import re
import time
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

_SENSORY_PALETTE_DESCRIPTION: Dict[Medium, str] = {
    Medium.visual: "the visual palette — colors, textures, lighting, and surface qualities",
    Medium.writing: "the diction — word register (e.g. latinate vs. Anglo-Saxon), sentence rhythm, syntactic style, and prose voice (e.g. 'spare declarative sentences, Anglo-Saxon monosyllables' or 'dense subordinate clauses, clinical detachment')",
    Medium.music: "the timbre — sonic texture, instrumental color, density, and tonal quality (e.g. 'sparse plucked strings, cavernous reverb, submerged bass pulses')",
}

ALL_FACET_KEYS: List[FacetKey] = list(FacetKey)


# Module-level cache: (token_string, expiry_unix_timestamp)
_iam_token_cache: tuple[str, float] = ("", 0.0)


def _get_iam_token() -> str:
    """Return a valid IAM bearer token, refreshing only when expired (~1 hour)."""
    global _iam_token_cache
    token, expiry = _iam_token_cache
    # Reuse the cached token until 60 s before its actual expiry
    if token and time.time() < expiry - 60:
        return token

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
    data = resp.json()
    _iam_token_cache = (
        data["access_token"],
        float(data.get("expiration", time.time() + 3600)),
    )
    return _iam_token_cache[0]


_REFERENCE_CONSTELLATION_DESCRIPTION: Dict[Medium, str] = {
    Medium.visual: "3–5 named visual artists, photographers, art movements, or aesthetic descriptors that define the visual territory",
    Medium.writing: "3–5 named authors, novels, poetry collections, literary movements, or prose styles that define the literary territory",
    Medium.music: "3–5 named composers, albums, genres, or sonic touchstones that define the sonic territory",
}


def _build_messages(keywords: str, medium: Medium, unlocked_keys: List[FacetKey], locked_constraint: str = "", locked_context: Dict[FacetKey, str] = {}) -> list:
    palette_label = _PALETTE_LABEL[medium]

    _constraint_description: Dict[Medium, str] = {
        Medium.visual: (
            "one productive creative constraint — NOT a color or palette restriction (the palette facet already covers that). "
            "Choose from a different category such as: compositional (e.g. 'shoot only from below knee height', 'all subjects cropped at the edge'), "
            "material or process (e.g. 'analogue double exposure', 'painted over photograph', 'no straight lines'), "
            "temporal (e.g. 'captured only in the 10 minutes after sunset', 'single unedited frame'), "
            "conceptual (e.g. 'every element must appear twice', 'foreground and background must tell contradictory stories'), "
            "or formal (e.g. 'no horizon line', 'negative space occupies at least 70% of the frame', 'symmetry broken by exactly one element')"
        ),
        Medium.writing: "one productive creative constraint to apply (e.g. structural, POV, tense, formal, linguistic)",
        Medium.music: "one productive creative constraint to apply (e.g. instrumentation, tempo, harmonic, structural, dynamic)",
    }

    facet_descriptions: Dict[FacetKey, str] = {
        FacetKey.emotional_core: "the dominant emotion or psychological state",
        FacetKey.sensory_palette: _SENSORY_PALETTE_DESCRIPTION[medium],
        FacetKey.structural_anchor: "the organizing structural principle or form",
        FacetKey.tension_pair: "two opposing forces or contradictions driving the work",
        FacetKey.reference_constellation: _REFERENCE_CONSTELLATION_DESCRIPTION[medium],
        FacetKey.constraint: _constraint_description[medium],
        FacetKey.avoid_list: "2–3 things to consciously avoid",
        FacetKey.subject_matter: "a concrete scene, scenario, or subject — specific enough to spark an immediate mental image (e.g. 'two strangers share an umbrella on a rain-soaked platform')",
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

    palette_colors_instruction = ""
    if medium == Medium.visual:
        if locked_constraint:
            constraint_note = (
                f' The constraint for this work is: "{locked_constraint}". '
                f'If the constraint restricts color (e.g. black and white, monochrome, limited palette), '
                f'the hex colors MUST strictly reflect that restriction.'
            )
        else:
            constraint_note = (
                ' The palette MUST be consistent with the "constraint" value you are generating '
                'in the same response — if that constraint restricts color (e.g. black and white, '
                'monochrome, duotone), the hex colors must strictly reflect it.'
            )
        palette_colors_instruction = (
            '\nAlso include a "palette_colors" key: an array of exactly 4 objects, '
            'each with "hex" (a valid CSS hex color, e.g. "#1B1D20") and "name" '
            f'(a short evocative color name) keys.{constraint_note}'
        )

    locked_context_block = ""
    if locked_context:
        context_lines = "\n".join(
            f"  {k.value}: {v}" for k, v in locked_context.items() if v
        )
        if context_lines:
            locked_context_block = f"\nExisting creative direction (do not regenerate these — use them as context):\n{context_lines}\n"

    user_content = (
        f"Medium: {medium.value}\n"
        f"Keywords / theme: {keywords}\n"
        f"{locked_context_block}\n"
        f"Generate values for exactly these facet keys: {keys_list}\n\n"
        f"Return a JSON object with this exact shape:\n"
        f"{{\n{facet_lines}\n}}\n\n"
        f'Also include a "theme" key: a short evocative title (3–6 words) for this creative direction.\n'
        f'Also include a "quote" key: 1–2 short evocative sentences that capture the emotional essence of this creative direction (e.g. "Beauty in the fracture. Silence between the shards.").'
        f"{palette_colors_instruction}"
    )

    return [
        {"role": "system", "content": system_content},
        {"role": "user", "content": user_content},
    ]


logger = logging.getLogger(__name__)

_RETRY_STATUSES = {429, 500, 502, 503, 504}
_MAX_RETRIES = 3
_RETRY_BACKOFF = [1.0, 2.0, 4.0]  # seconds to wait before each retry


def _call_watsonx(payload: dict, token: str) -> httpx.Response:
    """POST to the WatsonX chat endpoint, retrying on transient errors."""
    for attempt, wait in enumerate([0.0] + _RETRY_BACKOFF):
        if wait:
            logger.warning("WatsonX attempt %d failed, retrying in %.1fs", attempt, wait)
            time.sleep(wait)
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
        if resp.status_code not in _RETRY_STATUSES:
            break
        if attempt == _MAX_RETRIES - 1:
            resp.raise_for_status()
    resp.raise_for_status()
    return resp


def generate_facets(request: GenerateRequest) -> dict:
    """Call the watsonx chat API and return merged facets + theme."""
    locked = {FacetKey(k): v for k, v in request.locked_facets.items()}
    unlocked_keys = [k for k in ALL_FACET_KEYS if k not in locked]

    if not unlocked_keys:
        return {
            "facets": {k.value: v for k, v in locked.items()},
            "theme": "",
        }

    locked_constraint = locked.get(FacetKey.constraint, "")
    messages = _build_messages(request.keywords, request.medium, unlocked_keys, locked_constraint, locked)
    token = _get_iam_token()

    payload = {
        "model_id": _MODEL_ID,
        "messages": messages,
        "parameters": {
            "max_new_tokens": 900,
        },
        "project_id": _PROJECT_ID,
    }

    resp = _call_watsonx(payload, token)

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
    quote: str = generated.pop("quote", "")

    # Extract palette_colors for visual medium before normalising lists
    palette_colors = None
    if request.medium == Medium.visual:
        raw_palette = generated.pop("palette_colors", None)
        if (
            isinstance(raw_palette, list)
            and len(raw_palette) == 4
            and all(
                isinstance(c, dict) and "hex" in c and "name" in c
                for c in raw_palette
            )
        ):
            palette_colors = [{"hex": c["hex"], "name": c["name"]} for c in raw_palette]

    # Normalise any list values the model returns to comma-joined strings
    for k, v in generated.items():
        if isinstance(v, list):
            generated[k] = ", ".join(str(item) for item in v)

    facets: Dict[str, str] = {}
    for key in ALL_FACET_KEYS:
        if key in locked:
            facets[key.value] = locked[key]
        else:
            facets[key.value] = generated.get(key.value, "")

    return {"facets": facets, "theme": theme, "quote": quote, "palette_colors": palette_colors}
