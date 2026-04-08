import type { World } from '#types'

export function movementSystem(world: World, dt: number) {
  for (const entity of world.entities) {
    const transform = world.transforms.get(entity)
    const velocity = world.velocities.get(entity)
    if (!transform || !velocity) continue

    transform.x += velocity.vx * dt
    transform.y += velocity.vy * dt
  }
}
