import { FACET_LABELS, PALETTE_LABEL } from "../constants/facetKeys";
import "./FacetCard.css";

export function FacetCard({ facetKey, content, medium, isLocked, onToggleLock, onReroll, isLoading }) {
  const label =
    facetKey === "sensory_palette"
      ? PALETTE_LABEL[medium] ?? FACET_LABELS[facetKey]
      : FACET_LABELS[facetKey];

  const isEmpty = !content;

  return (
    <article className={`facet-card${isLocked ? " facet-card--locked" : ""}${isLoading ? " facet-card--loading" : ""}`}>
      <header className="facet-card__header">
        <span className="facet-card__label">{label}</span>
        <div className="facet-card__actions">
          <button
            className="facet-card__icon-btn"
            onClick={() => onToggleLock(facetKey)}
            disabled={isLoading}
            title={isLocked ? "Unlock this facet" : "Lock this facet"}
            aria-label={isLocked ? "Unlock" : "Lock"}
          >
            {isLocked ? "🔒" : "🔓"}
          </button>
          <button
            className="facet-card__icon-btn facet-card__reroll-btn"
            onClick={() => onReroll(facetKey)}
            disabled={isLoading}
            title="Reroll this facet"
            aria-label="Reroll"
          >
            ↻
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
    </article>
  );
}
