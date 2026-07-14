import "./ActionBar.css";

export function ActionBar({ onSave }) {
  return (
    <div className="action-bar">
      {/* Left: tip */}
      <div className="action-bar__tip">
        <span className="action-bar__tip-title">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="action-bar__star-icon">
            <path d="M7 1l1.3 3.9H12L9 7.1l1.2 3.9L7 9l-3.2 2 1.2-3.9L2 4.9h3.7L7 1z" fill="currentColor" />
          </svg>
          Feeling stuck?
        </span>
        <span className="action-bar__tip-sub">
          Start with a 5-minute sketch. Don&rsquo;t aim—explore.
        </span>
      </div>

      {/* Center: tagline */}
      <div className="action-bar__tagline">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="action-bar__star-icon">
          <path d="M7 1l1.3 3.9H12L9 7.1l1.2 3.9L7 9l-3.2 2 1.2-3.9L2 4.9h3.7L7 1z" fill="currentColor" />
        </svg>
        <span>Use this set as a springboard. Start loose. Follow feeling.</span>
      </div>

      {/* Right: action buttons */}
      <div className="action-bar__buttons">
        <button className="btn btn--ghost action-bar__btn" disabled title="Coming soon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M10 2.5l1.5 1.5L4 11.5H2.5V10L10 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          Start Sketch
        </button>
        <button className="btn btn--ghost action-bar__btn" disabled title="Coming soon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1l1.3 3.9H12L9 7.1l1.2 3.9L7 9l-3.2 2 1.2-3.9L2 4.9h3.7L7 1z" fill="currentColor" />
          </svg>
          Create Prompt
        </button>
        <button className="btn btn--primary action-bar__btn action-bar__btn--save" onClick={onSave}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 2h8l2 2v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2z" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5 2v3h4V2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <rect x="3.5" y="7.5" width="7" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          Save Prompt Set
        </button>
      </div>
    </div>
  );
}
