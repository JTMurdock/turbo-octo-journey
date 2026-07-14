import { useState, useEffect } from "react";
import "./MoodPreview.css";

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY ?? "";

export function MoodPreview({ theme, quote, isLoading }) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoAlt, setPhotoAlt] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!theme || !UNSPLASH_KEY) return;

    let cancelled = false;
    setPhotoUrl(null);
    setImgLoaded(false);
    setFetchError(false);

    const query = encodeURIComponent(theme);
    fetch(
      `https://api.unsplash.com/photos/random?query=${query}&orientation=portrait`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) {
          setPhotoUrl(data.urls?.regular ?? null);
          setPhotoAlt(data.alt_description ?? theme);
        }
      })
      .catch(() => {
        if (!cancelled) setFetchError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [theme]);

  const showShimmer = isLoading || (!photoUrl && !fetchError);

  return (
    <div className="mood-preview">
      <span className="mood-preview__label">MOOD PREVIEW</span>

      <div className={`mood-preview__photo-wrap${showShimmer ? " mood-preview__photo-wrap--shimmer" : ""}`}>
        {photoUrl && (
          <img
            className={`mood-preview__photo${imgLoaded ? " mood-preview__photo--loaded" : ""}`}
            src={photoUrl}
            alt={photoAlt}
            onLoad={() => setImgLoaded(true)}
          />
        )}
        {fetchError && !photoUrl && (
          <div className="mood-preview__photo-fallback" aria-hidden="true" />
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
