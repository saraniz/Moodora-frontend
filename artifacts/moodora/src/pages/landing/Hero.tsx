import { Link } from "wouter";
import { Bubble } from "@/components/y2k/Bubble";
import { CalendarWidget } from "@/components/y2k/CalendarWidget";
import { Butterfly, Cloud, Sun, Wave } from "@/components/y2k/Doodles";
import { PhotoBooth } from "@/components/y2k/PhotoBooth";
import { photo } from "@/data/photos";

const shots = [
  { src: photo.stripes, alt: "A person in a blue striped shirt" },
  { src: photo.shore, alt: "A silhouette on the beach at dusk" },
  { src: photo.sea, alt: "Open blue sea" },
  { src: photo.clouds, alt: "White clouds in a blue sky" },
];

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-left">
        <img className="hero-mono" src={photo.polka} alt="" />
        <div className="hero-bubbles">
          <Bubble>use the blue one</Bubble>
          <Bubble>save that mood</Bubble>
          <Bubble>post it sunday</Bubble>
        </div>
      </div>

      <div className="hero-center">
        <Butterfly className="doodle hero-butterfly" />
        <h1 className="hero-title">Moodora</h1>
        <p className="hero-text">
          Create, arrange, express. A small studio for planning your feed, cutting
          up photos into collages and keeping the moods you love.
        </p>
        <PhotoBooth shots={shots} />
        <div className="row row--center hero-cta">
          <Link href="/dashboard" className="btn btn--primary">
            Start creating
          </Link>
          <Link href="/explore" className="btn">
            Browse moods
          </Link>
        </div>
      </div>

      <div className="hero-right">
        <Cloud className="doodle hero-cloud" />
        <img className="framed hero-portrait" src={photo.sunhat} alt="" />
        <CalendarWidget className="hero-calendar" />
        <div className="now-card">
          <img className="photo" src={photo.clouds} alt="" />
          <strong>Pixel dream</strong>
          <span>Y2K mood</span>
        </div>
        <Sun className="doodle hero-sun" />
        <span className="sticker hero-sticker">soft days</span>
        <img className="framed hero-round" src={photo.sea} alt="" />
      </div>

      <i className="dot dot--a" />
      <i className="dot dot--b" />
      <i className="dot dot--c" />
      <i className="dot dot--d" />
      <i className="dot dot--e" />
      <Wave className="hero-wave" />
    </section>
  );
}
