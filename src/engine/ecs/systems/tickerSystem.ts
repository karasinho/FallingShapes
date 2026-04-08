import type { Ticker } from 'pixi.js'
import type { World } from '#types'
import { spawnSystem } from './spawnSystem'
import { gravitySystem } from './gravitySystem'
import { movementSystem } from './movementSystem'
import { renderSyncSystem } from './renderSyncSystem'
import { recycleSystem } from './recycleSystem'
import { statsSystem } from './statsSystem'

export function initTickerSystem(world: World) {
  const tick = async (ticker: Ticker) => {
    const dt = ticker.deltaMS / 1000

    await spawnSystem(world, ticker.deltaMS)
    gravitySystem(world, dt)
    movementSystem(world, dt)
    renderSyncSystem(world)
    recycleSystem(world)
    statsSystem(world)
  }

  world.resources.app.ticker.add(tick)

  return () => {
    world.resources.app.ticker.remove(tick)
  }
}
