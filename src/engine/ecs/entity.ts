import type { Entity, World } from '#types'

export function createEntity(world: World): Entity {
  const id = world.nextEntityId++
  world.entities.add(id)
  return id
}

export function destroyEntity(world: World, entity: Entity) {
  world.entities.delete(entity)

  world.transforms.delete(entity)
  world.velocities.delete(entity)
  world.gravities.delete(entity)
  world.shapes.delete(entity)

  const renderable = world.renderables.get(entity)
  if (renderable) {
    renderable.sprite.removeAllListeners()
    renderable.sprite.removeFromParent()
  }

  world.renderables.delete(entity)
  world.clickables.delete(entity)
  world.removing.delete(entity)
}
