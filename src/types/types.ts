import { Application, Container, Graphics, Sprite } from 'pixi.js'

import SoundService from '#root/services/SoudSevrice'
import { ShapePool } from '#root/systems/PoolSystem'
import { Utils } from '#root/services/StatsService'

export type PixiAppApi = {
  updateSettings: (patch: Partial<{ gravity: number; creation_limit: number }>) => void
  subscribeStats: (cb: (stats: PixiStats) => void) => () => void
  destroyApp: () => void
}

export type EngineBase = {
  app: Application
  sounds: SoundService
  spawnArea: Container
  active_shapes: Sprite[]
  settings: PixiSettings
  currentColors: Record<ShapeKind, number>
}

export type EngineReadyFields = {
  pool: ShapePool
  utils: Utils
  destroyApp: () => void
}

export type EngineDraft = EngineBase & Partial<EngineReadyFields>

export type Engine = EngineBase &
  EngineReadyFields & {
    __ready: true
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
  sound_volume: number
}
