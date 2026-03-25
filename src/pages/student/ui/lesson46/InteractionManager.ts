import { AudioManager } from "./AudioManager";

export type CylinderState = "closed" | "unfolding" | "opened" | "folding";
export type SphereState = "whole" | "split";

type Listener = () => void;

export class InteractionManager {
  private readonly listeners = new Set<Listener>();
  private unfoldProgress = 0;
  private cylinderState: CylinderState = "closed";
  private sphereState: SphereState = "whole";
  private readonly audio: AudioManager;

  constructor(audio: AudioManager) {
    this.audio = audio;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  getUnfoldProgress(): number {
    return this.unfoldProgress;
  }

  getCylinderState(): CylinderState {
    return this.cylinderState;
  }

  getSphereState(): SphereState {
    return this.sphereState;
  }

  setUnfoldProgress(nextValue: number): void {
    const next = Math.max(0, Math.min(1, nextValue));
    const prev = this.unfoldProgress;
    if (prev === next) return;
    this.unfoldProgress = next;

    if (prev === 0 && next > 0) {
      this.cylinderState = "unfolding";
      this.audio.onUnfoldStart();
    }

    if (prev < 1 && next === 1) {
      this.cylinderState = "opened";
      this.audio.onUnfoldComplete();
    }

    if (prev === 1 && next < 1) {
      this.cylinderState = "folding";
      this.audio.onFoldStart();
    }

    if (prev > 0 && next === 0) {
      this.cylinderState = "closed";
      this.audio.onFoldComplete();
    }

    this.notify();
  }

  foldStep(step = 0.04): void {
    this.setUnfoldProgress(this.unfoldProgress - step);
  }

  unfoldStep(step = 0.04): void {
    this.setUnfoldProgress(this.unfoldProgress + step);
  }

  setSphereSplit(isSplit: boolean): void {
    const next: SphereState = isSplit ? "split" : "whole";
    if (this.sphereState === next) return;
    if (next === "split") {
      this.audio.onSphereSplit();
    }
    this.sphereState = next;
    this.notify();
  }
}
