import { gsap } from 'gsap'
import { createEntity } from '../entity'
import type { ShapeKind, World } from '#types'
import { Container, FederatedPointerEvent, Rectangle, Sprite } from 'pixi.js'
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

function normalizeSpawnPosition(sprite: Sprite, position: { x: number; y: number }, container: Container) {
  const bounds = sprite.getBounds()
  const area = container.hitArea as Rectangle

  let normalized_x = position.x

  let dx = 0

  if (bounds.x < area.x) {
    dx += area.x - bounds.x
  }

  if (bounds.x + bounds.width > area.x + area.width) {
    dx += area.x + area.width - (bounds.x + bounds.width)
  }

  if (dx !== 0) {
    normalized_x += dx
  }

  const y = area.y - bounds.height

  return { x: +normalized_x.toFixed(0), y }
}

export async function createShapeEntity(world: World, x: number, y: number, animate = false) {
  const pool = world.resources.pool
  const kind = getRandomKind()
  const pooled = await pool.get(kind)

  const entity = createEntity(world)
  const rotation = Math.random() * Math.PI * 2
  const randomScale = randFloat(0.5, 1.2)
  const alpha = animate ? 0 : 1

  pooled.sprite.visible = true
  pooled.sprite.eventMode = 'static'
  pooled.sprite.cursor = 'pointer'
  pooled.sprite.rotation = rotation
  pooled.sprite.alpha = alpha
  pooled.sprite.scale.set(randomScale)
  pooled.sprite.removeFromParent()
  world.resources.spawnArea.addChild(pooled.sprite)

  const normalized_pos = animate ? { x, y } : normalizeSpawnPosition(pooled.sprite, { x, y }, world.resources.spawnArea)

  pooled.sprite.position.set(normalized_pos.x, normalized_pos.y)

  world.transforms.set(entity, {
    x: normalized_pos.x,
    y: normalized_pos.y,
    rotation,
    scaleX: randomScale,
    scaleY: randomScale,
  })

  const init_vy = animate ? 0 : 50

  world.velocities.set(entity, { vx: 0, vy: init_vy })
  world.gravities.set(entity, { value: world.resources.settings.gravity || 1 })
  world.shapes.set(entity, {
    kind,
    baseArea: pooled.baseArea,
    color: kind === 'tyan' ? 0xffffff : getRandomColor(),
  })
  world.renderables.set(entity, { sprite: pooled.sprite })
  world.clickables.add(entity)

  pooled.sprite.tint = kind === 'tyan' ? 0xffffff : world.resources.currentColors[kind]

  pooled.sprite.on('pointertap', (e: FederatedPointerEvent) => {
    e.stopPropagation()
    if (world.removing.has(entity)) {
      return
    }
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
      world.resources.sounds.playSound('tyan')
    } else {
      world.resources.sounds.playSound('spawn')
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
