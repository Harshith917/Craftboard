import { describe, expect, it } from "vitest";
import { getInitials, getUserColor, formatLastActive } from "@/lib/presence";
import {
  generateId,
  getShapeLabel,
  calculateShapeCenter,
} from "@/lib/canvasUtils";
import type { ShapeType } from "@/types/CanvasTypes";

describe("presence", () => {
  it("getInitials extracts two initials", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("getInitials handles a single name", () => {
    expect(getInitials("Prince")).toBe("P");
  });

  it("getInitials handles empty input", () => {
    expect(getInitials("")).toBe("");
  });

  it("getUserColor is stable for the same id", () => {
    expect(getUserColor("user_abc")).toBe(getUserColor("user_abc"));
  });

  it("formatLastActive labels recent activity", () => {
    expect(formatLastActive(Date.now())).toBe("Just now");
  });
});

describe("canvasUtils", () => {
  it("generateId is unique and prefixed", () => {
    const a = generateId();
    const b = generateId();
    expect(a.startsWith("node_")).toBe(true);
    expect(a).not.toBe(b);
  });

  it("getShapeLabel maps types to labels", () => {
    expect(getShapeLabel("roundedRect" as ShapeType)).toBe("Rounded Rectangle");
    expect(getShapeLabel("stickyNote" as ShapeType)).toBe("Sticky Note");
  });

  it("calculateShapeCenter offsets to top-left", () => {
    const center = calculateShapeCenter(
      { x: 0, y: 0 },
      { width: 800, height: 600 },
      1,
    );
    expect(center.x).toBe(340);
    expect(center.y).toBe(260);
  });
});
