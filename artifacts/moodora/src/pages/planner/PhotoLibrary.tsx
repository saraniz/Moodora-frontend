import { ImagePlus, Plus } from "lucide-react";
import type { PhotoAsset } from "@/models";

interface PhotoLibraryProps {
  items: PhotoAsset[];
  onAdd: (asset: PhotoAsset) => void;
  onUpload: () => void;
}

export function PhotoLibrary({ items, onAdd, onUpload }: PhotoLibraryProps) {
  return (
    <>
      <p className="muted">Select a photo to add it to the grid again.</p>
      <div className="library">
        {items.map((asset) => (
          <button
            key={asset.id}
            className="library-item"
            onClick={() => onAdd(asset)}
            aria-label={`Add ${asset.name} to the grid`}
          >
            <img className="photo" src={asset.url} alt="" />
            <span>
              <Plus size={12} />
            </span>
          </button>
        ))}
      </div>
      <button className="btn btn--full" onClick={onUpload}>
        <ImagePlus size={15} /> Upload photos
      </button>
    </>
  );
}
