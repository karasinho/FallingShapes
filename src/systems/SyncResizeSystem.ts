import { Rectangle } from 'pixi.js'
import type { Engine } from '#types'

function syncEngineBounds(engine: Engine) {
  engine.spawnArea.hitArea = new Rectangle(0, 0, engine.app.screen.width, engine.app.screen.height)
}

export function initResizeSystem(engine: Engine) {
  let timeoutId: number | null = null

  const sync = () => {
    requestAnimationFrame(() => {
      syncEngineBounds(engine)
    })

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      syncEngineBounds(engine)
    }, 250)
  }

  window.addEventListener('resize', sync)
  window.addEventListener('orientationchange', sync)

  return () => {
    window.removeEventListener('resize', sync)
    window.removeEventListener('orientationchange', sync)

    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}
