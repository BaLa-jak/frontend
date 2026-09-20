export interface GiphyImage {
  url: string;
  width: string;
  height: string;
}

export interface GiphyGif {
  id: string;
  title: string;
  username: string;
  rating: string;
  alt_text?: string;
  images: {
    fixed_width?: GiphyImage;
    original: GiphyImage;
  };
}

export interface GiphyPagination {
  total_count: number;
  count: number;
  offset: number;
}

export interface GiphyMeta {
  status: number;
  msg: string;
  response_id: string;
}

export interface GiphyResponse {
  data: GiphyGif[];
  pagination: GiphyPagination;
  meta: GiphyMeta;
}
