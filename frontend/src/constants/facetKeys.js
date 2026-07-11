// Canonical ordered list of the seven facet keys — matches backend FacetKey enum.
export const FACET_KEYS = [
  "emotional_core",
  "sensory_palette",
  "structural_anchor",
  "tension_pair",
  "reference_constellation",
  "constraint",
  "avoid_list",
];

// Human-readable labels per facet, with medium-aware override for sensory_palette.
export const FACET_LABELS = {
  emotional_core: "Emotional Core",
  sensory_palette: "Sensory Palette", // overridden per medium in components
  structural_anchor: "Structural Anchor",
  tension_pair: "Tension Pair",
  reference_constellation: "Reference Constellation",
  constraint: "Constraint",
  avoid_list: "Avoid List",
};

// Medium-specific label for the sensory_palette facet.
export const PALETTE_LABEL = {
  visual: "Palette",
  writing: "Diction",
  music: "Timbre",
};
