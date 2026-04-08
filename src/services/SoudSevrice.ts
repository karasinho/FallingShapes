import spawnSfx from '#root/assets/sounds/spawn.mp3'
import popSfx from '#root/assets/sounds/pop.mp3'
import tyan from '#root/assets/sounds/tyan.mp3'

import { sound } from '@pixi/sound'
import { DEFAULTS } from '#root/engine/defaults'

export default class SoundService {
  constructor() {
    if (!sound.exists('spawn')) {
      sound.add('spawn', spawnSfx)
    }

    if (!sound.exists('pop')) {
      sound.add('pop', popSfx)
    }
    if (!sound.exists('tyan')) {
      sound.add('tyan', tyan)
    }
  }

  playSpawn() {
    sound.play('spawn', {
      volume: DEFAULTS.sound_volume,
    })
  }

  playPop() {
    sound.play('pop', {
      volume: DEFAULTS.sound_volume,
    })
  }
  playTyan() {
    sound.play('tyan', {
      volume: DEFAULTS.sound_volume,
    })
  }

  destroy() {
    sound.stopAll()

    sound.remove('spawn')
    sound.remove('pop')
    sound.remove('tyan')
  }
}
