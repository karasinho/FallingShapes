import { Rectangle, Ticker } from 'pixi.js'

import { Engine } from '#types'

export function initTicker(engine: Engine) {
  let spawnAcc = 0
  const spawnWindowMs = 1000

  const tick = (ticker: Ticker) => {
    const dt = ticker.deltaMS / 1000
    spawnAcc += ticker.deltaMS

    const creationLimit = Math.max(1, engine.settings.creation_limit)
    const spawnInterval = spawnWindowMs / creationLimit

    while (spawnAcc >= spawnInterval) {
      spawnAcc -= spawnInterval

      const area = engine.spawnArea.hitArea as Rectangle
      const x = area.x + 100 + Math.random() * (area.width - 150)
      const y = -70

      engine.pool.spawnShape(x, y)
    }

    for (let i = engine.active_shapes.length - 1; i >= 0; i--) {
      const shape = engine.active_shapes[i]

      shape.y += engine.settings.gravity * dt

      if (shape.y > engine.app.screen.height + 100) {
        engine.pool.release(shape)
      }
    }

    engine.utils.emitStats()
  }

  engine.app.ticker.add(tick)
  return () => {
    engine.app.ticker.remove(tick)
  }
}
