import "./Sidebar.css";


const TABS = [
  {
    id: "prompt-set",
    label: "Prompt Set",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "notepad",
    label: "Notepad",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "saved",
    label: "Saved",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M5 3h10a1 1 0 0 1 1 1v13l-6-3.5L4 17V4a1 1 0 0 1 1-1z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M15.78 4.22l-1.42 1.42M5.64 14.36l-1.42 1.42"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function Sidebar({ activeTab, onTabChange, onBrandClick }) {
  return (
    <aside className="sidebar">
      {/* Brand logo */}
      <button className="sidebar__brand" aria-label="No More Blank Pages" onClick={onBrandClick}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path
            d="M11 2l1.8 5.5H18l-4.4 3.2 1.7 5.3L11 13l-4.3 3 1.7-5.3L4 7.5h5.2L11 2z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Nav tabs */}
      <nav className="sidebar__nav" aria-label="Main navigation">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar__tab${activeTab === tab.id ? " sidebar__tab--active" : ""}`}
            onClick={() => onTabChange(tab.id)}
            aria-current={activeTab === tab.id ? "page" : undefined}
            title={tab.label}
          >
            <span className="sidebar__tab-icon">{tab.icon}</span>
            <span className="sidebar__tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
