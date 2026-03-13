/**
 * Types for PixiJS Texture Atlas metadata.
 */
export interface AtlasFrame {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
}

export interface AtlasMetadata {
  frames: Record<string, AtlasFrame>;
  meta: {
    image: string;
    format: string;
    size: { w: number; h: number };
    scale: string;
  };
}

/**
 * Validates that an object is a valid AtlasMetadata structure.
 */
export function isAtlasMetadata(data: unknown): data is AtlasMetadata {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.frames === 'object' &&
    d.frames !== null &&
    typeof d.meta === 'object' &&
    d.meta !== null
  );
}

/**
 * Processes raw image bounds to generate PixiJS-compatible atlas metadata.
 * Handles edge cases like empty input arrays or missing dimensions.
 */
export function generateAtlasMetadata(
  filename: string,
  width: number,
  height: number,
  frames: { name: string; x: number; y: number; w: number; h: number }[]
): AtlasMetadata {
  if (width <= 0 || height <= 0) {
    throw new Error('Invalid texture dimensions');
  }

  const atlas: AtlasMetadata = {
    frames: {},
    meta: {
      image: filename,
      format: 'RGBA8888',
      size: { w: width, h: height },
      scale: '1',
    },
  };

  for (const frame of frames) {
    if (frame.w <= 0 || frame.h <= 0) continue;

    atlas.frames[frame.name] = {
      frame: { x: frame.x, y: frame.y, w: frame.w, h: frame.h },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: frame.w, h: frame.h },
      sourceSize: { w: frame.w, h: frame.h },
    };
  }

  return atlas;
}