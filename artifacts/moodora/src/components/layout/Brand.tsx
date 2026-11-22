import { Link } from "wouter";
import { Butterfly } from "@/components/y2k/Doodles";

export function Brand() {
  return (
    <Link href="/" className="brand">
      <Butterfly width={22} height={22} strokeWidth={2.4} />
      Moodora
    </Link>
  );
}
