import {
  Application,
  Graphics,
  Rectangle,
  Container,
  Sprite,
  FederatedPointerEvent,
  RenderTexture,
  type Renderer,
  Assets,
} from 'pixi.js'

import { gsap } from 'gsap'
import { GlowFilter } from 'pixi-filters'

import spawnSfx from './assets/sounds/spawn.mp3'
import popSfx from './assets/sounds/pop.mp3'
import tyan from './assets/sounds/tyan.mp3'
import tyan_img from './assets//tyan.png'
import { sound } from '@pixi/sound'
import { DrawPolygonOptions, Engine, PixiSettings, PixiStats, ShapeKind } from '#types'

export async function initPixiApp(canvas_wr: HTMLDivElement) {
  const engine = await initEngine(canvas_wr)
  initTicker(engine)

  return {
    updateSettings: engine.utils.updateSettings.bind(engine.utils),
    subscribeStats: engine.utils.subscribeStats.bind(engine.utils),
  }
}

export class ShapeFactory {
  private engine: Engine
  constructor(engine: Engine) {
    this.engine = engine
  }
  recolorAll(kind: ShapeKind, color: number) {
    for (const shape of this.engine.active_shapes) {
      if (shape.kind === kind) {
        shape.tint = color
      }
    }
  }
  static getRandomColor(): number {
    return Math.floor(Math.random() * 0xffffff)
  }
  async create(kind: ShapeKind): Promise<Sprite> {
    const g = new Graphics()
    g.kind = kind
    switch (kind) {
      case 'triangle':
        this.drawPolygon({ g, sides: 3 })
        break
      case 'quad':
        this.drawPolygon({ g, sides: 4 })
        break
      case 'pentagon':
        this.drawPolygon({ g, sides: 5 })
        break
      case 'hexagon':
        this.drawPolygon({ g, sides: 6 })
        break
      case 'circle':
        const rad = this.engine.settings.circle_radius
        g.circle(0, 0, rad).fill(this.engine.currentColors.circle)
        g.__base_area = Math.PI * rad * rad
        break
      case 'ellipse':
        const elips_rad = this.engine.settings.circle_radius
        g.ellipse(0, 0, elips_rad, elips_rad / 1.5).fill(this.engine.currentColors.ellipse)
        g.__base_area = (Math.PI * elips_rad * elips_rad) / 1.5

        break
      case 'blob':
        this.drawBlob(g)
        break
      case 'tyan':
        break
    }
    const glowDistance = 12
    const glowPadding = glowDistance * 2
    g.filters = [new GlowFilter({ distance: glowDistance, outerStrength: 2, color: 'white' })]

    const bounds = g.getLocalBounds()
    let texture

    if (kind !== 'tyan') {
      texture = RenderTexture.create({
        width: Math.ceil(bounds.width + glowPadding * 2),
        height: Math.ceil(bounds.height + glowPadding * 2),
      })
    } else {
      texture = await Assets.load(tyan_img)
    }
    let __base_area = 1000
    if (kind !== 'tyan') {
      const temp = new Container()
      g.x = -bounds.x + glowPadding
      g.y = -bounds.y + glowPadding
      temp.addChild(g)

      this.engine.app.renderer.render({
        container: temp,
        target: texture,
        clear: true,
      })
      __base_area = g.__base_area || 0
      g.destroy()
    }

    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5)
    sprite.__base_area = __base_area
    sprite.kind = kind
    sprite.label = self.crypto.randomUUID()
    sprite.eventMode = 'static'
    sprite.cursor = 'pointer'
    sprite.visible = false

