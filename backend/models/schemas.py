from enum import Enum
from typing import Dict, Optional

from pydantic import BaseModel, field_validator


class Medium(str, Enum):
    visual = "visual"
    writing = "writing"
    music = "music"


class FacetKey(str, Enum):
    emotional_core = "emotional_core"
    sensory_palette = "sensory_palette"
    structural_anchor = "structural_anchor"
    tension_pair = "tension_pair"
    reference_constellation = "reference_constellation"
    constraint = "constraint"
    avoid_list = "avoid_list"


class GenerateRequest(BaseModel):
    keywords: str
    medium: Medium
    locked_facets: Dict[FacetKey, str] = {}
    random: Optional[bool] = False

    @field_validator("keywords")
    @classmethod
    def keywords_max_100_words(cls, v: str) -> str:
        if len(v.split()) > 100:
            raise ValueError("keywords must not exceed 100 words")
        return v


class GenerateResponse(BaseModel):
    facets: Dict[FacetKey, str]
    theme: str
