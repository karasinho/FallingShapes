import { Rectangle } from 'pixi.js'
import type { World } from '#types'

function syncWorldBounds(world: World) {
  world.resources.spawnArea.hitArea = new Rectangle(
    0,
    0,
    world.resources.app.screen.width,
    world.resources.app.screen.height,
  )
}

export function initResizeSystem(world: World) {
  let timeoutId: number | null = null

  const sync = () => {
    requestAnimationFrame(() => {
      syncWorldBounds(world)
    })

    if (timeoutId) clearTimeout(timeoutId)

    timeoutId = window.setTimeout(() => {
      syncWorldBounds(world)
    }, 250)
  }

  window.addEventListener('resize', sync)
  window.addEventListener('orientationchange', sync)

  return () => {
    window.removeEventListener('resize', sync)
    window.removeEventListener('orientationchange', sync)

    if (timeoutId) clearTimeout(timeoutId)
  }
}
