import { FACET_KEYS } from "../constants/facetKeys";
import { FacetCard } from "./FacetCard";
import "./PlannerPanel.css";

export function PlannerPanel({ facets, theme, medium, lockStates, onToggleLock, onReroll, onRerollAll, isLoading }) {
  const hasContent = Object.values(facets).some(Boolean);
  const allLocked = FACET_KEYS.every((k) => lockStates[k]);

  return (
    <section className="planner-panel">
      {theme && (
        <div className="planner-panel__theme">
          <span className="planner-panel__theme-label">Theme</span>
          <h2 className="planner-panel__theme-text">{theme}</h2>
        </div>
      )}

      {hasContent && (
        <div className="planner-panel__toolbar">
          <button
            className="btn btn--secondary"
            onClick={onRerollAll}
            disabled={isLoading || allLocked}
            title={allLocked ? "Unlock at least one facet to reroll" : "Reroll all unlocked facets"}
          >
            ↻ Reroll All
          </button>
        </div>
      )}

      <div className="planner-panel__grid">
        {FACET_KEYS.map((key) => (
          <FacetCard
            key={key}
            facetKey={key}
            content={facets[key]}
            medium={medium}
            isLocked={lockStates[key]}
            onToggleLock={onToggleLock}
            onReroll={onReroll}
            isLoading={isLoading}
          />
        ))}
      </div>
    </section>
  );
}
