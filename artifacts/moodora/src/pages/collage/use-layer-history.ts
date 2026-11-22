import { useRef, useState } from "react";
import type { Layer } from "@/models";

const MAX_STEPS = 60;

interface History {
  past: Layer[][];
  present: Layer[];
  future: Layer[][];
}

/** The list of layers, with undo and redo. */
export function useLayerHistory(initial: Layer[]) {
  const [history, setHistory] = useState<History>(() => ({
    past: [],
    present: initial,
    future: [],
  }));
  // Always the latest value, so canvas events never see old layers.
  const latest = useRef(history);

  const apply = (next: History) => {
    latest.current = next;
    setHistory(next);
  };

  const commit = (change: (layers: Layer[]) => Layer[]) => {
    const { past, present } = latest.current;
    apply({
      past: [...past, present].slice(-MAX_STEPS),
      present: change(present),
      future: [],
    });
  };

  const undo = () => {
    const { past, present, future } = latest.current;
    if (!past.length) return;
    apply({
      past: past.slice(0, -1),
      present: past[past.length - 1],
      future: [present, ...future],
    });
  };

  const redo = () => {
    const { past, present, future } = latest.current;
    if (!future.length) return;
    apply({
      past: [...past, present],
      present: future[0],
      future: future.slice(1),
    });
  };

  return {
    layers: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    current: () => latest.current.present,
    commit,
    undo,
    redo,
    /** Replaces everything and forgets the history. */
    reset: (layers: Layer[]) => apply({ past: [], present: layers, future: [] }),
  };
}
