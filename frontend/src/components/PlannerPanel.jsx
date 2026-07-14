import { FacetCard } from "./FacetCard";
import { MoodPreview } from "./MoodPreview";
import "./PlannerPanel.css";

// Grid area name to facet key mapping — determines visual slot order
const GRID_SLOTS = [
  { area: "emotional-core",      key: "emotional_core" },
  { area: "palette",             key: "sensory_palette" },
  { area: "structural-anchor",   key: "structural_anchor" },
  { area: "tension-pair",        key: "tension_pair" },
  { area: "reference-const",     key: "reference_constellation" },
  { area: "constraint",          key: "constraint" },
  { area: "avoid-list",          key: "avoid_list" },
  { area: "subject-matter",      key: "subject_matter" },
];

export function PlannerPanel({ facets, theme, quote, medium, paletteColors, lockStates, onToggleLock, onReroll, isLoading }) {
  return (
    <section className="planner-panel">
      <div className="planner-panel__grid">
        {/* Column 1: Mood preview — spans all rows */}
        <div className="planner-panel__mood">
          <MoodPreview theme={theme} quote={quote} isLoading={isLoading} />
        </div>

        {/* Facet cards in their named grid slots */}
        {GRID_SLOTS.map(({ area, key }) => (
          <div key={key} className={`planner-panel__slot planner-panel__slot--${area}`}>
            <FacetCard
              facetKey={key}
              content={facets[key]}
              medium={medium}
              paletteColors={key === "sensory_palette" ? paletteColors : null}
              isLocked={lockStates[key]}
              onToggleLock={onToggleLock}
              onReroll={onReroll}
              isLoading={isLoading}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
