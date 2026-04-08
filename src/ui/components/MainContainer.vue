<script setup lang="ts">
  import { initPixiApp } from '#root/engine/InitPixiApp'
  import type { PixiStats } from '#types'
  import { ref, onBeforeUnmount, reactive, watch, onMounted } from 'vue'
  import heroImg from '#root/assets/title.jpg'
  import type { PixiAppApi } from '#types'

  const settings = reactive({
    gravity: 50,
    creation_limit: 1,
  })

  const stats = reactive<PixiStats>({
    activeShapesCount: 0,
    activeShapesAreaPx: 0,
    gravity: 50,
    creation_number: 1,
  })

  const pixiApi = ref<PixiAppApi | null>(null)
  const canvas_wr = ref<HTMLDivElement | null>(null)

  let unsubscribeStats: null | (() => void) = null

  onMounted(async () => {
    if (!canvas_wr.value) return

    const api = await initPixiApp(canvas_wr.value)
    pixiApi.value = api

    unsubscribeStats = api.subscribeStats((next) => {
      stats.activeShapesCount = next.activeShapesCount
      stats.activeShapesAreaPx = next.activeShapesAreaPx
      stats.gravity = next.gravity
      stats.creation_number = next.creation_number
    })

    api.updateSettings(settings)
  })

  onBeforeUnmount(() => {
    unsubscribeStats?.()
    pixiApi.value?.destroyApp()
  })

  function increaseLimit() {
    settings.creation_limit += 1

    if (settings.creation_limit > 30) {
      settings.creation_limit = 30
    }
  }
  function decreaseLimit() {
    settings.creation_limit -= 1
    if (settings.creation_limit < 1) {
      settings.creation_limit = 1
    }
  }
  function increaseGravity() {
    settings.gravity += 50

    if (settings.gravity > 1000) {
      settings.gravity = 1000
    }
  }
  function decreaseGravity() {
    settings.gravity -= 50
    if (settings.gravity < 50) {
      settings.gravity = 50
    }
  }

  watch(
    settings,
    (value) => {
      pixiApi.value?.updateSettings(value)
    },
    { deep: true },
  )
</script>

<template>
  <section id="body">
    <div class="main_container">
      <div class="body_wr">
        <div class="hero">
          <img :src="heroImg" class="base" width="170" height="179" alt="" />
        </div>

        <div class="info_container">
          <div class="info_wr">
            <span class="info_title">Visible:</span>
            <span>{{ stats.creation_number }}</span>
          </div>
          <div class="info_wr">
            <span class="info_title">Occupied:</span>
            <span class="info_value">{{ stats.activeShapesAreaPx }}</span>
          </div>
        </div>

        <div class="canvas_wr" ref="canvas_wr"></div>

        <div class="controls_wr">
          <div class="buttons_controls_wr">
            <div class="btns">
              <button class="dec_btn" @click="decreaseLimit">-</button>
              <button class="inc_btn" @click="increaseLimit">+</button>
            </div>
            <div class="control_title">
              <span>gen/sec: </span>
              <span>{{ settings.creation_limit }}</span>
            </div>
          </div>
          <div class="buttons_controls_wr">
            <div class="btns">
              <button class="dec_btn" @click="decreaseGravity">-</button>
              <button class="inc_btn" @click="increaseGravity">+</button>
            </div>
            <div class="control_title">
              <span>Gravity: </span>
              <span>{{ settings.gravity }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped="true">
  .main_container {
    margin: auto;
    color: rgb(147, 130, 244);
    width: 100%;
    height: 100dvh;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;

    .body_wr {
      height: 800px;
      width: 500px;
      max-height: 90%;
      max-width: 85%;
      overflow: hidden;

      border-radius: 0.4rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      justify-content: flex-start;
      align-items: center;
      background-color: rgb(11, 11, 11);
      -webkit-box-shadow: 0px 0px 12px 2px #ded6b1;
      box-shadow: 0px 0px 12px 2px #ded6b1;

      .hero {
        width: 100%;
        max-width: 500px;
        height: auto;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 100%;
          height: auto;
          border-radius: 0.4rem;
        }
      }

      @media (max-height: 600px) {
        .hero {
          display: none;
        }
      }
      @media (max-height: 900px) {
        .hero {
          width: 60%;
        }
      }

      .canvas_wr {
        box-sizing: border-box;
        width: 100%;
        height: 500px;
        overflow: hidden;
        // border: 3px solid red;
        border-radius: 0.4rem;
        background: url('/src/assets/background_canvas.jpg') center / cover no-repeat;
      }

      .info_container {
        align-self: flex-start;

        display: flex;
        gap: 2rem;
        .info_wr {
          display: flex;
          gap: 0.5rem;
        }
      }

      .controls_wr {
        align-self: flex-start;
        display: flex;
        gap: 2rem;
        .buttons_controls_wr {
          display: flex;
          align-items: center;

          gap: 1rem;
          .btns {
            display: flex;
            gap: 0.4rem;
            button {
              width: 2rem;
              height: 2rem;
              font-size: 1.2rem;
              cursor: pointer;
            }
            .inc_btn {
              background-color: rgb(108, 11, 150);
            }
            .dec_btn {
              background-color: rgb(136, 33, 188);
            }
          }
        }
      }
    }
  }
</style>
