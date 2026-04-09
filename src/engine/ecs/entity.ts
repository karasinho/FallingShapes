import type { Entity, World, WorldBase } from '#types'

export function createEntity(world: World): Entity {
  const id = world.nextEntityId++
  world.entities.add(id)
  return id
}

export function destroyEntity(world: WorldBase, entity: Entity) {
  const renderable = world.renderables.get(entity)
  if (renderable) {
    renderable.sprite.removeAllListeners()
    renderable.sprite.removeFromParent()
  }
  const stores = [
    world.entities,
    world.velocities,
    world.gravities,
    world.shapes,
    world.renderables,
    world.clickables,
    world.removing,
    world.transforms,
  ]
  stores.forEach((store) => store.delete(entity))
}
