import { gsap } from 'gsap'
import { createEntity } from '../entity'
import type { ShapeKind, World } from '#types'
import { FederatedPointerEvent } from 'pixi.js'
import { ShapePool } from '../pools/ShapePool'

function randFloat(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function getRandomColor() {
  return Math.floor(Math.random() * 0xffffff)
}

function getRandomKind(): ShapeKind {
  const kinds: ShapeKind[] = ['triangle', 'quad', 'pentagon', 'hexagon', 'circle', 'ellipse', 'blob', 'tyan']
  return kinds[Math.floor(Math.random() * kinds.length)]
}

export async function createShapeEntity(world: World, x: number, y: number, animate = false) {
  const pool = (world.resources as typeof world.resources & { pool: ShapePool }).pool
  const kind = getRandomKind()
  const pooled = await pool.get(kind)

  const entity = createEntity(world)
  const rotation = Math.random() * Math.PI * 2
  const randomScale = randFloat(0.5, 1.2)

  pooled.sprite.visible = true
  pooled.sprite.eventMode = 'static'
  pooled.sprite.cursor = 'pointer'
  pooled.sprite.rotation = rotation
  pooled.sprite.position.set(x, y)
  pooled.sprite.alpha = animate ? 0 : 1
  pooled.sprite.scale.set(animate ? 0 : randomScale)

  pooled.sprite.removeFromParent()
  world.resources.spawnArea.addChild(pooled.sprite)

  world.transforms.set(entity, {
    x,
    y,
    rotation,
    scaleX: randomScale,
    scaleY: randomScale,
  })

  const init_vy = animate ? 0 : 100

  world.velocities.set(entity, { vx: 0, vy: init_vy })
  world.gravities.set(entity, { value: world.resources.settings.gravity })
  world.shapes.set(entity, {
    kind,
    baseArea: pooled.baseArea,
    color: kind === 'tyan' ? 0xffffff : getRandomColor(),
  })
  world.renderables.set(entity, { sprite: pooled.sprite })
  world.clickables.add(entity)

  pooled.sprite.tint = kind === 'tyan' ? 0xffffff : world.resources.currentColors[kind]

  pooled.sprite.on('pointertap', (e: FederatedPointerEvent) => {
    if (world.removing.has(entity)) return
    world.removing.add(entity)

    const nextColor = kind === 'tyan' ? 0xffffff : getRandomColor()
    world.resources.currentColors[kind] = nextColor

    for (const [id, shape] of world.shapes) {
      if (shape.kind !== kind) continue
      shape.color = nextColor
      const renderable = world.renderables.get(id)
      if (renderable) {
        renderable.sprite.tint = nextColor
      }
    }

    if (kind === 'tyan') {
      world.resources.sounds.playTyan()
    } else {
      world.resources.sounds.playSpawn()
    }

    pooled.sprite.eventMode = 'none'

    gsap.to(pooled.sprite.scale, {
      x: 0,
      y: 0,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        pool.release(entity)
      },
    })
  })

  if (animate) {
    gsap.to(pooled.sprite.scale, {
      x: randomScale,
      y: randomScale,
      duration: 0.2,
      ease: 'back.out(1.7)',
    })

    gsap.to(pooled.sprite, {
      alpha: 1,
      duration: 0.18,
      ease: 'power2.out',
    })
  }

  return entity
}
