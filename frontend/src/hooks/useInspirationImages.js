import { useState, useEffect } from "react";

// Normalise Unsplash hits into a common shape used by InspirationView:
// { id, imageURL, pageURL, user, altText }
function normalise(hit) {
  return {
    id: hit.id,
    imageURL: hit.urls.regular,
    pageURL: hit.links.html,
    user: hit.user.name,
    altText: hit.alt_description || hit.user.name,
  };
}

export function useInspirationImages(query) {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (!query) {
      setImages([]);
      return;
    }

    const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    const url =
      `https://api.unsplash.com/search/photos` +
      `?query=${encodeURIComponent(query)}` +
      `&per_page=12&orientation=landscape&content_filter=high`;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(url, {
      headers: { Authorization: `Client-ID ${key}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setImages((data.results || []).map(normalise));
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load images. Check your API key.");
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query, refreshCount]);

  function refresh() {
    setRefreshCount((c) => c + 1);
  }

  return { images, isLoading, error, refresh };
}
