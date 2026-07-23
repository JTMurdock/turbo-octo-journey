import "./NotesView.css";

export function NotesView({ notes, setNotes, theme }) {
  return (
    <div className="notes-view">
      <header className="notes-view__header">
        <div>
          <h2 className="notes-view__title">Notepad</h2>
          {theme && (
            <p className="notes-view__theme-hint">
              Notes for: <em>{theme}</em>
            </p>
          )}
        </div>
        {!theme && (
          <p className="notes-view__empty-hint">
            Generate a theme first — notes will be saved with it.
          </p>
        )}
      </header>

      <textarea
        className="notes-view__textarea"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={
          theme
            ? "Jot down thoughts, expand on a facet, sketch out a scene…"
            : "Generate a theme to start taking notes."
        }
        disabled={!theme}
        spellCheck
      />
    </div>
  );
}
