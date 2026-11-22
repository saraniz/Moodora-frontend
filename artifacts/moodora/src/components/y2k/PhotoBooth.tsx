import { Camera } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Window } from "./Window";

interface PhotoBoothProps {
  shots: { src: string; alt: string }[];
}

/** The hero window: press the shutter to flip to the next shot. */
export function PhotoBooth({ shots }: PhotoBoothProps) {
  const [index, setIndex] = useState(0);
  const [flashes, setFlashes] = useState(0);
  const show = (next: number) => {
    setIndex(next);
    setFlashes((count) => count + 1);
  };
  return (
    <Window title="Photo Booth" slab className="booth" bodyClassName="booth-body">
      <div className="booth-screen">
        <img className="photo" src={shots[index].src} alt={shots[index].alt} />
        {flashes > 0 && <span key={flashes} className="booth-flash" />}
      </div>
      <div className="booth-controls">
        <div className="booth-strip">
          {shots.map((shot, i) => (
            <button
              key={shot.src}
              className={cn("booth-thumb", i === index && "is-active")}
              onClick={() => show(i)}
              aria-label={`Show shot ${i + 1}`}
            >
              <img className="photo" src={shot.src} alt="" />
            </button>
          ))}
        </div>
        <button
          className="booth-shutter"
          onClick={() => show((index + 1) % shots.length)}
          aria-label="Take the next shot"
        >
          <Camera size={17} />
        </button>
        <span className="booth-count">
          {index + 1} of {shots.length}
        </span>
      </div>
    </Window>
  );
}
