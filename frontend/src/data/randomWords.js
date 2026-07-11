// Curated word list for random theme generation.
// Words are grouped by category; 3–5 are sampled at random to form a seed prompt.

export const WORD_CATEGORIES = {
  moods: [
    "melancholy", "euphoric", "restless", "tender", "defiant",
    "reverent", "uneasy", "serene", "feverish", "detached",
    "longing", "reckless", "intimate", "uncanny", "resigned",
  ],
  textures: [
    "corroded", "gossamer", "grainy", "lacquered", "weathered",
    "translucent", "brittle", "velvet", "crystalline", "overexposed",
    "tarnished", "static", "burnished", "fractured", "overgrown",
  ],
  timesOfDay: [
    "blue hour", "dead of night", "false dawn", "golden hour",
    "late afternoon", "midnight", "overcast noon", "early winter morning",
    "the hour before a storm", "twilight", "3am",
  ],
  places: [
    "brutalist stairwell", "tidal flat", "vacant lot", "cathedral attic",
    "fluorescent corridor", "harbor in fog", "rooftop in summer",
    "flooded basement", "mountain pass", "overgrown greenhouse",
    "empty highway", "back room of a record shop",
  ],
  objects: [
    "a broken compass", "an untuned piano", "a faded map",
    "a half-burned letter", "a cracked mirror", "an old tape recorder",
    "a single lit window", "a locked gate", "a torn photograph",
    "an empty birdcage", "a rusted key", "a long-distance postcard",
  ],
};

export const ALL_WORDS = Object.values(WORD_CATEGORIES).flat();

/**
 * Sample `count` words without replacement, drawing across all categories
 * so the result tends to be varied rather than mono-categorical.
 */
export function sampleWords(count = 4) {
  const categories = Object.values(WORD_CATEGORIES);
  const picked = [];
  const usedCategories = new Set();

  // First pass: one word per category until we hit `count`
  const shuffledCats = [...categories].sort(() => Math.random() - 0.5);
  for (const cat of shuffledCats) {
    if (picked.length >= count) break;
    const idx = Math.floor(Math.random() * cat.length);
    picked.push(cat[idx]);
    usedCategories.add(cat);
  }

  // Second pass: fill remaining slots from any category
  while (picked.length < count) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const word = cat[Math.floor(Math.random() * cat.length)];
    if (!picked.includes(word)) picked.push(word);
  }

  return picked;
}
