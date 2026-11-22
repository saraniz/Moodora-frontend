import { Link } from "wouter";
import { Bubble } from "@/components/y2k/Bubble";
import { Plant } from "@/components/y2k/Doodles";
import { Window } from "@/components/y2k/Window";
import { photo } from "@/data/photos";

/** Common questions, answered as a chat. */
export function Questions() {
  return (
    <section className="questions">
      <div className="questions-photos">
        <img className="framed" src={photo.mountains} alt="" />
        <img className="framed" src={photo.palms} alt="" />
        <Plant className="doodle" />
      </div>
      <Window title="Messages" slab>
        <div className="chat">
          <Bubble sent>do I need an account?</Bubble>
          <Bubble>No. Open it as a guest and start making things.</Bubble>
          <Bubble sent>where do my projects go?</Bubble>
          <Bubble>They stay in this browser, on your device.</Bubble>
          <Bubble sent>can I take my work out?</Bubble>
          <Bubble>Yes. Export feeds as PNG and collages as PNG or JPEG.</Bubble>
        </div>
        <Link href="/login" className="btn btn--primary btn--full">
          Open Moodora
        </Link>
      </Window>
    </section>
  );
}
