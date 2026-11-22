import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A chat bubble. "sent" sits on the right in blue. */
export function Bubble({ children, sent }: { children: ReactNode; sent?: boolean }) {
  return <div className={cn("bubble", sent && "bubble--sent")}>{children}</div>;
}
