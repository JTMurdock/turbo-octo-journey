import "./MediumSwitcher.css";

const MEDIUMS = [
  { value: "visual",  label: "Visual"  },
  { value: "writing", label: "Writing" },
  { value: "music",   label: "Music"   },
];

export function MediumSwitcher({ medium, setMedium, isLoading }) {
  return (
    <div className="medium-switcher" role="tablist" aria-label="Creative medium">
      {MEDIUMS.map(({ value, label }) => (
        <button
          key={value}
          role="tab"
          aria-selected={medium === value}
          className={`medium-switcher__tab${medium === value ? " medium-switcher__tab--active" : ""}`}
          onClick={() => setMedium(value)}
          disabled={isLoading}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
