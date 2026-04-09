import { Rectangle } from 'pixi.js'
import type { World } from '#types'
import { createShapeEntity } from '../factories/createShapeEntity'

export async function spawnSystem(world: World, deltaMs: number) {
  world.resources.spawnAccumulator += deltaMs

  const creationLimit = Math.max(1, world.resources.settings.creation_limit)
  const spawnWindowMs = world.resources.settings.tick
  const spawnInterval = spawnWindowMs / creationLimit

  while (world.resources.spawnAccumulator >= spawnInterval) {
    world.resources.spawnAccumulator -= spawnInterval

    const area = world.resources.spawnArea.hitArea as Rectangle
    const x = getDefaulXAxisPosition(area)
    const y = 0

    await createShapeEntity(world, x, y, false)
  }
}

function getDefaulXAxisPosition(area: Rectangle) {
  return area.x + Math.random() * area.width
}
