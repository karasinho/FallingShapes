import { Application, Rectangle, Container, FederatedPointerEvent } from 'pixi.js'

import { Engine, EngineDraft } from '#types'
import { ShapeFactory, ShapePool } from '../systems/PoolSystem'
import { Utils } from '../services/StatsService'
import SoundService from '../services/SoudSevrice'
import { initTicker } from '#root/systems/TickerSystem'
import { getDefaultSettings } from './defaults'
import { initDestroyFunc } from './DestroyEngine'
import { initResizeSystem } from '#root/systems/SyncResizeSystem'

export async function initEngine(canvas_wr: HTMLDivElement) {
  const app = new Application()

  const engine: EngineDraft = {
    app,
    spawnArea: new Container(),
    sounds: new SoundService(),
    active_shapes: [],
    settings: getDefaultSettings(),
    currentColors: {
      triangle: ShapeFactory.getRandomColor(),
      quad: ShapeFactory.getRandomColor(),
      pentagon: ShapeFactory.getRandomColor(),
      hexagon: ShapeFactory.getRandomColor(),
      circle: ShapeFactory.getRandomColor(),
      ellipse: ShapeFactory.getRandomColor(),
      blob: ShapeFactory.getRandomColor(),
      tyan: ShapeFactory.getRandomColor(),
    },
  }

  await app.init({
    resizeTo: canvas_wr,
    backgroundAlpha: 0,
  })

  app.renderer.events.autoPreventDefault = true
  app.canvas.style.touchAction = 'none'

  engine.pool = new ShapePool(engine)
  engine.utils = new Utils(engine)

  assertEngineReady(engine)

  const destroyers: Function[] = []

  const destroyResizeSystem = initResizeSystem(engine)
  const destroyTicker = initTicker(engine)
  destroyers.push(destroyResizeSystem)
  destroyers.push(destroyTicker)

  engine.destroyApp = initDestroyFunc(engine, destroyers)

  canvas_wr.appendChild(app.canvas)

  const spawnArea = engine.spawnArea

  spawnArea.eventMode = 'static'
  spawnArea.hitArea = new Rectangle(0, 0, app.screen.width, app.screen.height)

  spawnArea.on('pointertap', (e: FederatedPointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const pos = e.getLocalPosition(spawnArea)
    engine.pool.spawnShape(pos.x, pos.y, true)
    engine.sounds.playSpawn()
  })
  engine.app.stage.addChild(engine.spawnArea)

  return engine
}

export function assertEngineReady(engine: EngineDraft): asserts engine is Engine {
  if (!engine.app) throw new Error('Engine.app is not initialized')
  if (!engine.spawnArea) throw new Error('Engine.spawnArea is not initialized')
  if (!engine.pool) throw new Error('Engine.pool is not initialized')
  if (!engine.utils) throw new Error('Engine.utils is not initialized')
  if (!engine.sounds) throw new Error('Engine.sounds is not initialized')
  if (!engine.active_shapes) throw new Error('Engine.active_shapes is not initialized')
  if (!engine.settings) throw new Error('Engine.settings is not initialized')
  if (!engine.currentColors) throw new Error('Engine.currentColors is not initialized')
  ;(engine as Engine).__ready = true
}
