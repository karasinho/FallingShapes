import { Engine } from '#types'
import gsap from 'gsap'

export function initDestroyFunc(engine: Engine, destroyers: Function[]) {
  return () => {
    destroyers.forEach((fn) => {
      fn()
    })

    engine.spawnArea.removeAllListeners()

    for (const shape of engine.active_shapes) {
      gsap.killTweensOf(shape)
      gsap.killTweensOf(shape.scale)
      shape.removeAllListeners()
      shape.destroy()
    }
    engine.active_shapes.length = 0

    if (engine.pool) {
      engine.pool.destroy()
    }

    engine.app.stage.removeChildren().forEach((child) => {
      child.removeAllListeners()
      child.destroy({
        children: true,
        texture: false,
        textureSource: false,
      })
    })

    engine.sounds.destroy?.()

    engine.app.ticker.stop()

    engine.app.canvas?.remove()

    engine.app.destroy(true, {
      children: true,
      texture: false,
      textureSource: false,
      context: true,
    })
  }
}
