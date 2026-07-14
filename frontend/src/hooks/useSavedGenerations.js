import { useState, useCallback } from "react";

const STORAGE_KEY = "nmbp_saved";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useSavedGenerations() {
  const [savedList, setSavedList] = useState(() => loadFromStorage());

  /**
   * Save a snapshot of the current session.
   * Schema: { id, timestamp, theme, medium, facets, paletteColors }
   */
  const saveSnapshot = useCallback((facets, theme, medium, paletteColors = null) => {
    const snapshot = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      theme,
      medium,
      facets,
      paletteColors,
    };
    setSavedList((prev) => {
      const next = [snapshot, ...prev];
      saveToStorage(next);
      return next;
    });
  }, []);

  const deleteSnapshot = useCallback((id) => {
    setSavedList((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveToStorage(next);
      return next;
    });
  }, []);

  return { savedList, saveSnapshot, deleteSnapshot };
}
