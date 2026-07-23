import { useState, useEffect } from "react";
import "./MoodPreview.css";

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY ?? "";

// Extract the first 4–5 meaningful words from a facet string.
// Strips filler phrases like "the dominant", "two opposing", etc.
function firstWords(str, max = 4) {
  if (!str) return "";
  return str
    .replace(/^(the |a |an |two |one |3[–-]5 )/i, "")
    .split(/[\s,—–]+/)
    .slice(0, max)
    .join(" ");
}

export function MoodPreview({
  theme, quote, emotionalCore, sensoryPalette, subjectMatter, isLoading,
  photoUrl, photoAlt, onPhotoFetched, onRerollPhoto, rerollSeed,
}) {
  const [loadedUrl, setLoadedUrl] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Build query: subject matter scene first (most specific), then emotional tone,
  // then one palette/colour word as a tonal hint. Theme as final fallback anchor.
  const searchQuery = [
    firstWords(subjectMatter, 5),  // the concrete scene — most important for relevance
    firstWords(emotionalCore, 2),  // emotional tone
    firstWords(sensoryPalette, 1), // one colour/texture word
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || theme;

  // Fetch whenever the search query changes OR the reroll seed bumps.
  // photoUrl being null (cleared by parent on new generation) also triggers a fetch.
  useEffect(() => {
    if (!searchQuery || !UNSPLASH_KEY) return;
    // If we already have a photo for this query+seed, don't re-fetch.
    if (photoUrl) return;

    let cancelled = false;
    setFetching(true);
    setFetchError(false);

    const query = encodeURIComponent(searchQuery);
    fetch(
      `https://api.unsplash.com/photos/random?query=${query}&orientation=portrait`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) {
          onPhotoFetched(data.urls?.regular ?? null, data.alt_description ?? theme);
          setFetching(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError(true);
          setFetching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [searchQuery, rerollSeed]); // eslint-disable-line react-hooks/exhaustive-deps

  const imgLoaded = loadedUrl === photoUrl && !!photoUrl;
  const showShimmer = isLoading || fetching || (!photoUrl && !fetchError);

  return (
    <div className="mood-preview">
      <span className="mood-preview__label">MOOD PREVIEW</span>

      <div className={`mood-preview__photo-wrap${showShimmer ? " mood-preview__photo-wrap--shimmer" : ""}`}>
        {photoUrl && (
          <img
            className={`mood-preview__photo${imgLoaded ? " mood-preview__photo--loaded" : ""}`}
            src={photoUrl}
            alt={photoAlt}
            onLoad={() => setLoadedUrl(photoUrl)}
          />
        )}
        {fetchError && !photoUrl && (
          <div className="mood-preview__photo-fallback" aria-hidden="true" />
        )}
        {!isLoading && (photoUrl || fetchError) && (
          <button
            className="mood-preview__reroll-btn"
            onClick={onRerollPhoto}
            title="New inspiration image"
            aria-label="Reroll inspiration image"
          >
            ↻
          </button>
        )}
        {photoUrl && (
          <a
            className="mood-preview__photo-credit"
            href="https://unsplash.com"
            target="_blank"
            rel="noreferrer"
          >
            Unsplash
          </a>
        )}
      </div>

      <div className="mood-preview__quote-block">
        <span className="mood-preview__quote-mark">&ldquo;</span>
        <p className="mood-preview__quote-text">
          {quote || (isLoading ? "\u00a0" : "Generating…")}
        </p>
      </div>
    </div>
  );
}
