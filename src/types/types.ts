import { Application, Container, Graphics, Sprite } from 'pixi.js'
import { createSoundApi, ShapePool, Utils } from '../PixiEngine'

export type Engine = {
  app: Application
  pool: ShapePool
  utils: Utils
  active_shapes: Sprite[]
  settings: PixiSettings
  currentColors: Record<ShapeKind, number>
  spawnArea: Container
  sounds: ReturnType<typeof createSoundApi>
}
export type PixiStats = {
  activeShapesCount: number
  activeShapesAreaPx: number
  gravity: number
  creation_number: number
}
export type ShapeKind = 'triangle' | 'quad' | 'pentagon' | 'hexagon' | 'circle' | 'ellipse' | 'blob' | 'tyan'
export type DrawPolygonOptions = {
  g: Graphics
  sides: number
  radius?: number
  fillColor?: string | number
  strokeColor?: string | number
  strokeWidth?: number
}
export type PixiSettings = {
  gravity: number
  creation_limit: number
  pool_size: number
  circle_radius: number
}
