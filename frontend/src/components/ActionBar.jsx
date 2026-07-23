import "./ActionBar.css";

export function ActionBar({ onSave, onNewTheme }) {
  return (
    <div className="action-bar">
      <button className="btn btn--ghost action-bar__btn" onClick={onNewTheme}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M8 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        New Theme
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
  );
}
