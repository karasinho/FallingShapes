import { Graphics, Sprite } from 'pixi.js'

import { EngineDraft, PixiSettings, PixiStats } from '#types'

export class Utils {
  private engine: EngineDraft
  private statsListener?: (stats: PixiStats) => void

  constructor(engine: EngineDraft) {
    this.engine = engine
  }

  emitStats() {
    const visible_shapes = this.getVisibleShapes()
    const area = this.calcActiveShapesArea(visible_shapes) || 0
    this.statsListener?.({
      activeShapesCount: this.engine.active_shapes.length,
      activeShapesAreaPx: +area.toFixed(0),
      gravity: this.engine.settings.gravity,
      creation_number: visible_shapes.length,
    })
  }

  isShapeVisible(shape: Sprite | Graphics) {
    const screenW = this.engine.app.screen.width
    const screenH = this.engine.app.screen.height

    const bounds = shape.getBounds()

    return !(bounds.x + bounds.width < 0 || bounds.x > screenW || bounds.y + bounds.height < 0 || bounds.y > screenH)
  }

  getVisibleShapes() {
    return this.engine.active_shapes.filter((spr) => {
      return this.isShapeVisible(spr)
    })
  }

  updateSettings(patch: Partial<PixiSettings>) {
    this.engine.settings = { ...this.engine.settings, ...patch }
    this.emitStats()
  }

  subscribeStats(cb: (stats: PixiStats) => void) {
    this.statsListener = cb
    this.emitStats()

    return () => {
      if (this.statsListener === cb) {
        this.statsListener = undefined
      }
    }
  }

  calcActiveShapesArea(visible_shapes: Sprite[]) {
    const res = visible_shapes.reduce((acc, shape) => {
      acc += shape.__base_area ?? 0 * shape.scale.x * shape.scale.y

      return acc
    }, 0)
    return res
  }
}
