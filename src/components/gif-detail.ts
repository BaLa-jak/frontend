import type { Gif } from "../models/gif.interface";
import { escapeHtml } from "../utils/html";

export function renderGifDetail(
  gif: Gif,
  container: HTMLElement,
): void {
  const {
    title,
    url,
    detailUrl = url,
    altText = title,
    username = "Autor no disponible",
    rating,
  } = gif;

  container.innerHTML = `
    <article class="gif-detail">
      <button
        type="button"
        data-action="close-detail"
        aria-label="Cerrar detalle"
      >
        Cerrar
      </button>

      <h2>${escapeHtml(title)}</h2>
      <img
        src="${detailUrl}"
        alt="${escapeHtml(altText)}"
      />
      <p>Autor: ${escapeHtml(username)}</p>
      <p>Clasificación: ${rating.toUpperCase()}</p>
    </article>
  `;
}

export function clearGifDetail(
  container: HTMLElement,
): void {
  container.replaceChildren();
}
