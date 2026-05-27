/**
 * Converts normalized (0–1) Mercator coordinates to MindAR world space.
 *
 * MindAR anchors the tracked image so:
 *   - center of image = (0, 0, 0)
 *   - image width = 1.0 unit
 *   - image height = 1.0 / aspect_ratio units
 *
 * For Web Mercator maps, the visible lat range is ±85.051°.
 * Most standard flat world map images have ~2:1 aspect ratio (width:height).
 * We use 1.0 width and 0.5 height which matches a 2:1 equirectangular-framed image.
 * Mercator maps visually appear similar but with latitude stretching near poles.
 */

const MAP_WIDTH  = 1.0
const MAP_HEIGHT = 0.5   // assumes 2:1 image aspect ratio

export function normalizedToWorld(nx, ny) {
  return {
    x:  (nx - 0.5) * MAP_WIDTH,
    y:  (0.5 - ny) * MAP_HEIGHT,
    z:  0.0,
  }
}

export function worldToNormalized(x, y) {
  return {
    nx: x / MAP_WIDTH  + 0.5,
    ny: 0.5 - y / MAP_HEIGHT,
  }
}

/**
 * Golden angle spiral offset so overlapping city markers spread out.
 */
export function clusterOffset(index, total, radius = 0.018) {
  if (total === 1) return { dx: 0, dy: 0 }
  const goldenAngle = 2.399963
  const r     = radius * Math.sqrt(index + 1)
  const angle = index * goldenAngle
  return { dx: r * Math.cos(angle), dy: r * Math.sin(angle) }
}