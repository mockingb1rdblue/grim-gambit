/**
 * Utility to calculate padding/trimming for Imagen 3 outputs.
 * Ensures input validation and safe handling of nullish values.
 */
export function calculateTrim(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number = 255
): { x: number; y: number; w: number; h: number } {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) {
    return { x: 0, y: 0, w: 0, h: 0 };
  }

  return {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
  };
}