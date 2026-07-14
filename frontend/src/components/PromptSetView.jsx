import { KeywordInput } from "./KeywordInput";
import { RandomThemeButton } from "./RandomThemeButton";
import { MediumSwitcher } from "./MediumSwitcher";
import { PlannerPanel } from "./PlannerPanel";
import { ActionBar } from "./ActionBar";
import "./PromptSetView.css";

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
}) {
  return (
    <div className="prompt-set-view">
      {screen === "home" ? (
        <div className="prompt-set-view__home">
          <header className="prompt-set-view__home-header">
            <div className="prompt-set-view__home-brand">
              <svg width="32" height="32" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <path
                  d="M11 2l1.8 5.5H18l-4.4 3.2 1.7 5.3L11 13l-4.3 3 1.7-5.3L4 7.5h5.2L11 2z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1 className="prompt-set-view__home-title">No More Blank Pages</h1>
            <p className="prompt-set-view__home-tagline">
              A curated prompt set to spark direction and overcome the blank page.
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
              <button className="prompt-set-view__back-btn" onClick={onGoHome}>
                ← New Theme
              </button>
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
          />

          {/* Bottom action bar */}
          <ActionBar onSave={onSave} />
        </div>
      )}
    </div>
  );
}
