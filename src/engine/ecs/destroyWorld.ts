import { gsap } from 'gsap'
import type { World } from '#types'

export function destroyWorld(world: World, cleanupFns: Function[]) {
  for (const fn of cleanupFns) {
    fn()
  }

  world.resources.spawnArea.removeAllListeners()

  for (const [, renderable] of world.renderables) {
    const sprite = renderable.sprite
    gsap.killTweensOf(sprite)
    gsap.killTweensOf(sprite.scale)
    sprite.removeAllListeners()
    sprite.destroy()
  }

  const pool = (world.resources as typeof world.resources & { pool?: any }).pool
  pool?.destroy?.()

  world.resources.app.stage.removeChildren().forEach((child) => {
    child.removeAllListeners()
    child.destroy({
      children: true,
      texture: false,
      textureSource: false,
    })
  })

  world.resources.sounds.destroy?.()
  world.resources.app.ticker.stop()
  world.resources.app.canvas?.remove()

  world.resources.app.destroy(true, {
    children: true,
    texture: false,
    textureSource: false,
    context: true,
  })
}
