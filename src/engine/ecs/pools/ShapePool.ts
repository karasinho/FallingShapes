import { gsap } from 'gsap'
import type { ShapeKind, World, Entity } from '#types'
import { createShapeSprite } from '../factories/createShapeSprite'
import { destroyEntity } from '../entity'
import { Sprite } from 'pixi.js'

type PooledShape = {
  sprite: Sprite
  baseArea: number
  kind: ShapeKind
}

export class ShapePool {
  private world: World

  private pools: Record<ShapeKind, PooledShape[]> = {
    triangle: [],
    quad: [],
    pentagon: [],
    hexagon: [],
    circle: [],
    ellipse: [],
    blob: [],
    tyan: [],
  }

  constructor(world: World) {
    this.world = world
  }

  async warmup(kind: ShapeKind, count: number) {
    for (let i = 0; i < count; i++) {
      const created = await createShapeSprite(this.world, kind)
      this.pools[kind].push({
        sprite: created.sprite,
        baseArea: created.baseArea,
        kind,
      })
    }
  }

  async warmupAll() {
    const count = this.world.resources.settings.pool_size
    const kinds = Object.keys(this.pools) as ShapeKind[]

    for (const kind of kinds) {
      await this.warmup(kind, count)
    }
  }

  async get(kind: ShapeKind): Promise<PooledShape> {
    const existing = this.pools[kind].pop()
    if (existing) return existing

    const created = await createShapeSprite(this.world, kind)
    return {
      sprite: created.sprite,
      baseArea: created.baseArea,
      kind,
    }
  }

  release(entity: Entity) {
    const renderable = this.world.renderables.get(entity)
    const shape = this.world.shapes.get(entity)
    if (!renderable || !shape) return

    const sprite = renderable.sprite

    gsap.killTweensOf(sprite)
    gsap.killTweensOf(sprite.scale)

    sprite.removeAllListeners()
    sprite.visible = false
    sprite.scale.set(1)
    sprite.rotation = 0
    sprite.alpha = 1
    sprite.eventMode = 'none'
    sprite.removeFromParent()

    this.pools[shape.kind].push({
      sprite,
      baseArea: shape.baseArea,
      kind: shape.kind,
    })

    destroyEntity(this.world, entity)
  }

  destroy() {
    for (const kind of Object.keys(this.pools) as ShapeKind[]) {
      for (const item of this.pools[kind]) {
        const sprite = item.sprite
        gsap.killTweensOf(sprite)
        gsap.killTweensOf(sprite.scale)
        sprite.removeAllListeners()
        sprite.removeFromParent()
        sprite.destroy({
          children: true,
          texture: false,
          textureSource: false,
        })
      }
      this.pools[kind].length = 0
    }
  }
}
