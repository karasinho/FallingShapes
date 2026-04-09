import type { World } from '#types'

export function gravitySystem(world: World, dt: number) {
  for (const entity of world.entities) {
    const velocity = world.velocities.get(entity)
    const gravity = world.gravities.get(entity)
    if (!velocity || !gravity) continue

    velocity.vy += Math.abs(gravity.value) * dt
  }
}
