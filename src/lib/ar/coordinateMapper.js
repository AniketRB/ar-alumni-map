/**
 * Converts normalized alumni coordinates (0–1) to MindAR/Three.js world space.
 *
 * MindAR anchors the tracked image so its center is (0,0,0) and width = 1 unit.
 * For a standard world map with 2:1 aspect ratio, height = 0.5 units.
 *
 * Change MAP_ASPECT_RATIO to match your printed map's actual aspect.
 */

const MAP_ASPECT_RATIO = 2.0   // width / height  (world map ≈ 2:1)
const MAP_WIDTH        = 1.0   // MindAR default
const MAP_HEIGHT       = MAP_WIDTH / MAP_ASPECT_RATIO

export function normalizedToWorld(nx, ny) {
  return {
    x: (nx - 0.5) * MAP_WIDTH,
    y: (0.5 - ny) * MAP_HEIGHT,
    z: 0.02,
  }
}

export function worldToNormalized(x, y) {
  return {
    nx: x / MAP_WIDTH  + 0.5,
    ny: 0.5 - y / MAP_HEIGHT,
  }
}

/**
 * Spread overlapping markers in a cluster so none stack perfectly.
 * index  = this alumni's index within the city group
 * total  = total alumni in this city
 */
export function clusterOffset(index, total, radius = 0.025) {
  if (total === 1) return { dx: 0, dy: 0 }
  const angle = (index / total) * 2 * Math.PI
  const r     = radius * Math.sqrt((index + 1) / total)
  return { dx: r * Math.cos(angle), dy: r * Math.sin(angle) }
}
