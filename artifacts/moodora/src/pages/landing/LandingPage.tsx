import { Link } from "wouter";
import { Brand } from "@/components/layout/Brand";
import { Dock } from "@/components/layout/Dock";
import { Hero } from "./Hero";
import { Questions } from "./Questions";
import { Tools } from "./Tools";

export function LandingPage() {
  return (
    <div className="landing">
      <header className="status-bar">
        <Brand />
        <nav className="landing-nav" aria-label="Site">
          <a href="#studio">The studio</a>
          <Link href="/login">Log in</Link>
          <Link href="/register" className="btn btn--primary btn--small">
            Create account
          </Link>
        </nav>
      </header>
      <main>
        <Hero />
        <Tools />
        <Questions />
      </main>
      <footer className="landing-footer">
        <Brand />
        <span>Create. Arrange. Express.</span>
        <nav className="row" aria-label="Footer">
          <a href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="#studio">About</a>
          <a href="mailto:hello@moodora.studio">Contact</a>
        </nav>
      </footer>
      <Dock />
    </div>
  );
}
