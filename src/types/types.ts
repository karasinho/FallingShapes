import { Application, Container, Graphics, Sprite } from 'pixi.js'

import SoundService from '#root/services/SoundSevrice'
import { ShapePool } from '#root/engine/ecs/pools/ShapePool'

export type PixiAppApi = {
  updateSettings: (patch: Partial<{ gravity: number; creation_limit: number }>) => void
  subscribeStats: (cb: (stats: PixiStats) => void) => () => void
  destroyApp: () => void
}
export type TransformComponent = {
  x: number
  y: number
  rotation: number
  scaleX: number
  scaleY: number
}

export type VelocityComponent = {
  vx: number
  vy: number
}

export type GravityComponent = {
  value: number
}

export type ShapeComponent = {
  kind: ShapeKind
  baseArea: number
  color: number
}

export type RenderableComponent = {
  sprite: Sprite
}
export type Entity = number

export type WorldResourcesBase = {
  app: Application
  spawnArea: Container
  settings: PixiSettings
  sounds: SoundService
  currentColors: Record<ShapeKind, number>
  statsListener?: (stats: PixiStats) => void
  spawnAccumulator: number
  pool?: ShapePool
}

export type WorldResourcesReady = WorldResourcesBase & {
  pool: ShapePool
}

export type WorldBase = {
  nextEntityId: number
  entities: Set<Entity>

  transforms: Map<Entity, TransformComponent>
  velocities: Map<Entity, VelocityComponent>
  gravities: Map<Entity, GravityComponent>
  shapes: Map<Entity, ShapeComponent>
  renderables: Map<Entity, RenderableComponent>
  clickables: Set<Entity>
  removing: Set<Entity>

  resources: WorldResourcesBase
}

export type World = Omit<WorldBase, 'resources'> & {
  resources: WorldResourcesReady
  __ready: true
}

export type EngineBase = {
  app: Application
  sounds: SoundService
  spawnArea: Container
  active_shapes: Sprite[]
  settings: PixiSettings
  currentColors: Record<ShapeKind, number>
}

export type EngineDraft = EngineBase

export type Engine = EngineBase & {
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
  tick: number
  glow_distance: number
}
