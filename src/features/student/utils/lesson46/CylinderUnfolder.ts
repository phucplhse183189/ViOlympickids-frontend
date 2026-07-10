import { BufferGeometry, Float32BufferAttribute, MathUtils, Vector3 } from "three";

export type CylinderNetTransforms = {
  topCapPosition: Vector3;
  bottomCapPosition: Vector3;
  topCapRotationX: number;
  bottomCapRotationX: number;
};

export class CylinderUnfolder {
  readonly radius: number;
  readonly height: number;
  readonly radialSegments: number;
  readonly heightSegments: number;

  constructor(
    radius = 1,
    height = 2,
    radialSegments = 48,
    heightSegments = 10,
  ) {
    this.radius = radius;
    this.height = height;
    this.radialSegments = radialSegments;
    this.heightSegments = heightSegments;
  }

  createSideGeometry(progress: number): BufferGeometry {
    const clamped = MathUtils.clamp(progress, 0, 1);
    const width = 2 * Math.PI * this.radius;

    const vertexCount = (this.radialSegments + 1) * (this.heightSegments + 1);
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const indices: number[] = [];

    let pi = 0;
    let ni = 0;
    let ui = 0;

    for (let y = 0; y <= this.heightSegments; y += 1) {
      const v = y / this.heightSegments;
      const yy = (v - 0.5) * this.height;

      for (let x = 0; x <= this.radialSegments; x += 1) {
        const u = x / this.radialSegments;
        const theta = u * Math.PI * 2;

        // Dang dong: mat cong cua tru
        const cx = Math.cos(theta) * this.radius;
        const cz = Math.sin(theta) * this.radius;
        const cy = yy;

        // Dang mo: trai phang thanh hinh chu nhat nam tren mat phang y=0
        const fx = (u - 0.5) * width;
        const fz = yy;
        const fy = 0;

        const px = MathUtils.lerp(cx, fx, clamped);
        const py = MathUtils.lerp(cy, fy, clamped);
        const pz = MathUtils.lerp(cz, fz, clamped);

        positions[pi] = px;
        positions[pi + 1] = py;
        positions[pi + 2] = pz;
        pi += 3;

        // Normal xap xi: noi suy giua normal tru va normal phang huong len
        const nx = MathUtils.lerp(Math.cos(theta), 0, clamped);
        const ny = MathUtils.lerp(0, 1, clamped);
        const nz = MathUtils.lerp(Math.sin(theta), 0, clamped);
        const nl = Math.hypot(nx, ny, nz) || 1;

        normals[ni] = nx / nl;
        normals[ni + 1] = ny / nl;
        normals[ni + 2] = nz / nl;
        ni += 3;

        uvs[ui] = u;
        uvs[ui + 1] = v;
        ui += 2;
      }
    }

    for (let y = 0; y < this.heightSegments; y += 1) {
      for (let x = 0; x < this.radialSegments; x += 1) {
        const a = y * (this.radialSegments + 1) + x;
        const b = a + 1;
        const c = a + (this.radialSegments + 1);
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();

    return geometry;
  }

  // Transform cua 2 nap tron theo progress 0..1
  // - progress=0: dung o vi tri dong kin
  // - progress=1: lat ra 90 do va dat xuong mat phang
  getCapTransforms(progress: number): CylinderNetTransforms {
    const t = MathUtils.clamp(progress, 0, 1);

    const closedTop = new Vector3(0, this.height / 2, 0);
    const closedBottom = new Vector3(0, -this.height / 2, 0);

    const openedTop = new Vector3(0, 0.02, this.height / 2 + this.radius * 1.1);
    const openedBottom = new Vector3(0, 0.02, -this.height / 2 - this.radius * 1.1);

    return {
      topCapPosition: closedTop.lerp(openedTop, t),
      bottomCapPosition: closedBottom.lerp(openedBottom, t),
      topCapRotationX: -Math.PI * 0.5 * t,
      bottomCapRotationX: Math.PI * 0.5 * t,
    };
  }
}
