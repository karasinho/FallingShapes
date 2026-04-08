import {
  Application,
  Graphics,
  Container,
  Sprite,
  FederatedPointerEvent,
  RenderTexture,
  type Renderer,
  Assets,
} from 'pixi.js'

import { gsap } from 'gsap'
import { GlowFilter } from 'pixi-filters'

import tyan_img from '#root/assets//tyan.png'
import { DrawPolygonOptions, Engine, EngineDraft, ShapeKind } from '#types'
import { DEFAULTS } from '#root/engine/defaults'

export class ShapeFactory {
  private engine: EngineDraft
  constructor(engine: EngineDraft) {
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
  getTextureFromGraphics(g: Graphics) {
    const glowDistance = DEFAULTS.glow_distance
    const glowPadding = glowDistance * 2
    g.filters = [new GlowFilter({ distance: glowDistance, outerStrength: 2, color: 'white' })]

    const bounds = g.getLocalBounds()

    const texture = RenderTexture.create({
      width: Math.ceil(bounds.width + glowPadding * 2),
      height: Math.ceil(bounds.height + glowPadding * 2),
    })
    const temp = new Container()
    g.x = -bounds.x + glowPadding
    g.y = -bounds.y + glowPadding
    temp.addChild(g)

    this.engine.app.renderer.render({
      container: temp,
      target: texture,
      clear: true,
    })
    texture.__base_area = g.__base_area || 0
    g.destroy()
    return texture
  }
  async create(kind: ShapeKind): Promise<Sprite> {
    const g = new Graphics()
    g.kind = kind

    let texture

    switch (kind) {
      case 'triangle':
        this.drawPolygon({ g, sides: 3 })
        texture = this.getTextureFromGraphics(g)
        break
      case 'quad':
        this.drawPolygon({ g, sides: 4 })
        texture = this.getTextureFromGraphics(g)
        break
      case 'pentagon':
        this.drawPolygon({ g, sides: 5 })
        texture = this.getTextureFromGraphics(g)
        break
      case 'hexagon':
        this.drawPolygon({ g, sides: 6 })
        texture = this.getTextureFromGraphics(g)
        break
      case 'circle':
        const rad = this.engine.settings.circle_radius
        g.circle(0, 0, rad).fill(this.engine.currentColors.circle)
        g.__base_area = Math.PI * rad * rad
        texture = this.getTextureFromGraphics(g)
        break
      case 'ellipse':
        const elips_rad = this.engine.settings.circle_radius
        g.ellipse(0, 0, elips_rad, elips_rad / 1.5).fill(this.engine.currentColors.ellipse)
        g.__base_area = (Math.PI * elips_rad * elips_rad) / 1.5
        texture = this.getTextureFromGraphics(g)
        break
      case 'blob':
        this.drawBlob(g)
        texture = this.getTextureFromGraphics(g)
        break
      case 'tyan':
        texture = await Assets.load(tyan_img)
        break
    }
    g?.destroy?.()

    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5)
    sprite.__base_area = texture.__base_area
    sprite.kind = kind
    sprite.label = self.crypto.randomUUID()
    sprite.eventMode = 'static'
    sprite.cursor = 'pointer'
    sprite.visible = false

    sprite.on('pointertap', (e: FederatedPointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!sprite.kind) {
        return
      }
      if (sprite.__isRemoving) {
        return
      }

      const newColor = sprite.kind === 'tyan' ? 0xffffff : ShapeFactory.getRandomColor()
      this.engine.currentColors[sprite.kind] = newColor
      sprite.__isRemoving = true
      this.recolorAll(kind, newColor)
      sprite.eventMode = 'none'
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
  private engine: EngineDraft
  private factory: ShapeFactory
  private app: Application<Renderer>
  private active_shapes: EngineDraft['active_shapes']
  private pool: Engine['pool']

  constructor(engine: EngineDraft) {
    this.engine = engine
    this.app = engine.app
    this.active_shapes = engine.active_shapes
    this.factory = new ShapeFactory(engine)
    this.pool = this as ShapePool

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

    if (!sprite || !sprite.kind) {
      return
    }
    gsap.killTweensOf(sprite)
    gsap.killTweensOf(sprite.scale)
    sprite.tint = sprite.kind === 'tyan' ? 0xffffff : (ShapeFactory.getRandomColor() ?? '0xffffff')
    sprite.visible = true
    sprite.eventMode = 'static'
    sprite.rotation = Math.random() * Math.PI * 2

    const random_scale = randFloat(0.5, 1.2)
    sprite.scale.set(random_scale)
    sprite.removeFromParent()
    this.engine?.spawnArea.addChild(sprite)
    sprite.position.set(x, y)

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
    shape.visible = false
    shape.scale.set(1)
    shape.rotation = 0
    shape.alpha = 1
    shape.removeFromParent()
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

  destroy() {
    for (const kind in this.pools) {
      const pool = this.pools[kind as ShapeKind]

      for (const sprite of pool) {
        gsap.killTweensOf(sprite)
        gsap.killTweensOf(sprite.scale)

        sprite.removeAllListeners()

        sprite.parent?.removeChild(sprite)

        sprite.destroy({
          children: true,
          texture: false,
          textureSource: false,
        })
      }

      pool.length = 0
    }
  }
}
