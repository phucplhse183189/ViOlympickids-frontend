import { Camera, Object3D, Raycaster, Vector2 } from "three";

export type HiddenObjectTag = "Sphere" | "Cylinder" | "Wrong";

export type HiddenObjectRecord = {
  id: string;
  label: string;
  tag: HiddenObjectTag;
  object: Object3D;
  isActive: boolean;
};

export type HiddenObjectPickResult =
  | {
      kind: "correct";
      id: string;
      label: string;
      tag: HiddenObjectTag;
      remainingTargetCount: number;
    }
  | {
      kind: "wrong";
      id: string;
      label: string;
      tag: HiddenObjectTag;
    }
  | {
      kind: "none";
    }
  | {
      kind: "win";
      id: string;
      label: string;
      tag: HiddenObjectTag;
      remainingTargetCount: 0;
    };

export class HiddenObjectManager {
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private readonly records = new Map<string, HiddenObjectRecord>();
  private targetTag: HiddenObjectTag;

  constructor(targetTag: HiddenObjectTag) {
    this.targetTag = targetTag;
  }

  setTargetTag(nextTag: HiddenObjectTag): void {
    this.targetTag = nextTag;
  }

  setObject(id: string, label: string, tag: HiddenObjectTag, object: Object3D): void {
    this.records.set(id, {
      id,
      label,
      tag,
      object,
      isActive: true,
    });
  }

  removeObject(id: string): void {
    this.records.delete(id);
  }

  setObjectActive(id: string, isActive: boolean): void {
    const record = this.records.get(id);
    if (!record) return;
    record.isActive = isActive;
  }

  getTargetCount(): number {
    let count = 0;
    this.records.forEach((record) => {
      if (record.isActive && record.tag === this.targetTag) {
        count += 1;
      }
    });
    return count;
  }

  handlePointer(
    clientX: number,
    clientY: number,
    viewportRect: DOMRect,
    camera: Camera,
  ): HiddenObjectPickResult {
    if (viewportRect.width === 0 || viewportRect.height === 0) {
      return { kind: "none" };
    }

    this.pointer.x = ((clientX - viewportRect.left) / viewportRect.width) * 2 - 1;
    this.pointer.y = -((clientY - viewportRect.top) / viewportRect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, camera);

    const activeRoots = Array.from(this.records.values())
      .filter((record) => record.isActive)
      .map((record) => record.object);

    if (activeRoots.length === 0) {
      return { kind: "none" };
    }

    const hits = this.raycaster.intersectObjects(activeRoots, true);
    if (hits.length === 0) {
      return { kind: "none" };
    }

    const pickedRecord = this.findRecordFromHit(hits[0].object);
    if (!pickedRecord || !pickedRecord.isActive) {
      return { kind: "none" };
    }

    if (pickedRecord.tag === this.targetTag) {
      pickedRecord.isActive = false;
      const remaining = this.getTargetCount();

      if (remaining === 0) {
        return {
          kind: "win",
          id: pickedRecord.id,
          label: pickedRecord.label,
          tag: pickedRecord.tag,
          remainingTargetCount: 0,
        };
      }

      return {
        kind: "correct",
        id: pickedRecord.id,
        label: pickedRecord.label,
        tag: pickedRecord.tag,
        remainingTargetCount: remaining,
      };
    }

    return {
      kind: "wrong",
      id: pickedRecord.id,
      label: pickedRecord.label,
      tag: pickedRecord.tag,
    };
  }

  private findRecordFromHit(hitObject: Object3D): HiddenObjectRecord | null {
    let cursor: Object3D | null = hitObject;

    while (cursor) {
      for (const record of this.records.values()) {
        if (record.object.uuid === cursor.uuid) {
          return record;
        }
      }
      cursor = cursor.parent;
    }

    return null;
  }
}
