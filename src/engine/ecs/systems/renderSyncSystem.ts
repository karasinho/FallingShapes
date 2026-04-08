import type { World } from '#types'

export function renderSyncSystem(world: World) {
  for (const entity of world.entities) {
    const transform = world.transforms.get(entity)
    const renderable = world.renderables.get(entity)
    if (!transform || !renderable) continue

    renderable.sprite.position.set(transform.x, transform.y)
    renderable.sprite.rotation = transform.rotation
    renderable.sprite.scale.set(transform.scaleX, transform.scaleY)
  }
}
