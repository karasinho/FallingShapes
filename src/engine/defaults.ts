import { PixiSettings } from '#types'
export const DEFAULTS = {
  gravity: 100,
  creation_limit: 1,
  pool_size: 50,
  circle_radius: 30,
  sound_volume: 0.45,
  glow_distance: 12,
}

export function getDefaultSettings() {
  return {
    ...DEFAULTS,
  } satisfies PixiSettings
}