    sprite.on('pointertap', (e: FederatedPointerEvent) => {
      if (!sprite.kind) {
        return
      }
      if (sprite.__isRemoving) {
        return
      }
      e.stopPropagation()

      const newColor = sprite.kind === 'tyan' ? 0xffffff : ShapeFactory.getRandomColor()
      this.engine.currentColors[sprite.kind] = newColor
      sprite.__isRemoving = true
      this.recolorAll(kind, newColor)
      if (kind === 'tyan') {
        this.engine.sounds.playTyan()
      } else {
        this.engine.sounds.playSpawn()
      }
      gsap.to(sprite.scale, {
        x: 0,
        y: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          sprite.scale.set(1)
          sprite.__isRemoving = false
          this.engine.pool?.release(sprite)
        },
      })
    })

    return sprite
  }
  private drawBlob(g: Graphics) {
    const points: number[] = []
    const segments = 20
    const baseRadius = this.engine.settings.circle_radius

    for (let i = 0; i < segments; i++) {
      const angle = (Math.PI * 2 * i) / segments
      const radius = baseRadius + (Math.random() * 10 - 5)
      points.push(Math.cos(angle) * radius, Math.sin(angle) * radius)
    }
    g.__base_area = ShapeFactory.polygonArea(points)
    g.poly(points).fill(0xffffff)
  }

  private drawPolygon({
    g,
    sides,
    radius = this.engine.settings.circle_radius,
    fillColor = this.engine.currentColors[g.kind ?? 'triangle'],
    strokeColor = ShapeFactory.getRandomColor(),
    strokeWidth = 2,
  }: DrawPolygonOptions) {
    if (sides < 3) {
      throw new Error('Polygon must have at least 3 sides')
    }

    const points: number[] = []

    for (let i = 0; i < sides; i++) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / sides
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      points.push(x, y)
    }
    g.__base_area = ShapeFactory.polygonArea(points)

    g.poly(points)
    g.fill(fillColor)
    g.stroke({ color: strokeColor, width: strokeWidth })
  }

  static polygonArea(points: number[]): number {
    let area = 0

    for (let i = 0; i < points.length; i += 2) {
      const x1 = points[i]
      const y1 = points[i + 1]

      const j = (i + 2) % points.length
      const x2 = points[j]
      const y2 = points[j + 1]

      area += x1 * y2 - x2 * y1
    }

    return Math.abs(area) / 2
  }
}

export class ShapePool {
  private pools: Record<ShapeKind, Sprite[]> = {
    triangle: [],
    quad: [],
    pentagon: [],
    hexagon: [],
    circle: [],
    ellipse: [],
    blob: [],
    tyan: [],
  }
  private engine?: Engine
  private factory?: ShapeFactory
  private app?: Application<Renderer>
  private active_shapes?: Engine['active_shapes']
  private pool?: Engine['pool']

  init(engine: Engine) {
    this.app = engine.app
    this.active_shapes = engine.active_shapes
    this.factory = new ShapeFactory(engine)
    this.pool = engine.pool
    this.engine = engine

    for (let pool in this.pools) {
      const _pool = pool as ShapeKind
      this.warmup(_pool, this.engine.settings.pool_size)
    }
  }

  getRandomKind(): ShapeKind {
    const SHAPE_KINDS: ShapeKind[] = ['triangle', 'quad', 'pentagon', 'hexagon', 'circle', 'ellipse', 'blob', 'tyan']
    return SHAPE_KINDS[Math.floor(Math.random() * SHAPE_KINDS.length)]
  }

  async spawnShape(x: number, y: number, animate?: boolean) {
    const random_kind = this.getRandomKind()

    const sprite = await this.get?.(random_kind)

    if (!sprite || !sprite.kind || !this.engine) {
      return
    }
    gsap.killTweensOf(sprite)
    gsap.killTweensOf(sprite.scale)
    sprite.tint = sprite.kind === 'tyan' ? 0xffffff : (ShapeFactory.getRandomColor() ?? '0xffffff')
    sprite.visible = true

    sprite.rotation = Math.random() * Math.PI * 2

    const random_scale = randFloat(0.5, 1.2)
    sprite.scale.set(random_scale)
    sprite.removeFromParent()
    this.engine?.spawnArea.addChild(sprite)
    sprite.position.set(x, y)
    // sprite.x = x
    // sprite.y = y
    this.engine?.active_shapes.push(sprite)

    if (animate) {
      sprite.scale.set(0)
      sprite.alpha = 0

      gsap.to(sprite.scale, {
        x: random_scale,
        y: random_scale,
        duration: 0.2,
        ease: 'back.out(1.7)',
      })

      gsap.to(sprite, {
        alpha: 1,
        duration: 0.18,
        ease: 'power2.out',
      })
    }

    function randFloat(min: number, max: number) {
      return min + Math.random() * (max - min)
    }
  }

  async warmup(kind: ShapeKind, count: number) {
    if (!this.app) {
      return
    }
    for (let i = 0; i < count; i++) {
      const sprite = await this.factory?.create(kind)
      if (!sprite) {
        return
      }
      this.pools[kind].push(sprite)
    }
  }

  async get(kind: ShapeKind) {
    if (!this.app) {
      return
    }
    return this.pools[kind].pop() ?? (await this.factory?.create(kind))
  }

