import { describe, expect, it } from "vitest";
import {
  computeGeo,
  makeStars,
  mod,
  nearestEquivalentAngle,
  nightness,
} from "./wheel";

describe("mod", () => {
  it("stays positive for negative input, unlike %", () => {
    expect(mod(-1, 7)).toBe(6);
    expect(mod(-8, 7)).toBe(6);
    expect(mod(9, 7)).toBe(2);
  });
});

describe("computeGeo", () => {
  it("puts the focal point of the ring in the upper-left of the viewport", () => {
    const geo = computeGeo(1280, 800);
    const rad = (geo.focalDeg * Math.PI) / 180;
    expect(geo.cx + Math.cos(rad) * geo.radius).toBeCloseTo(1280 * 0.27);
    expect(geo.cy + Math.sin(rad) * geo.radius).toBeCloseTo(800 * 0.44);
  });

  it("clamps the viewport scale so the wheel never collapses or overflows", () => {
    expect(computeGeo(320, 480).vs).toBe(0.5);
    expect(computeGeo(4000, 4000).vs).toBe(1.1);
  });
});

describe("nearestEquivalentAngle", () => {
  it("returns the base angle when already close", () => {
    expect(nearestEquivalentAngle(10, 0)).toBe(0);
  });

  it("keeps accumulated turns instead of unwinding them", () => {
    // Five turns of scrolling, then a click on the category at 0°: the wheel
    // should settle at 1800°, not spin all the way back to 0°.
    expect(nearestEquivalentAngle(1790, 0)).toBe(1800);
    expect(nearestEquivalentAngle(-1790, 0)).toBe(-1800);
  });

  it("never moves more than half a turn", () => {
    for (const current of [-1234, -57, 0, 91, 359, 723]) {
      for (const base of [0, -60, -120, -300]) {
        const target = nearestEquivalentAngle(current, base);
        expect(Math.abs(target - current)).toBeLessThanOrEqual(180);
        expect(mod(target - base, 360)).toBeCloseTo(0);
      }
    }
  });
});

describe("nightness", () => {
  const count = 6;
  const step = 360 / count;

  it("is full day at the sun and full night half a turn away", () => {
    expect(nightness(0, step, count)).toBeCloseTo(0);
    expect(nightness(-step * (count / 2), step, count)).toBeCloseTo(1);
  });

  it("is periodic, so the sky matches after a full revolution", () => {
    expect(nightness(-step * 1.5, step, count)).toBeCloseTo(
      nightness(-step * 1.5 - 360, step, count),
    );
  });

  it("stays in range for any rotation", () => {
    for (let r = -720; r <= 720; r += 7) {
      const n = nightness(r, step, count);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(1);
    }
  });
});

describe("makeStars", () => {
  const geo = computeGeo(1280, 800);

  it("is deterministic, so server and client render the same sky", () => {
    expect(makeStars(geo)).toEqual(makeStars(geo));
  });

  it("covers the far corner of the viewport from the wheel center", () => {
    const reach = Math.max(
      ...makeStars(geo).map((s) => Math.hypot(s.x - geo.cx, s.y - geo.cy)),
    );
    expect(reach).toBeGreaterThan(Math.hypot(geo.cx, geo.cy) * 0.9);
  });
});
