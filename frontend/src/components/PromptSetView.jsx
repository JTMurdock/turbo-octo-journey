import { KeywordInput } from "./KeywordInput";
import { RandomThemeButton } from "./RandomThemeButton";
import { MediumSwitcher } from "./MediumSwitcher";
import { PlannerPanel } from "./PlannerPanel";
import { ActionBar } from "./ActionBar";
import "./PromptSetView.css";
import LOGO from "../assets/LOGO_NO_BG.png";

export function PromptSetView({
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
  isLoading,
  error,
  onSave,
  screen,
  onGoHome,
  photoUrl,
  photoAlt,
  onPhotoFetched,
  onRerollPhoto,
  rerollSeed,
}) {
  return (
    <div className="prompt-set-view">
      {screen === "home" ? (
        <div className="prompt-set-view__home">
          <header className="prompt-set-view__home-header">
            <div className="prompt-set-view__home-brand">
              <img src = {LOGO} alt="Break the Blank" width="85" height="85"/>
            </div>
            <h1 className="prompt-set-view__home-title">Break the Blank</h1>
            <p className="prompt-set-view__home-tagline">
              A blank page holds infinite potential. Let's dive in!
            </p>
          </header>

          <section className="prompt-set-view__home-controls">
            <div className="app__controls-row">
              <MediumSwitcher medium={medium} setMedium={setMedium} isLoading={isLoading} />
              <RandomThemeButton setKeywords={setKeywords} isLoading={isLoading} />
            </div>
            <KeywordInput
              keywords={keywords}
              setKeywords={setKeywords}
              onGenerate={generate}
              isLoading={isLoading}
              hasResults={false}
            />
            {error && <p className="app__error">{error}</p>}
          </section>
        </div>
      ) : (
        <div className="prompt-set-view__results">
          {/* Top header bar */}
          <header className="prompt-set-view__results-header">
            <div className="prompt-set-view__results-header-left">
              <span className="prompt-set-view__eyebrow">THEME</span>
              <h1 className="prompt-set-view__title">{theme}</h1>
            </div>
            <div className="prompt-set-view__results-header-right">
              <button
                className="btn btn--secondary prompt-set-view__reroll-all-btn"
                onClick={rerollAll}
                disabled={isLoading}
              >
                ↻ Reroll All
              </button>
              <p className="prompt-set-view__reroll-sub">New combinations for fresh perspective.</p>
            </div>
          </header>

          {/* Facet grid with mood preview */}
          <PlannerPanel
            facets={facets}
            theme={theme}
            quote={quote}
            medium={medium}
            paletteColors={paletteColors}
            lockStates={lockStates}
            onToggleLock={toggleLock}
            onReroll={reroll}
            onRerollAll={rerollAll}
            isLoading={isLoading}
            photoUrl={photoUrl}
            photoAlt={photoAlt}
            onPhotoFetched={onPhotoFetched}
            onRerollPhoto={onRerollPhoto}
            rerollSeed={rerollSeed}
          />

          {/* Bottom action bar */}
          <ActionBar onSave={onSave} onNewTheme={onGoHome} />
        </div>
      )}
    </div>
  );
}
