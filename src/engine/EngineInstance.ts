import type { World } from '#types'
import { createWorld } from './ecs/createWorld'
import { destroyWorld } from './ecs/destroyWorld'

let cachedWorld: World | null = null
let pendingWorld: Promise<World> | null = null
let cleanupFns: Function[] = []

export async function getOrCreateWorld(canvas_wr: HTMLDivElement): Promise<World> {
  if (cachedWorld) {
    if (cachedWorld.resources.app.canvas.parentElement !== canvas_wr) {
      canvas_wr.replaceChildren(cachedWorld.resources.app.canvas)
    }
    return cachedWorld
  }

  if (pendingWorld) {
    const world = await pendingWorld
    if (world.resources.app.canvas.parentElement !== canvas_wr) {
      canvas_wr.replaceChildren(world.resources.app.canvas)
    }
    return world
  }

  pendingWorld = (async () => {
    const created = await createWorld(canvas_wr)
    cleanupFns = [created.destroy]
    return created.world
  })()

  try {
    const world = await pendingWorld
    cachedWorld = world
    return world
  } finally {
    pendingWorld = null
  }
}

export function destroyCachedWorld() {
  if (!cachedWorld) return
  destroyWorld(cachedWorld, cleanupFns)
  cachedWorld = null
  pendingWorld = null
  cleanupFns = []
}
