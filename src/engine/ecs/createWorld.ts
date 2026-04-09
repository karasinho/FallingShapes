import { Application, Container, Rectangle, FederatedPointerEvent } from 'pixi.js'
import { getDefaultSettings } from '#root/engine/defaults'
import SoundService from '#root/services/SoundSevrice'
import type { World, WorldBase } from '#types'
import { createShapeEntity } from './factories/createShapeEntity'
import { ShapePool } from './pools/ShapePool'
import { initResizeSystem } from './systems/resizeSystem'
import { initTickerSystem } from './systems/tickerSystem'

export async function createWorld(canvas_wr: HTMLDivElement) {
  const app = new Application()
  await app.init({
    resizeTo: canvas_wr,
    backgroundAlpha: 0,
  })

  app.canvas.style.touchAction = 'manipulation'

  const spawnArea = new Container()
  spawnArea.eventMode = 'static'
  spawnArea.hitArea = new Rectangle(0, 0, app.screen.width, app.screen.height)

  const world: WorldBase = {
    nextEntityId: 1,
    entities: new Set(),

    transforms: new Map(),
    velocities: new Map(),
    gravities: new Map(),
    shapes: new Map(),
    renderables: new Map(),
    clickables: new Set(),
    removing: new Set(),

    resources: {
      app,
      spawnArea,
      settings: getDefaultSettings(),
      sounds: new SoundService(),
      spawnAccumulator: 0,
      currentColors: {
        triangle: getDefaultColor(),
        quad: getDefaultColor(),
        pentagon: getDefaultColor(),
        hexagon: getDefaultColor(),
        circle: getDefaultColor(),
        ellipse: getDefaultColor(),
        blob: getDefaultColor(),
        tyan: getDefaultColor(),
      },
    },
  }

  world.resources.pool = new ShapePool(world)

  await world.resources.pool.warmupAll()
  assertWorldReady(world)

  spawnArea.on('pointertap', async (e: FederatedPointerEvent) => {
    const pos = e.getLocalPosition(spawnArea)
    await createShapeEntity(world, pos.x, pos.y, true)
    world.resources.sounds.playSound('spawn')
  })

  app.stage.addChild(spawnArea)
  canvas_wr.appendChild(app.canvas)

  const destroyResize = initResizeSystem(world)
  const destroyTicker = initTickerSystem(world)

  return {
    world,
    destroy: () => {
      destroyTicker()
      destroyResize()
    },
  }
}
function getDefaultColor() {
  return Math.floor(Math.random() * 0xffffff)
}

export function assertWorldReady(world: WorldBase): asserts world is World {
  if (!world.resources.app) {
    throw new Error('World.resources.app is not initialized')
  }

  if (!world.resources.spawnArea) {
    throw new Error('World.resources.spawnArea is not initialized')
  }

  if (!world.resources.settings) {
    throw new Error('World.resources.settings is not initialized')
  }

  if (!world.resources.sounds) {
    throw new Error('World.resources.sounds is not initialized')
  }

  if (!world.resources.currentColors) {
    throw new Error('World.resources.currentColors is not initialized')
  }

  if (!('pool' in world.resources) || !world.resources.pool) {
    throw new Error('World.resources.pool is not initialized')
  }

  ;(world as World).__ready = true
}
