import "./SavedView.css";

const MEDIUM_LABELS = { visual: "Visual", writing: "Writing", music: "Music" };

function truncate(str, max = 80) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function mediumKey(medium) {
  return (medium || "").toLowerCase();
}

function SavedCard({ snapshot, onRestore, onDelete }) {
  const { id, timestamp, theme, medium, facets } = snapshot;
  const mk = mediumKey(medium);
  const label = MEDIUM_LABELS[mk] || medium || "Unknown";
  const date = new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const emotionalCore = facets?.emotional_core;
  const sensoryPalette = facets?.sensory_palette;

  return (
    <div className="saved-card">
      <div className="saved-card__top">
        <h3 className="saved-card__theme">{theme || "Untitled"}</h3>
        <span className={`saved-card__medium saved-card__medium--${mk}`}>{label}</span>
      </div>

      <p className="saved-card__date">{date}</p>

      <div className="saved-card__preview">
        {emotionalCore && (
          <div>
            <p className="saved-card__facet-label">Emotional Core</p>
            <p className="saved-card__facet-value">{truncate(emotionalCore)}</p>
          </div>
        )}
        {sensoryPalette && (
          <div>
            <p className="saved-card__facet-label">Sensory Palette</p>
            <p className="saved-card__facet-value">{truncate(sensoryPalette)}</p>
          </div>
        )}
      </div>

      <div className="saved-card__actions">
        <button className="btn btn--primary" onClick={() => onRestore(snapshot)}>
          Restore
        </button>
        <button className="btn btn--ghost" onClick={() => onDelete(id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export function SavedView({ savedList, onRestore, onDelete }) {
  return (
    <div className="saved-view">
      <header className="saved-view__header">
        <h2 className="saved-view__title">Saved Themes</h2>
        <p className="saved-view__count">{savedList.length} saved</p>
      </header>

      {savedList.length === 0 ? (
        <div className="saved-view__empty">
          <p>No saved themes yet.</p>
          <p className="saved-view__empty-hint">
            Generate a theme and click Save to keep it.
          </p>
        </div>
      ) : (
        <div className="saved-view__grid">
          {savedList.map((snapshot) => (
            <SavedCard
              key={snapshot.id}
              snapshot={snapshot}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
