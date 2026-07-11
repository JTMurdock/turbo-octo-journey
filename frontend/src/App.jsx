import { useState } from "react";
import { usePlanner } from "./hooks/usePlanner";
import { useSavedGenerations } from "./hooks/useSavedGenerations";
import { KeywordInput } from "./components/KeywordInput";
import { RandomThemeButton } from "./components/RandomThemeButton";
import { MediumSwitcher } from "./components/MediumSwitcher";
import { PlannerPanel } from "./components/PlannerPanel";
import { SaveButton } from "./components/SaveButton";
import { SavedList } from "./components/SavedList";
import "./App.css";

export default function App() {
  const {
    keywords, setKeywords,
    medium, setMedium,
    facets, theme,
    lockStates, toggleLock,
    generate, rerollAll, reroll, restoreSnapshot,
    isLoading, error,
  } = usePlanner();

  const { savedList, saveSnapshot, deleteSnapshot } = useSavedGenerations();

  // Pending restore snapshot — holds item until user confirms
  const [pendingRestore, setPendingRestore] = useState(null);

  const hasResults = Object.values(facets).some(Boolean);

  function handleRestoreRequest(snapshot) {
    setPendingRestore(snapshot);
  }

  function handleRestoreConfirm() {
    restoreSnapshot(pendingRestore);
    setPendingRestore(null);
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">No More Blank Pages</h1>
        <p className="app__subtitle">Structured creative planning for artists, writers &amp; musicians.</p>
      </header>

      <main className="app__main">
        {/* Input controls */}
        <section className="app__controls">
          <div className="app__controls-row">
            <MediumSwitcher medium={medium} setMedium={setMedium} isLoading={isLoading} />
            <RandomThemeButton setKeywords={setKeywords} isLoading={isLoading} />
          </div>
          <KeywordInput
            keywords={keywords}
            setKeywords={setKeywords}
            onGenerate={generate}
            isLoading={isLoading}
            hasResults={hasResults}
          />
          {error && <p className="app__error">{error}</p>}
        </section>

        {/* Facet grid */}
        {(hasResults || isLoading) && (
          <PlannerPanel
            facets={facets}
            theme={theme}
            medium={medium}
            lockStates={lockStates}
            onToggleLock={toggleLock}
            onReroll={reroll}
            onRerollAll={rerollAll}
            isLoading={isLoading}
          />
        )}

        {/* Save button — only shown when there's content */}
        {hasResults && (
          <div className="app__save-row">
            <SaveButton
              onSave={() => saveSnapshot(facets, theme, medium)}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Saved sessions */}
        <SavedList
          savedList={savedList}
          onRestore={handleRestoreRequest}
          onDelete={deleteSnapshot}
        />
      </main>

      {/* Restore confirmation dialog */}
      {pendingRestore && (
        <div className="dialog-backdrop" onClick={() => setPendingRestore(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <p className="dialog__message">
              This will replace your current session. Continue?
            </p>
            <div className="dialog__actions">
              <button className="btn btn--ghost" onClick={() => setPendingRestore(null)}>
                Cancel
              </button>
              <button className="btn btn--primary" onClick={handleRestoreConfirm}>
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
