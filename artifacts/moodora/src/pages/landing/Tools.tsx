import { Link } from "wouter";
import { Palette } from "@/components/moods/Palette";
import { Window } from "@/components/y2k/Window";
import { seedAesthetics } from "@/data/aesthetics";
import { photo, photos } from "@/data/photos";

const featured = ["pixel-dream", "sunwashed", "soft-focus", "monochrome-study"];
const moods = featured.flatMap((id) => seedAesthetics.filter((mood) => mood.id === id));

/** What the studio does, shown as three windows. */
export function Tools() {
  return (
    <section id="studio" className="tools">
      <h2 className="display">Three windows, one studio</h2>
      <div className="tools-grid">
        <Window title="Feed planner">
          <div className="mini-feed">
            {photos.slice(0, 9).map((src) => (
              <img key={src} className="photo" src={src} alt="" />
            ))}
          </div>
          <h3>See the next nine first</h3>
          <p className="muted">
            Drag your photos around a 3 by 3 grid until the order feels right.
          </p>
          <Link href="/planner" className="btn">
            Plan a feed
          </Link>
        </Window>
        <Window title="Collage studio">
          <div className="mini-collage">
            <img className="framed" src={photo.lake} alt="" />
            <img className="framed" src={photo.stripes} alt="" />
            <img className="framed" src={photo.butterflies} alt="" />
            <span className="sticker">tuesday walk</span>
          </div>
          <h3>Layer photos, type and shapes</h3>
          <p className="muted">
            Start from a layout or a blank canvas, then export a PNG or JPEG.
          </p>
          <Link href="/collage" className="btn">
            Make a collage
          </Link>
        </Window>
        <Window title="Moods">
          <div className="mini-moods">
            {moods.map((mood) => (
              <div key={mood.id}>
                <span>{mood.name}</span>
                <Palette colors={mood.palette} />
              </div>
            ))}
          </div>
          <h3>Keep the palettes you love</h3>
          <p className="muted">
            {seedAesthetics.length} moods with photos and colors, ready to drop
            into a collage.
          </p>
          <Link href="/explore" className="btn">
            Browse moods
          </Link>
        </Window>
      </div>
    </section>
  );
}
