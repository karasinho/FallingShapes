import { getOrCreateWorld, destroyCachedWorld } from './EngineInstance'

export async function initPixiApp(canvas_wr: HTMLDivElement) {
  const world = await getOrCreateWorld(canvas_wr)

  return {
    updateSettings(patch: Partial<{ gravity: number; creation_limit: number }>) {
      world.resources.settings = { ...world.resources.settings, ...patch }

      for (const [, gravity] of world.gravities) {
        gravity.value = world.resources.settings.gravity
      }
    },

    subscribeStats(cb: (stats: any) => void) {
      world.resources.statsListener = cb
      return () => {
        if (world.resources.statsListener === cb) {
          world.resources.statsListener = undefined
        }
      }
    },

    destroyApp: destroyCachedWorld,
  }
}
