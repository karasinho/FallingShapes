import { Rectangle } from 'pixi.js'
import type { World } from '#types'
import { createShapeEntity } from '../factories/createShapeEntity'

export async function spawnSystem(world: World, deltaMs: number) {
  world.resources.spawnAccumulator += deltaMs

  const creationLimit = Math.max(1, world.resources.settings.creation_limit)
  const spawnWindowMs = 1000
  const spawnInterval = spawnWindowMs / creationLimit

  while (world.resources.spawnAccumulator >= spawnInterval) {
    world.resources.spawnAccumulator -= spawnInterval

    const area = world.resources.spawnArea.hitArea as Rectangle
    const x = area.x + 100 + Math.random() * (area.width - 150)
    const y = -100

    await createShapeEntity(world, x, y, false)
  }
}
