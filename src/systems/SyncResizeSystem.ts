import { Rectangle } from 'pixi.js'
import type { Engine } from '#types'

function syncEngineBounds(engine: Engine) {
  engine.spawnArea.hitArea = new Rectangle(0, 0, engine.app.screen.width, engine.app.screen.height)
}

export function initResizeSystem(engine: Engine) {
  const onResize = () => {
    syncEngineBounds(engine)
  }

  window.addEventListener('resize', onResize)

  return () => {
    window.removeEventListener('resize', onResize)
  }
}
