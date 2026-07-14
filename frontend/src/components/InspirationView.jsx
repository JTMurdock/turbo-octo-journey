import { useInspirationImages } from "../hooks/useInspirationImages";
import "./InspirationView.css";

export function InspirationView({ theme, keywords }) {
  const query = theme || keywords || "";
  const { images, isLoading, error, refresh } = useInspirationImages(query);

  function renderBody() {
    if (!query) {
      return (
        <p className="inspiration-view__message">
          Generate a theme first to see inspiration images.
        </p>
      );
    }

    if (isLoading) {
      return (
        <div className="inspiration-view__grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="inspiration-view__skeleton" />
          ))}
        </div>
      );
    }

    if (error) {
      return <p className="inspiration-view__message">{error}</p>;
    }

    return (
      <div className="inspiration-view__grid">
        {images.map((image) => (
          <a
            key={image.id}
            className="inspiration-view__tile"
            href={image.pageURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={image.imageURL} alt={image.altText} loading="lazy" />
            <div className="inspiration-view__overlay">{image.user}</div>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="inspiration-view">
      <header className="inspiration-view__header">
        <div>
          <h2 className="inspiration-view__title">Inspiration</h2>
          {query && (
            <p className="inspiration-view__query">Searching: &ldquo;{query}&rdquo;</p>
          )}
        </div>
        {query && !isLoading && (
          <button className="btn btn--secondary" onClick={refresh}>
            ↻ Refresh
          </button>
        )}
      </header>

      {renderBody()}
    </div>
  );
}
