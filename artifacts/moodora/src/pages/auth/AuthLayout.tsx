import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Brand } from "@/components/layout/Brand";
import { Butterfly } from "@/components/y2k/Doodles";
import { Window } from "@/components/y2k/Window";
import { photo } from "@/data/photos";
import { useUserStore } from "@/stores/user-store";

interface AuthLayoutProps {
  windowTitle: string;
  heading: string;
  text: string;
  /** The form */
  children: ReactNode;
  switchText: string;
  switchLabel: string;
  switchHref: string;
}

/** The frame shared by the login and register pages. */
export function AuthLayout(props: AuthLayoutProps) {
  const [, go] = useLocation();
  const signIn = useUserStore((state) => state.signIn);
  const continueAsGuest = () => {
    signIn({ email: "guest@moodora.local", name: "Guest creator" });
    go("/dashboard");
  };
  return (
    <div className="auth">
      <header className="status-bar">
        <Brand />
      </header>
      <main className="auth-main">
        <div className="auth-collage" aria-hidden>
          <img className="framed" src={photo.sunhat} alt="" />
          <img className="framed" src={photo.clouds} alt="" />
          <img className="framed" src={photo.shore} alt="" />
          <Butterfly className="doodle" />
        </div>
        <Window title={props.windowTitle} slab>
          <h1 className="display display--small">{props.heading}</h1>
          <p className="muted">{props.text}</p>
          {props.children}
          <button className="btn btn--full" onClick={continueAsGuest}>
            Continue as a guest
          </button>
          <p className="auth-switch">
            {props.switchText}{" "}
            <Link href={props.switchHref} className="link">
              {props.switchLabel}
            </Link>
          </p>
        </Window>
      </main>
    </div>
  );
}
