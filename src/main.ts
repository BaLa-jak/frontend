import "./styles/style.css";

import { gifs } from "./data/gifs";
import { clearGifDetail, renderGifDetail } from "./components/gif-detail";
import { renderGallery } from "./components/gallery";
import { renderStatus } from "./components/status";
import { RequestStatus } from "./models/request-status.enum";
import { findGifById, searchGifs } from "./services/gif.service";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("No se encontró el elemento #app.");
}

app.innerHTML = `
  <main class="app-shell">
    <header class="hero">
      <p class="eyebrow">
        EC1 - Organización modular
      </p>
      <h1>GIFinder</h1>
      <p>Explora una colección local de GIFs.</p>
    </header>

    <form id="search-form" class="search-form">
      <label for="search-input">
        Buscar por título, autor o etiqueta
      </label>

      <div class="search-row">
        <input
          id="search-input"
          name="query"
          type="search"
          placeholder="Ejemplo: gato"
          autocomplete="off"
        />
        <button type="submit">Buscar</button>
      </div>
    </form>

    <p
      id="search-status"
      class="status"
      role="status"
      aria-live="polite"
    ></p>

    <section
      id="gif-gallery"
      class="gallery"
      aria-label="Resultados"
    ></section>

    <aside
      id="gif-detail"
      class="gif-detail-container"
      aria-live="polite"
    ></aside>
  </main>
`;

const form = document.querySelector<HTMLFormElement>("#search-form");
const input = document.querySelector<HTMLInputElement>("#search-input");
const gallery = document.querySelector<HTMLElement>("#gif-gallery");
const status = document.querySelector<HTMLParagraphElement>("#search-status");
const detailContainer = document.querySelector<HTMLElement>("#gif-detail");

if (
  !form ||
  !input ||
  !gallery ||
  !status ||
  !detailContainer
) {
  throw new Error("No se pudo inicializar la interfaz.");
}

form.addEventListener("submit", (event: SubmitEvent) => {
  event.preventDefault();

  renderStatus(RequestStatus.Loading, status);

  const results = searchGifs(gifs, input.value);

  renderGallery(results, gallery);
  clearGifDetail(detailContainer);

  if (results.length === 0) {
    renderStatus(RequestStatus.Empty, status);
    return;
  }

  renderStatus(RequestStatus.Success, status, results.length);
});

input.addEventListener("input", () => {
  if (input.value.trim() !== "") {
    return;
  }
  renderGallery(gifs, gallery);
  clearGifDetail(detailContainer);
  renderStatus(RequestStatus.Initial, status, gifs.length);
});

gallery.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  const detailButton = target.closest<HTMLButtonElement>(
    "[data-gif-id]",
  );

  if (!detailButton) {
    return;
  }

  const gifId = detailButton.dataset.gifId;

  if (!gifId) {
    renderStatus(RequestStatus.Error, status);
    return;
  }

  const selectedGif = findGifById(gifs, gifId);

  if (!selectedGif) {
    renderStatus(RequestStatus.Error, status);
    return;
  }

  renderGifDetail(selectedGif, detailContainer);
});

detailContainer.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  const closeButton = target.closest<HTMLButtonElement>(
    '[data-action="close-detail"]',
  );

  if (!closeButton) {
    return;
  }

  clearGifDetail(detailContainer);
});

renderGallery(gifs, gallery);
renderStatus(RequestStatus.Initial, status, gifs.length);
