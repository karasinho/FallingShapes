import type { Engine } from '#types'
import { initEngine } from './InitEngine'

let cachedEngine: Engine | null = null
let pendingEngine: Promise<Engine> | null = null

export async function getOrCreateEngine(canvas_wr: HTMLDivElement): Promise<Engine> {
  if (cachedEngine) {
    if (cachedEngine.app.canvas.parentElement !== canvas_wr) {
      canvas_wr.replaceChildren(cachedEngine.app.canvas)
    }
    return cachedEngine
  }

  if (pendingEngine) {
    const engine = await pendingEngine

    if (engine.app.canvas.parentElement !== canvas_wr) {
      canvas_wr.replaceChildren(engine.app.canvas)
    }

    return engine
  }

  pendingEngine = initEngine(canvas_wr)

  try {
    const engine = await pendingEngine
    cachedEngine = engine
    return engine
  } finally {
    pendingEngine = null
  }
}

export function getCachedEngine(): Engine | null {
  return cachedEngine
}

export function destroyCachedEngine() {
  if (!cachedEngine) return
  cachedEngine.destroyApp?.()
  cachedEngine = null
  pendingEngine = null
}