  release(shape: Sprite) {
    if (!this.pool || !this.active_shapes) {
      return
    }
    shape.visible = false
    shape.scale.set(1)
    shape.rotation = 0
    shape.alpha = 1
    shape.parent?.removeChild(shape)
    if (!shape.kind) {
      console.warn(`SHape was not added to pool`)
      return
    }
    const active_shape_idx = this.active_shapes.findIndex((sh) => sh.label === shape.label)
    if (active_shape_idx !== -1) {
      const active_shape_idx = this.active_shapes.findIndex((sh) => sh.label === shape.label)
      const active_shape = this.active_shapes.splice(active_shape_idx, 1)?.[0]
      if (active_shape.kind) {
        this.pool.pools[active_shape.kind].push(active_shape)
      }
    }
  }
}

export class Utils {
  private engine?: Engine
  private statsListener?: (stats: PixiStats) => void

  init(engine: Engine) {
    this.engine = engine
  }
  emitStats() {
    if (!this.engine) {
      return
    }
    const visible_shapes = this.getVisibleShapes()
    const area = this.calcActiveShapesArea(visible_shapes) || 0
    this.statsListener?.({
      activeShapesCount: this.engine.active_shapes.length,
      activeShapesAreaPx: +area.toFixed(0),
      gravity: this.engine.settings.gravity,
      creation_number: visible_shapes.length,
    })
  }

  isShapeVisible(shape: Sprite) {
    if (!this.engine) {
      return
    }
    const screenW = this.engine.app.screen.width
    const screenH = this.engine.app.screen.height

    const bounds = shape.getBounds()

    return !(bounds.x + bounds.width < 0 || bounds.x > screenW || bounds.y + bounds.height < 0 || bounds.y > screenH)
  }

  getVisibleShapes() {
    if (!this.engine) {
      return []
    }
    return this.engine.active_shapes.filter((spr) => {
      return this.isShapeVisible(spr)
    })
  }

  updateSettings(patch: Partial<PixiSettings>) {
    if (!this.engine) {
      return
    }
    this.engine.settings = { ...this.engine.settings, ...patch }
    this.emitStats()
  }

  subscribeStats(cb: (stats: PixiStats) => void) {
    this.statsListener = cb
    this.emitStats()

    return () => {
      if (this.statsListener === cb) {
        this.statsListener = undefined
      }
    }
  }

  calcActiveShapesArea(visible_shapes: Sprite[]) {
    if (!this.engine) {
      return
    }
    const res = visible_shapes.reduce((acc, shape) => {
      acc += shape.__base_area ?? 0 * shape.scale.x * shape.scale.y

      return acc
    }, 0)
    return res
  }
}

async function initEngine(canvas_wr: HTMLDivElement) {
  const app = new Application()

  const engine: Engine = {
    app,
    spawnArea: new Container(),
    pool: new ShapePool(),
    utils: new Utils(),
    sounds: createSoundApi(),
    active_shapes: [] as Sprite[],
    settings: {
      creation_limit: 1,
      gravity: 150,
      pool_size: 20,
      circle_radius: 20,
    },
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
  engine.pool.init(engine)
  engine.utils.init(engine)

  canvas_wr.appendChild(app.canvas)

  const spawnArea = engine.spawnArea

  spawnArea.eventMode = 'static'
  spawnArea.hitArea = new Rectangle(0, 0, app.canvas.width, app.canvas.height)

  spawnArea.on('pointertap', (e: FederatedPointerEvent) => {
    const pos = e.getLocalPosition(spawnArea)
    engine.pool.spawnShape(pos.x, pos.y, true)
    engine.sounds.playSpawn()
  })
  engine.app.stage.addChild(engine.spawnArea)

  return engine
}

export function createSoundApi() {
  if (!sound.exists('spawn')) {
    sound.add('spawn', spawnSfx)
  }

  if (!sound.exists('pop')) {
    sound.add('pop', popSfx)
  }
  if (!sound.exists('tyan')) {
    sound.add('tyan', tyan)
  }

  function playSpawn() {
    sound.play('spawn', {
      volume: 0.35,
    })
  }

  function playPop() {
    sound.play('pop', {
      volume: 0.45,
    })
  }
  function playTyan() {
    sound.play('tyan', {
      volume: 0.45,
    })
  }

  return {
    playSpawn,
    playPop,
    playTyan,
  }
}

function initTicker(engine: Engine) {
  let spawnAcc = 0
  const spawnWindowMs = 1000

  engine.app.ticker.add((ticker) => {
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
  })
}
