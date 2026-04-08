import { Application, Container, Rectangle, FederatedPointerEvent } from 'pixi.js'
import { getDefaultSettings } from '#root/engine/defaults'
import SoundService from '#root/services/SoudSevrice'
import type { World } from '#types'
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

  app.renderer.events.autoPreventDefault = true
  app.canvas.style.touchAction = 'none'

  const spawnArea = new Container()
  spawnArea.eventMode = 'static'
  spawnArea.hitArea = new Rectangle(0, 0, app.screen.width, app.screen.height)

  const world: World = {
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
        triangle: Math.floor(Math.random() * 0xffffff),
        quad: Math.floor(Math.random() * 0xffffff),
        pentagon: Math.floor(Math.random() * 0xffffff),
        hexagon: Math.floor(Math.random() * 0xffffff),
        circle: Math.floor(Math.random() * 0xffffff),
        ellipse: Math.floor(Math.random() * 0xffffff),
        blob: Math.floor(Math.random() * 0xffffff),
        tyan: Math.floor(Math.random() * 0xffffff),
      },
    },
  }

  const pool = new ShapePool(world)
  await pool.warmupAll()
  ;(world.resources as typeof world.resources & { pool: ShapePool }).pool = pool

  spawnArea.on('pointertap', async (e: FederatedPointerEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const pos = e.getLocalPosition(spawnArea)
    await createShapeEntity(world, pos.x, pos.y, true)
    world.resources.sounds.playSpawn()
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
