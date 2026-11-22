import { Link } from "wouter";
import { Window } from "@/components/y2k/Window";

export function NotFoundPage() {
  return (
    <div className="narrow">
      <Window title="Page not found" slab>
        <div className="empty">
          <h1 className="display display--small">Nothing here</h1>
          <p className="muted">This address doesn't match any page in Moodora.</p>
          <Link href="/dashboard" className="btn btn--primary">
            Go to Home
          </Link>
        </div>
      </Window>
    </div>
  );
}
