import { useState, useCallback, useRef } from "react";
import { FACET_KEYS } from "../constants/facetKeys";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const EMPTY_FACETS = Object.fromEntries(FACET_KEYS.map((k) => [k, ""]));
const ALL_UNLOCKED = Object.fromEntries(FACET_KEYS.map((k) => [k, false]));

export function usePlanner() {
  const [keywords, setKeywords] = useState("");
  const [medium, setMedium] = useState("visual");
  const [facets, setFacets] = useState(EMPTY_FACETS);
  const [theme, setTheme] = useState("");
  const [quote, setQuote] = useState("");
  const [paletteColors, setPaletteColors] = useState(null);
  // lockStates: { [facetKey]: boolean }  true = locked
  const [lockStates, setLockStates] = useState(ALL_UNLOCKED);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs so callbacks always see the latest values without stale closures
  const keywordsRef = useRef(keywords);
  const mediumRef = useRef(medium);
  const facetsRef = useRef(facets);
  const lockStatesRef = useRef(lockStates);
  keywordsRef.current = keywords;
  mediumRef.current = medium;
  facetsRef.current = facets;
  lockStatesRef.current = lockStates;

  const toggleLock = useCallback((facetKey) => {
    setLockStates((prev) => ({ ...prev, [facetKey]: !prev[facetKey] }));
  }, []);

  /** Build the locked_facets payload using the latest facets + a given lock map. */
  function buildLockedFacets(lockMap) {
    const currentFacets = facetsRef.current;
    return Object.fromEntries(
      FACET_KEYS.filter((k) => lockMap[k]).map((k) => [k, currentFacets[k]])
    );
  }

  async function callApi(lockedFacets) {
    let resp;
    try {
      resp = await fetch(`${API_BASE}/planner/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywordsRef.current,
          medium: mediumRef.current,
          locked_facets: lockedFacets,
        }),
      });
    } catch {
      throw new Error("Something went wrong, please retry");
    }
    if (!resp.ok) {
      throw new Error("Something went wrong, please retry");
    }
    try {
      return await resp.json();
    } catch {
      throw new Error("Something went wrong, please retry");
    }
  }

  /** First-time generation — all facets unlocked. Returns true on success. */
  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await callApi({});
      setFacets(data.facets);
      setTheme(data.theme);
      setQuote(data.quote ?? "");
      setPaletteColors(data.palette_colors ?? null);
      setLockStates(ALL_UNLOCKED);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Reroll all unlocked facets; locked ones stay fixed. */
  const rerollAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await callApi(buildLockedFacets(lockStatesRef.current));
      setFacets((prev) => ({ ...prev, ...data.facets }));
      setTheme(data.theme);
      setQuote(data.quote ?? "");
      setPaletteColors(data.palette_colors ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Reroll exactly one facet regardless of its lock state.
   * All other facets are treated as locked for this call.
   * The real lockStates is never modified.
   */
  const reroll = useCallback(async (facetKey) => {
    setIsLoading(true);
    setError(null);
    const tempLocks = Object.fromEntries(FACET_KEYS.map((k) => [k, k !== facetKey]));
    try {
      const data = await callApi(buildLockedFacets(tempLocks));
      setFacets((prev) => ({ ...prev, ...data.facets }));
      // theme intentionally unchanged for single-facet rerolls
      // only update palette colors when the sensory_palette facet is being rerolled
      if (facetKey === "sensory_palette") {
        setPaletteColors(data.palette_colors ?? null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Restore a saved snapshot into the active session. */
  const restoreSnapshot = useCallback((snapshot) => {
    setFacets(snapshot.facets);
    setTheme(snapshot.theme);
    setQuote(snapshot.quote ?? "");
    setMedium(snapshot.medium);
    setPaletteColors(snapshot.paletteColors ?? null);
    setLockStates(ALL_UNLOCKED);
    setError(null);
  }, []);

  return {
    keywords,
    setKeywords,
    medium,
    setMedium,
    facets,
    theme,
    quote,
    paletteColors,
    lockStates,
    toggleLock,
    generate,
    rerollAll,
    reroll,
    restoreSnapshot,
    isLoading,
    error,
  };
}
