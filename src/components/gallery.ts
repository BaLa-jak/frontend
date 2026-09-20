import type { Gif } from "../models/gif.interface";
import { escapeHtml } from "../utils/html";

function createGifCard(gif: Gif): string {
  const {
    id,
    title,
    url,
    altText = title,
    username = "Autor no disponible",
    rating,
  } = gif;

  return `
    <article class="gif-card">
      <img
        src="${url}"
        alt="${escapeHtml(altText)}"
        loading="lazy"
      />

      <div class="gif-card__content">
        <h2>${escapeHtml(title)}</h2>
        <p>
          ${escapeHtml(username)} - Clasificación
          ${rating.toUpperCase()}
        </p>
        <button
          type="button"
          data-gif-id="${id}"
        >
          Ver detalle
        </button>
      </div>
    </article>
  `;
}

export function renderGallery(
  collection: Gif[],
  container: HTMLElement,
): void {
  container.innerHTML = collection
    .map(createGifCard)
    .join("");
}
