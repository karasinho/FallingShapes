import { Graphics, Container, Sprite, RenderTexture, Assets } from 'pixi.js'
import { GlowFilter } from 'pixi-filters'

import tyan_img from '#root/assets/tyan.png'
import { DEFAULTS } from '#root/engine/defaults'
import type { ShapeKind, World } from '#types'

type DrawPolygonOptions = {
  g: Graphics
  sides: number
  radius?: number
  fillColor?: string | number
  strokeColor?: string | number
  strokeWidth?: number
}

function getRandomColor(): number {
  return Math.floor(Math.random() * 0xffffff)
}

function polygonArea(points: number[]): number {
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

function drawBlob(g: Graphics, world: World) {
  const points: number[] = []
  const segments = 20
  const baseRadius = world.resources.settings.circle_radius

  for (let i = 0; i < segments; i++) {
    const angle = (Math.PI * 2 * i) / segments
    const radius = baseRadius + (Math.random() * 10 - 5)

    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius)
  }

  ;(g as any).__base_area = polygonArea(points)
  g.poly(points).fill(getRandomColor())
}

function drawPolygon({
  g,
  sides,
  radius,
  fillColor,
  strokeColor = getRandomColor(),
  strokeWidth = 2,
}: DrawPolygonOptions) {
  if (sides < 3) {
    throw new Error('Polygon must have at least 3 sides')
  }

  const points: number[] = []

  for (let i = 0; i < sides; i++) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / sides
    const x = Math.cos(angle) * radius!
    const y = Math.sin(angle) * radius!
    points.push(x, y)
  }

  ;(g as any).__base_area = polygonArea(points)

  g.poly(points)
  g.fill(fillColor!)
  g.stroke({ color: strokeColor, width: strokeWidth })
}

function getTextureFromGraphics(world: World, g: Graphics) {
  const glowDistance = DEFAULTS.glow_distance
  const glowPadding = glowDistance * 2

  g.filters = [
    new GlowFilter({
      distance: glowDistance,
      outerStrength: 2,
      color: 'white',
    }),
  ]

  const bounds = g.getLocalBounds()

  const texture = RenderTexture.create({
    width: Math.ceil(bounds.width + glowPadding * 2),
    height: Math.ceil(bounds.height + glowPadding * 2),
  })

  const temp = new Container()
  g.x = -bounds.x + glowPadding
  g.y = -bounds.y + glowPadding
  temp.addChild(g)

  world.resources.app.renderer.render({
    container: temp,
    target: texture,
    clear: true,
  })
  ;(texture as any).__base_area = (g as any).__base_area ?? 0
  g.destroy()

  return texture
}

export async function createShapeSprite(world: World, kind: ShapeKind) {
  let texture

  if (kind === 'tyan') {
    texture = await Assets.load(tyan_img)
    ;(texture as any).__base_area = texture.width * texture.height
  } else {
    const g = new Graphics()
    const radius = world.resources.settings.circle_radius

    switch (kind) {
      case 'triangle':
        drawPolygon({
          g,
          sides: 3,
          radius,
          fillColor: getRandomColor(),
        })
        break

      case 'quad':
        drawPolygon({
          g,
          sides: 4,
          radius,
          fillColor: getRandomColor(),
        })
        break

      case 'pentagon':
        drawPolygon({
          g,
          sides: 5,
          radius,
          fillColor: getRandomColor(),
        })
        break

      case 'hexagon':
        drawPolygon({
          g,
          sides: 6,
          radius,
          fillColor: getRandomColor(),
        })
        break

      case 'circle': {
        g.circle(0, 0, radius).fill(getRandomColor())
        ;(g as any).__base_area = Math.PI * radius * radius
        break
      }

      case 'ellipse': {
        g.ellipse(0, 0, radius, radius / 1.5).fill(getRandomColor())
        ;(g as any).__base_area = (Math.PI * radius * radius) / 1.5
        break
      }

      case 'blob':
        drawBlob(g, world)
        break
    }

    texture = getTextureFromGraphics(world, g)
  }

  const sprite = new Sprite(texture)
  sprite.anchor.set(0.5)
  sprite.visible = false
  sprite.eventMode = 'none'

  return {
    sprite,
    baseArea: (texture as any).__base_area ?? 0,
  }
}
