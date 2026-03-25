import { MathUtils } from "three";

export class SphereSlicer {
  private splitAmount = 0;

  getSplitAmount(): number {
    return this.splitAmount;
  }

  setSplitAmount(value: number): void {
    this.splitAmount = MathUtils.clamp(value, 0, 1);
  }

  splitStep(step = 0.08): void {
    this.setSplitAmount(this.splitAmount + step);
  }

  mergeStep(step = 0.08): void {
    this.setSplitAmount(this.splitAmount - step);
  }

  isSplit(): boolean {
    return this.splitAmount > 0.02;
  }
}
