export type GifRating = 'g' | 'pg' | 'pg-13';

export interface Gif {
  id: string;
  title: string;
  url: string;
  username?: string;
  description?: string;
  tags: string[];
  rating: GifRating;
}
