import "./styles/style.css";

import {
  clearGifDetail,
  renderGifDetail,
} from "./components/gif-detail";
import { renderGallery } from "./components/gallery";
import { renderStatus } from "./components/status";
import type { Gif } from "./models/gif.interface";
import { RequestStatus } from "./models/request-status.enum";
import {
  findGifById,
  getTrendingGifs,
  searchGifs,
} from "./services/gif.service";
import { getRequiredElement } from "./utils/dom";

const app = getRequiredElement<HTMLDivElement>("#app");

app.innerHTML = `
  <main class="app-shell">
    <header class="hero">
      <p class="eyebrow">EC1 - Programación asíncrona</p>
      <h1>GIFinder</h1>
      <p>Busca contenido mediante la API de GIPHY.</p>
    </header>

    <form id="search-form" class="search-form">
      <label for="search-input">Buscar GIF</label>
      <div class="search-row">
        <input
          id="search-input"
          name="query"
          type="search"
          maxlength="50"
          placeholder="Ejemplo: programación"
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

    <footer class="giphy-attribution">
      <a href="https://giphy.com/" target="_blank" rel="noopener noreferrer">
        <img src="/powered-by-giphy.png" alt="Powered by GIPHY" />
      </a>
    </footer>
  </main>
`;

const form = getRequiredElement<HTMLFormElement>("#search-form");
const input = getRequiredElement<HTMLInputElement>("#search-input");
const gallery = getRequiredElement<HTMLElement>("#gif-gallery");
const status = getRequiredElement<HTMLParagraphElement>(
  "#search-status",
);
const detailContainer = getRequiredElement<HTMLElement>("#gif-detail");

let currentGifs: Gif[] = [];

function showResults(results: Gif[]): void {
  currentGifs = results;
  renderGallery(currentGifs, gallery);

  renderStatus(
    currentGifs.length > 0
      ? RequestStatus.Success
      : RequestStatus.Empty,
    status,
    currentGifs.length,
  );
}

function showRequestError(error: unknown): void {
  const message = error instanceof Error
    ? error.message
    : "Error desconocido.";

  console.error(message);
  currentGifs = [];
  renderGallery(currentGifs, gallery);
  clearGifDetail(detailContainer);
  renderStatus(RequestStatus.Error, status);
}

async function loadTrending(): Promise<void> {
  renderStatus(RequestStatus.Loading, status);

  try {
    const results = await getTrendingGifs();
    showResults(results);
  } catch (error: unknown) {
    showRequestError(error);
  }
}

form.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();
  renderStatus(RequestStatus.Loading, status);
  clearGifDetail(detailContainer);

  try {
    const results = await searchGifs(input.value);
    showResults(results);
  } catch (error: unknown) {
    showRequestError(error);
  }
});

gallery.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  const detailButton = target.closest<HTMLButtonElement>("[data-gif-id]");

  if (!detailButton?.dataset.gifId) {
    return;
  }

  const selectedGif = findGifById(
    currentGifs,
    detailButton.dataset.gifId,
  );

  if (!selectedGif) {
    renderStatus(RequestStatus.Error, status);
    return;
  }

  renderGifDetail(selectedGif, detailContainer);
});

detailContainer.addEventListener("click", (event) => {
  const target = event.target;
  if (
    target instanceof Element
    && target.closest('[data-action="close-detail"]')
  ) {
    clearGifDetail(detailContainer);
  }
});

renderStatus(RequestStatus.Initial, status);
void loadTrending();
