import { useMemo } from "react";
import "./KeywordInput.css";

function wordCount(text) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function KeywordInput({ keywords, setKeywords, onGenerate, isLoading, hasResults }) {
  const count = useMemo(() => wordCount(keywords), [keywords]);
  const overLimit = count > 100;

  function handleChange(e) {
    setKeywords(e.target.value);
  }

  return (
    <div className="keyword-input">
      <label className="keyword-input__label" htmlFor="keyword-textarea">
        Keywords or theme
      </label>
      <textarea
        id="keyword-textarea"
        className={`keyword-input__textarea${overLimit ? " keyword-input__textarea--over" : ""}`}
        value={keywords}
        onChange={handleChange}
        placeholder="Describe your project in a few words — a mood, a place, a feeling…"
        rows={4}
        disabled={isLoading}
      />
      <div className="keyword-input__footer">
        <span className={`keyword-input__count${overLimit ? " keyword-input__count--over" : ""}`}>
          {count} / 100 words
        </span>
        <button
          className="btn btn--primary"
          onClick={onGenerate}
          disabled={isLoading || overLimit || keywords.trim() === ""}
        >
          {isLoading ? "Generating…" : hasResults ? "Regenerate" : "Generate"}
        </button>
      </div>
    </div>
  );
}
