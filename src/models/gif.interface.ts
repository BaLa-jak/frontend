export type GifRating = "g" | "pg" | "pg-13";

export interface Gif {
  id: string;
  title: string;
  url: string;
  detailUrl?: string;
  altText?: string;
  username?: string;
  tags: string[];
  rating: GifRating;
}
