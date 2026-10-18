type Point = { x: number; y: number };

/** Map viewport input into a unit square, including CSS rotation and perspective.
 * An axis-aligned bounding rectangle cannot locate points on a transformed plane.
 * Corner order: top left, top right, bottom right, bottom left.
 */
export function pointerInQuad(point: Point, corners: readonly Point[]) {
  if (corners.length !== 4) return null;
  const [p0, p1, p2, p3] = corners;
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y;
  const dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy3 = p0.y - p1.y + p2.y - p3.y;
  let g = 0, h = 0;
  if (Math.abs(dx3) + Math.abs(dy3) > 1e-7) {
    const determinant = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(determinant) < 1e-7) return null;
    g = (dx3 * dy2 - dx2 * dy3) / determinant;
    h = (dx1 * dy3 - dx3 * dy1) / determinant;
  }
  const a = p1.x - p0.x + g * p1.x - g * point.x;
  const b = p3.x - p0.x + h * p3.x - h * point.x;
  const d = p1.y - p0.y + g * p1.y - g * point.y;
  const e = p3.y - p0.y + h * p3.y - h * point.y;
  const determinant = a * e - b * d;
  if (Math.abs(determinant) < 1e-7) return null;
  const x = point.x - p0.x, y = point.y - p0.y;
  return { x: (x * e - b * y) / determinant, y: (a * y - x * d) / determinant };
}
