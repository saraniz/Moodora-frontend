import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useUserStore } from "@/stores/user-store";
import { Avatar } from "./Avatar";
import { Brand } from "./Brand";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

/** Thin bar at the top of every studio page. */
export function StatusBar() {
  const now = useClock();
  const user = useUserStore((state) => state.user);
  return (
    <header className="status-bar">
      <Brand />
      <span className="status-clock">
        {now.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}{" "}
        {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
      </span>
      <Link href="/profile" className="status-user" aria-label="Open your profile">
        <Avatar user={user} size={24} />
        <span>{user.name}</span>
      </Link>
    </header>
  );
}
