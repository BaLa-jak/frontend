import type { Gif } from "../models/gif.interface";

export function renderGifDetail(
  gif: Gif,
  container: HTMLElement,
): void {
  const {
    id,
    title,
    url,
    username = "Autor no disponible",
    rating,
    tags,
  } = gif;

  const [
    mainTag = "Sin etiqueta",
    ...secondaryTags
  ] = tags;

  const relatedTags = secondaryTags.length > 0
    ? secondaryTags.join(", ")
    : "Ninguna";

  container.innerHTML = `
    <article class="gif-detail">
      <button
        type="button"
        data-action="close-detail"
        aria-label="Cerrar detalle"
      >
        Cerrar
      </button>

      <img
        src="${url}"
        alt="${title}"
        loading="lazy"
      />

      <h2>${title}</h2>
      <p><strong>Identificador:</strong> ${id}</p>
      <p><strong>Autor:</strong> ${username}</p>
      <p>
        <strong>Clasificación:</strong>
        ${rating.toUpperCase()}
      </p>
      <p>
        <strong>Etiqueta principal:</strong>
        ${mainTag}
      </p>
      <p>
        <strong>Otras etiquetas:</strong>
        ${relatedTags}
      </p>
    </article>
  `;
}

export function clearGifDetail(container: HTMLElement): void {
  container.replaceChildren();
}
