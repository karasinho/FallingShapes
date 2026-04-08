import { getOrCreateEngine, destroyCachedEngine } from './EngineInstance'

export async function initPixiApp(canvas_wr: HTMLDivElement) {
  const engine = await getOrCreateEngine(canvas_wr)

  return {
    updateSettings: engine.utils.updateSettings.bind(engine.utils),
    subscribeStats: engine.utils.subscribeStats.bind(engine.utils),
    destroyApp: destroyCachedEngine,
  }
}
