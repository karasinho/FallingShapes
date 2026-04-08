import 'pixi.js'

import { ShapeKind } from '#types'

declare module 'pixi.js' {
  interface Sprite {
    kind?: ShapeKind
    __isRemoving?: boolean
    __base_area?: number
  }
  interface Graphics {
    kind?: ShapeKind
    __isRemoving?: boolean
    __base_area?: number
  }
}
