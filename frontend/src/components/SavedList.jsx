import { useState } from "react";
import "./SavedList.css";

function formatDate(ts) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function SavedList({ savedList, onRestore, onDelete }) {
  const [open, setOpen] = useState(false);

  if (savedList.length === 0) return null;

  return (
    <section className="saved-list">
      <button
        className="saved-list__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>Saved sessions ({savedList.length})</span>
        <span className="saved-list__chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <ul className="saved-list__items">
          {savedList.map((snapshot) => (
            <li key={snapshot.id} className="saved-list__item">
              <button
                className="saved-list__restore-btn"
                onClick={() => onRestore(snapshot)}
              >
                <span className="saved-list__item-theme">
                  {snapshot.theme || "Untitled session"}
                </span>
                <span className="saved-list__item-meta">
                  {snapshot.medium} · {formatDate(snapshot.timestamp)}
                </span>
              </button>
              <button
                className="saved-list__delete-btn"
                onClick={() => onDelete(snapshot.id)}
                aria-label="Delete saved session"
                title="Delete"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
