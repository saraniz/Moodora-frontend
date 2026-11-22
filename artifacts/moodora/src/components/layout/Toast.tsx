import { useToastStore } from "@/stores/toast-store";

export function Toast() {
  const message = useToastStore((state) => state.message);
  return (
    <div role="status" aria-live="polite">
      {message && <div className="toast-note">{message}</div>}
    </div>
  );
}
