import { useState } from "react";
import "./SaveButton.css";

export function SaveButton({ onSave, disabled }) {
  const [flash, setFlash] = useState(false);

  function handleClick() {
    onSave();
    setFlash(true);
    setTimeout(() => setFlash(false), 1800);
  }

  return (
    <button
      className={`btn btn--ghost save-btn${flash ? " save-btn--flash" : ""}`}
      onClick={handleClick}
      disabled={disabled || flash}
    >
      {flash ? "✓ Saved!" : "Save"}
    </button>
  );
}
