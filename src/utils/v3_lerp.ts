import { Vector3 } from "@babylonjs/core";

export class V3Lerp {
  private currentStep = 0;
  constructor(
    private readonly start: Vector3,
    private readonly end: Vector3,
    private readonly duration: number
  ) {}

  next(): Vector3 {
    if (this.currentStep === this.duration) return this.end;
    return Vector3.Lerp(
      this.start,
      this.end,
      ++this.currentStep / this.duration
    );
  }

  done(): boolean {
    return this.currentStep === this.duration;
  }
}
