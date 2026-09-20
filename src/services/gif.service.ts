import type { Gif, GifRating } from "../models/gif.interface";
import type {
  GiphyGif,
  GiphyResponse,
} from "../models/giphy-response.interface";

const API_BASE_URL = "https://api.giphy.com/v1/gifs";
const RESULT_LIMIT = 12;

type GiphyEndpoint = "trending" | "search";

function getApiKey(): string {
  const apiKey = import.meta.env.VITE_GIPHY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Falta VITE_GIPHY_API_KEY en .env.local.",
    );
  }

  return apiKey;
}

function isGifRating(value: string): value is GifRating {
  return value === "g" || value === "pg" || value === "pg-13";
}

function mapGiphyGif(item: GiphyGif): Gif {
  const {
    id,
    title,
    username,
    rating,
    alt_text: altText,
    images,
  } = item;

  const safeTitle = title || "GIF sin título";
  const previewImage = images.fixed_width ?? images.original;

  return {
    id,
    title: safeTitle,
    url: previewImage.url,
    detailUrl: images.original.url,
    altText: altText || safeTitle,
    username: username || undefined,
    tags: [],
    rating: isGifRating(rating) ? rating : "g",
  };
}

function buildUrl(
  endpoint: GiphyEndpoint,
  parameters: Record<string, string> = {},
): URL {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);

  url.search = new URLSearchParams({
    api_key: getApiKey(),
    limit: String(RESULT_LIMIT),
    rating: "g",
    ...parameters,
  }).toString();

  return url;
}

async function requestGifs(url: URL): Promise<Gif[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `GIPHY respondió con el estado ${response.status}.`,
    );
  }

  const result = (await response.json()) as GiphyResponse;

  if (result.meta.status !== 200) {
    throw new Error(result.meta.msg || "Respuesta inválida de GIPHY.");
  }

  return result.data.map(mapGiphyGif);
}

export async function getTrendingGifs(): Promise<Gif[]> {
  return requestGifs(buildUrl("trending"));
}

export async function searchGifs(value: string): Promise<Gif[]> {
  const query = value.trim();

  if (!query) {
    return getTrendingGifs();
  }

  return requestGifs(
    buildUrl("search", {
      q: query,
      lang: "es",
    }),
  );
}

export function findGifById(
  collection: Gif[],
  id: string,
): Gif | undefined {
  return collection.find((gif) => gif.id === id);
}
