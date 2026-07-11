import { sampleWords } from "../data/randomWords";
import "./RandomThemeButton.css";

export function RandomThemeButton({ setKeywords, isLoading }) {
  function handleClick() {
    const words = sampleWords(4);
    setKeywords(words.join(", "));
  }

  return (
    <button
      className="btn btn--ghost random-theme-btn"
      onClick={handleClick}
      disabled={isLoading}
      title="Fill with a random theme"
    >
      ⚄ Random theme
    </button>
  );
}
