/**
 * Converts normalized alumni coordinates (0–1) to MindAR/Three.js world space.
 *
 * MindAR anchors the tracked image so its center is (0,0,0) and width = 1 unit.
 * For a standard world map with 2:1 aspect ratio, height = 0.5 units.
 */

const MAP_ASPECT_RATIO = 2.0
const MAP_WIDTH        = 1.0
const MAP_HEIGHT       = MAP_WIDTH / MAP_ASPECT_RATIO

export function normalizedToWorld(nx, ny) {
  return {
    x:  (nx - 0.5) * MAP_WIDTH,
    y:  (0.5 - ny) * MAP_HEIGHT,
    z:  0.0,   // base z — markers will sit exactly on the map surface
  }
}

export function worldToNormalized(x, y) {
  return {
    nx: x / MAP_WIDTH  + 0.5,
    ny: 0.5 - y / MAP_HEIGHT,
  }
}

/**
 * Spread overlapping markers in a tight spiral so they don't stack.
 * Keeps them very close together for small regions like Indian cities.
 */
export function clusterOffset(index, total, radius = 0.018) {
  if (total === 1) return { dx: 0, dy: 0 }
  // golden angle spiral — distributes evenly without linear rows
  const goldenAngle = 2.399963  // radians (137.5°)
  const r = radius * Math.sqrt(index + 1)
  const angle = index * goldenAngle
  return { dx: r * Math.cos(angle), dy: r * Math.sin(angle) }
}