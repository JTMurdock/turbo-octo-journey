import { useState, useCallback } from "react";
import { FACET_KEYS } from "../constants/facetKeys";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const EMPTY_FACETS = Object.fromEntries(FACET_KEYS.map((k) => [k, ""]));
const ALL_UNLOCKED = Object.fromEntries(FACET_KEYS.map((k) => [k, false]));

export function usePlanner() {
  const [keywords, setKeywords] = useState("");
  const [medium, setMedium] = useState("visual");
  const [facets, setFacets] = useState(EMPTY_FACETS);
  const [theme, setTheme] = useState("");
  // lockStates: { [facetKey]: boolean }  true = locked
  const [lockStates, setLockStates] = useState(ALL_UNLOCKED);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleLock = useCallback((facetKey) => {
    setLockStates((prev) => ({ ...prev, [facetKey]: !prev[facetKey] }));
  }, []);

  /** Build the locked_facets payload: only include facets that are currently locked. */
  function buildLockedFacets(overrideLockStates) {
    const locks = overrideLockStates ?? lockStates;
    return Object.fromEntries(
      FACET_KEYS.filter((k) => locks[k]).map((k) => [k, facets[k]])
    );
  }

  async function callApi(lockedFacets, isRandom = false) {
    const resp = await fetch(`${API_BASE}/planner/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keywords,
        medium,
        locked_facets: lockedFacets,
        random: isRandom,
      }),
    });
    if (!resp.ok) {
      throw new Error("Something went wrong, please retry");
    }
    return resp.json();
  }

  /** First-time generation — all facets unlocked. */
  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await callApi({});
      setFacets(data.facets);
      setTheme(data.theme);
      setLockStates(ALL_UNLOCKED);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywords, medium]);

  /** Reroll all unlocked facets; locked ones stay fixed. */
  const rerollAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await callApi(buildLockedFacets());
      setFacets((prev) => ({ ...prev, ...data.facets }));
      setTheme(data.theme);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywords, medium, lockStates, facets]);

  /**
   * Reroll exactly one facet regardless of its lock state.
   * All other facets are treated as locked for this call.
   * The lock map is restored exactly afterward.
   */
  const reroll = useCallback(async (facetKey) => {
    setIsLoading(true);
    setError(null);
    // Temporarily lock everything except the target key
    const tempLocks = Object.fromEntries(FACET_KEYS.map((k) => [k, k !== facetKey]));
    try {
      const data = await callApi(buildLockedFacets(tempLocks));
      setFacets((prev) => ({ ...prev, ...data.facets }));
      // theme stays as-is for single-facet rerolls
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      // lockStates is NOT modified — restored implicitly since we never changed it
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywords, medium, facets, lockStates]);

  /** Restore a saved snapshot into the active session. */
  const restoreSnapshot = useCallback((snapshot) => {
    setFacets(snapshot.facets);
    setTheme(snapshot.theme);
    setMedium(snapshot.medium);
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
