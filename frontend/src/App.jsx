import { useState } from "react";
import { usePlanner } from "./hooks/usePlanner";
import { useSavedGenerations } from "./hooks/useSavedGenerations";
import { Sidebar } from "./components/Sidebar";
import { PromptSetView } from "./components/PromptSetView";
import { SavedView } from "./components/SavedView";
import { NotesView } from "./components/NotesView";
import "./App.css";

export default function App() {
  const {
    keywords, setKeywords,
    medium, setMedium,
    facets, theme, quote,
    notes, setNotes,
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

  // Inspiration photo state — lifted here so it persists across tab switches
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoAlt, setPhotoAlt] = useState("");
  const [rerollSeed, setRerollSeed] = useState(0);

  function handlePhotoFetched(url, alt) {
    setPhotoUrl(url);
    setPhotoAlt(alt);
  }

  function handleRerollPhoto() {
    setPhotoUrl(null);
    setPhotoAlt("");
    setRerollSeed((s) => s + 1);
  }

  async function handleGenerate() {
    // Clear photo so a fresh one is fetched for the new theme
    setPhotoUrl(null);
    setPhotoAlt("");
    setRerollSeed(0);
    const ok = await generate();
    if (ok) setScreen("results");
  }

  function handleRestoreRequest(snapshot) {
    setPendingRestore(snapshot);
  }

  function handleRestoreConfirm() {
    restoreSnapshot(pendingRestore);
    setPendingRestore(null);
    setPhotoUrl(null);
    setPhotoAlt("");
    setRerollSeed(0);
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
            onSave={() => saveSnapshot(facets, theme, medium, paletteColors, notes, quote)}
            screen={screen}
            onGoHome={() => setScreen("home")}
            photoUrl={photoUrl}
            photoAlt={photoAlt}
            onPhotoFetched={handlePhotoFetched}
            onRerollPhoto={handleRerollPhoto}
            rerollSeed={rerollSeed}
          />
        );
      case "notepad":
        return (
          <NotesView
            notes={notes}
            setNotes={setNotes}
            theme={theme}
          />
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
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBrandClick={() => { setActiveTab("prompt-set"); setScreen("home"); }}
      />

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
