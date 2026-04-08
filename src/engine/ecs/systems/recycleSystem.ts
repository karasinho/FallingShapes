import type { World } from '#types'

export function recycleSystem(world: World) {
  const pool = (world.resources as typeof world.resources & { pool: any }).pool
  const toRelease: number[] = []

  for (const entity of world.entities) {
    const transform = world.transforms.get(entity)
    if (!transform) continue

    if (transform.y > world.resources.app.screen.height + 100) {
      toRelease.push(entity)
    }
  }

  for (const entity of toRelease) {
    pool.release(entity)
  }
}
