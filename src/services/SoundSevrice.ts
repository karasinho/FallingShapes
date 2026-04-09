import spawnSfx from '#root/assets/sounds/spawn.mp3'
import popSfx from '#root/assets/sounds/pop.mp3'
import tyan from '#root/assets/sounds/tyan.mp3'

import { sound } from '@pixi/sound'
import { DEFAULTS } from '#root/engine/defaults'

const SOUND_KEYS = ['spawn', 'pop', 'tyan'] as const
type SoundKey = (typeof SOUND_KEYS)[number]

export default class SoundService {
  constructor() {
    this.register('spawn', spawnSfx)
    this.register('pop', popSfx)
    this.register('tyan', tyan)
  }

  private register(key: SoundKey, sfx: any) {
    if (!sound.exists(key)) {
      sound.add(key, sfx)
    }
  }

  playSound(key: SoundKey) {
    sound.play(key, {
      volume: DEFAULTS.sound_volume,
    })
  }

  destroy() {
    sound.stopAll()
    SOUND_KEYS.forEach((key) => sound.remove(key))
  }
}
