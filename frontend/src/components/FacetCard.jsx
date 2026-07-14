import { FACET_LABELS, PALETTE_LABEL } from "../constants/facetKeys";
import "./FacetCard.css";

/* Decorative icons per facet — display-only, left of label */
const FACET_ICON = {
  emotional_core: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 13.5S1.5 9.5 1.5 5.5a3.5 3.5 0 0 1 6.5-1.8A3.5 3.5 0 0 1 14.5 5.5c0 4-6.5 8-6.5 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  sensory_palette: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="5.5" cy="6.5" r="1.2" fill="currentColor" />
      <circle cx="10.5" cy="6.5" r="1.2" fill="currentColor" />
      <circle cx="8" cy="10" r="1.2" fill="currentColor" />
    </svg>
  ),
  structural_anchor: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  tension_pair: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 8h13M8 1.5a7 7 0 0 1 0 13M8 1.5a7 7 0 0 0 0 13" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  ),
  reference_constellation: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10l-3.7 2.5 1.4-4.3L2 5.5h4.5L8 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  constraint: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 7V5a3 3 0 1 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  avoid_list: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.5 4.5l7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  subject_matter: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5a5 5 0 0 1 2 9.6V13H6v-1.9A5 5 0 0 1 8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6 14.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

/* SVG lock icons */
function LockIcon({ locked }) {
  return locked ? (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 7V5a3 3 0 1 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 7V5a3 3 0 1 1 6 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* SVG reroll (refresh/cycle) icon */
function RerollIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 8A5.5 5.5 0 1 1 8 2.5a5.5 5.5 0 0 1 3.9 1.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M10.5 1.5l1.9 2.6-2.6 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FacetCard({ facetKey, content, medium, paletteColors, isLocked, onToggleLock, onReroll, isLoading }) {
  const label =
    facetKey === "sensory_palette"
      ? PALETTE_LABEL[medium] ?? FACET_LABELS[facetKey]
      : FACET_LABELS[facetKey];

  const isEmpty = !content;

  return (
    <article className={`facet-card${isLocked ? " facet-card--locked" : ""}${isLoading ? " facet-card--loading" : ""}`}>
      <header className="facet-card__header">
        <span className="facet-card__label">
          <span className="facet-card__label-icon">{FACET_ICON[facetKey]}</span>
          {label}
        </span>
        <div className="facet-card__actions">
          <button
            className="facet-card__icon-btn"
            onClick={() => onToggleLock(facetKey)}
            disabled={isLoading}
            title={isLocked ? "Unlock this facet" : "Lock this facet"}
            aria-label={isLocked ? "Unlock" : "Lock"}
          >
            <LockIcon locked={isLocked} />
          </button>
          <button
            className="facet-card__icon-btn facet-card__reroll-btn"
            onClick={() => onReroll(facetKey)}
            disabled={isLoading}
            title="Reroll this facet"
            aria-label="Reroll"
          >
            <RerollIcon />
          </button>
        </div>
      </header>
      <div className="facet-card__content">
        {isLoading && isEmpty ? (
          <span className="facet-card__placeholder">Generating…</span>
        ) : isEmpty ? (
          <span className="facet-card__placeholder">—</span>
        ) : (
          content
        )}
      </div>
      {facetKey === "sensory_palette" && medium === "visual" && paletteColors?.length > 0 && (
        <div className="facet-card__swatches">
          {paletteColors.map((color) => (
            <div key={color.hex} className="facet-card__swatch-item">
              <div className="facet-card__swatch-color" style={{ backgroundColor: color.hex }} />
              <span className="facet-card__swatch-hex">{color.hex}</span>
              <span className="facet-card__swatch-name">{color.name}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
