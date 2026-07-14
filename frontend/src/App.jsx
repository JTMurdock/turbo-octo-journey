import { useState } from "react";
import { usePlanner } from "./hooks/usePlanner";
import { useSavedGenerations } from "./hooks/useSavedGenerations";
import { Sidebar } from "./components/Sidebar";
import { PromptSetView } from "./components/PromptSetView";
import { SavedView } from "./components/SavedView";
import "./App.css";

export default function App() {
  const {
    keywords, setKeywords,
    medium, setMedium,
    facets, theme, quote,
    paletteColors,
    lockStates, toggleLock,
    generate, rerollAll, reroll, restoreSnapshot,
    isLoading, error,
  } = usePlanner();

  const { savedList, saveSnapshot, deleteSnapshot } = useSavedGenerations();

  const [activeTab, setActiveTab] = useState("prompt-set");
  const [screen, setScreen] = useState("home"); // "home" | "results"

  // Pending restore snapshot — holds item until user confirms
  const [pendingRestore, setPendingRestore] = useState(null);

  async function handleGenerate() {
    const ok = await generate();
    if (ok) setScreen("results");
  }

  function handleRestoreRequest(snapshot) {
    setPendingRestore(snapshot);
  }

  function handleRestoreConfirm() {
    restoreSnapshot(pendingRestore);
    setPendingRestore(null);
    setActiveTab("prompt-set");
    setScreen("results");
  }

  function renderContent() {
    switch (activeTab) {
      case "prompt-set":
        return (
          <PromptSetView
            keywords={keywords}
            setKeywords={setKeywords}
            medium={medium}
            setMedium={setMedium}
            facets={facets}
            theme={theme}
            quote={quote}
            paletteColors={paletteColors}
            lockStates={lockStates}
            toggleLock={toggleLock}
            generate={handleGenerate}
            rerollAll={rerollAll}
            reroll={reroll}
            isLoading={isLoading}
            error={error}
            onSave={() => saveSnapshot(facets, theme, medium, paletteColors)}
            screen={screen}
            onGoHome={() => setScreen("home")}
          />
        );
      case "sketchpad":
        return (
          <div className="tab-view">
            <p className="tab-view__empty">Sketchpad coming soon.</p>
          </div>
        );
      case "saved":
        return (
          <SavedView
            savedList={savedList}
            onRestore={handleRestoreRequest}
            onDelete={deleteSnapshot}
          />
        );
      case "settings":
        return (
          <div className="tab-view">
            <p className="tab-view__empty">Settings coming soon.</p>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="app__content">
        {renderContent()}
      </div>

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
