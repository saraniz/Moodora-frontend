import type { PhotoAsset } from "@/models";

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous"; // lets the canvas be exported
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = url;
  });

/** Draws the first nine photos as a 3 x 3 PNG and downloads it. Returns how many failed. */
export async function exportFeed(items: PhotoAsset[], name: string) {
  const size = 300;
  const canvas = document.createElement("canvas");
  canvas.width = size * 3;
  canvas.height = size * 3;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable.");

  const results = await Promise.allSettled(
    items.slice(0, 9).map((item) => loadImage(item.url)),
  );
  results.forEach((result, i) => {
    if (result.status !== "fulfilled") return;
    const image = result.value;
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    context.drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      (i % 3) * size,
      Math.floor(i / 3) * size,
      size,
      size,
    );
  });

  const link = document.createElement("a");
  link.download = `${name || "moodora-feed"}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  return results.filter((result) => result.status === "rejected").length;
}
