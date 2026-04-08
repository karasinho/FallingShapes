import type { World } from '#types'

export function statsSystem(world: World) {
  let visibleCount = 0
  let totalArea = 0

  for (const entity of world.entities) {
    const transform = world.transforms.get(entity)
    const shape = world.shapes.get(entity)
    const renderable = world.renderables.get(entity)

    if (!transform || !shape || !renderable) continue

    const bounds = renderable.sprite.getBounds()
    const screenW = world.resources.app.screen.width
    const screenH = world.resources.app.screen.height

    const visible = !(
      bounds.x + bounds.width < 0 ||
      bounds.x > screenW ||
      bounds.y + bounds.height < 0 ||
      bounds.y > screenH
    )

    if (!visible) continue

    visibleCount++
    totalArea += shape.baseArea * transform.scaleX * transform.scaleY
  }

  world.resources.statsListener?.({
    activeShapesCount: world.entities.size,
    activeShapesAreaPx: +totalArea.toFixed(0),
    gravity: world.resources.settings.gravity,
    creation_number: visibleCount,
  })
}
