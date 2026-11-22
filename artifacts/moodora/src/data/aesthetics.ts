import type { Aesthetic } from "@/models";
import { photo } from "./photos";

/** Sample moods shown before the user changes anything. */
export const seedAesthetics: Aesthetic[] = [
  {
    id: "slow-living",
    name: "Slow living",
    category: "Cottagecore",
    description:
      "A softer pace, gathered from sunlit kitchens, wild gardens and the little rituals that make a day feel full.",
    palette: ["#D6C4AA", "#89916F", "#F0E9DC", "#AA7968"],
    images: [photo.room, photo.desk, photo.latte],
    favorited: true,
  },
  {
    id: "quiet-luxury",
    name: "Quiet luxury",
    category: "Minimalist",
    description:
      "Restrained forms and tactile neutrals. Understated, intentional, and never in a hurry to be noticed.",
    palette: ["#E5DED1", "#9A8D7C", "#3D3B37", "#B8B5A8"],
    images: [photo.room, photo.polka, photo.peak],
    favorited: false,
  },
  {
    id: "rose-hour",
    name: "Rose hour",
    category: "Dreamy",
    description:
      "A romantic wash of faded pinks and late afternoon light, with a little softness around the edges.",
    palette: ["#C99A9B", "#E8D99A", "#F5ECE5", "#89766D"],
    images: [photo.mountains, photo.sunhat, photo.shore],
    favorited: true,
  },
  {
    id: "city-notes",
    name: "City notes",
    category: "Streetwear",
    description:
      "Candid corners, graphic shadows and the beautifully unplanned texture of a city afternoon.",
    palette: ["#4B5049", "#D5C8B5", "#C77D61", "#EBE6DD"],
    images: [photo.polka, photo.desk, photo.latte],
    favorited: false,
  },
  {
    id: "after-hours",
    name: "After hours",
    category: "Dark Academia",
    description:
      "Ink-dark rooms, old paper and amber light: a thoughtful study in contrast and collected things.",
    palette: ["#3D3934", "#94765B", "#C6B79F", "#D8D0C3"],
    images: [photo.butterflies, photo.desk, photo.latte],
    favorited: false,
  },
  {
    id: "soft-focus",
    name: "Soft focus",
    category: "Coquette",
    description:
      "A gentle, playful palette with delicate details and a nostalgic film-like finish.",
    palette: ["#E2C7C1", "#B78E8E", "#F1E8DE", "#A5A38C"],
    images: [photo.sunhat, photo.mountains, photo.clouds],
    favorited: false,
  },
  {
    id: "sunwashed",
    name: "Sunwashed",
    category: "Mediterranean",
    description:
      "Warm stone, blue shadows and the washed-out brightness of a long afternoon by the sea.",
    palette: ["#DCC5A1", "#74878A", "#F0E8D6", "#B47E62"],
    images: [photo.sea, photo.stripes, photo.palms],
    favorited: false,
  },
  {
    id: "archival",
    name: "Archival",
    category: "Vintage",
    description:
      "Found photographs and lived-in color, pulled together with the quiet charm of a family album.",
    palette: ["#B59677", "#66715E", "#E5D8C3", "#A46E60"],
    images: [photo.desk, photo.sunhat, photo.palms],
    favorited: false,
  },
  {
    id: "clean-lines",
    name: "Clean lines",
    category: "Clean Girl",
    description:
      "Fresh light, uncluttered frames and an easy palette that gives every image room to breathe.",
    palette: ["#EAE6DE", "#B8AA97", "#7D867A", "#D3B5A9"],
    images: [photo.stripes, photo.room, photo.clouds],
    favorited: false,
  },
  {
    id: "monochrome-study",
    name: "Monochrome study",
    category: "Monochrome",
    description:
      "A tonal exercise in shape and shadow, where texture takes the place of color.",
    palette: ["#383734", "#77746E", "#C8C4BB", "#E9E6DF"],
    images: [photo.peak, photo.polka, photo.desk],
    favorited: false,
  },
  {
    id: "sugar-plum",
    name: "Sugar plum",
    category: "Soft Girl",
    description:
      "Playful pastels meet quiet vintage details in a mood that feels light without becoming sweet.",
    palette: ["#D9B7B7", "#B6B9A5", "#EFE3D3", "#BD8C74"],
    images: [photo.mountains, photo.sunhat, photo.latte],
    favorited: false,
  },
  {
    id: "pixel-dream",
    name: "Pixel dream",
    category: "Y2K",
    description:
      "Photo booth windows, denim blue and silver. Early internet nostalgia kept clean.",
    palette: ["#6B8CCF", "#B9D0F0", "#E3D8EA", "#CDD1D9"],
    images: [photo.stripes, photo.clouds, photo.butterflies],
    favorited: false,
  },
  {
    id: "morning-pages",
    name: "Morning pages",
    category: "Light Academia",
    description:
      "Open notebooks, soft window light and the quiet optimism of a fresh page.",
    palette: ["#E9E0D1", "#C6B99E", "#89927C", "#C6927D"],
    images: [photo.desk, photo.room, photo.latte],
    favorited: false,
  },
  {
    id: "seoul-softness",
    name: "Seoul softness",
    category: "Korean Aesthetic",
    description:
      "Airy cafes, gentle color and small details gathered from a slow city afternoon.",
    palette: ["#EFE6DE", "#C8B7A8", "#8B9280", "#C9938F"],
    images: [photo.sunhat, photo.latte, photo.clouds],
    favorited: false,
  },
  {
    id: "analog-summer",
    name: "Analog summer",
    category: "Retro",
    description:
      "Warm film grain, sun-faded color and the easy imperfections of a found photograph.",
    palette: ["#D7B89A", "#A8755B", "#E5D7B9", "#718071"],
    images: [photo.palms, photo.shore, photo.sea],
    favorited: false,
  },
];

export const ALL_CATEGORIES = "All styles";

/** Filters on the moods page. */
export const categories = [
  ALL_CATEGORIES,
  "Minimalist",
  "Coquette",
  "Cottagecore",
  "Dark Academia",
  "Light Academia",
  "Vintage",
  "Dreamy",
  "Clean Girl",
  "Soft Girl",
  "Y2K",
  "Korean Aesthetic",
  "Retro",
  "Monochrome",
  "Mediterranean",
  "Streetwear",
];
