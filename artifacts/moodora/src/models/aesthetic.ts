/** A mood in the mood library. */
export interface Aesthetic {
  id: string;
  name: string;
  category: string;
  description: string;
  /** Hex colors */
  palette: string[];
  /** Image URLs */
  images: string[];
  favorited: boolean;
}
