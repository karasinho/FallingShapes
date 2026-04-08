<script setup lang="ts">
  import { initPixiApp } from '#root/engine/InitPixiApp'
  import type { PixiStats } from '#types'
  import { ref, onBeforeUnmount, reactive, watch, onMounted } from 'vue'
  import heroImg from '#root/assets/title.jpg'
  import type { PixiAppApi } from '#types'

  const settings = reactive({
    gravity: 100,
    creation_limit: 1,
  })

  const stats = reactive<PixiStats>({
    activeShapesCount: 0,
    activeShapesAreaPx: 0,
    gravity: 100,
    creation_number: 1,
  })

  const pixiApi = ref<PixiAppApi | null>(null)
  const canvas_wr = ref<HTMLDivElement | null>(null)

  let unsubscribeStats: null | (() => void) = null
  let cleanupTouchGuards: (() => void) | undefined

  onMounted(async () => {
    if (!canvas_wr.value) return

    cleanupTouchGuards = disableDoubleTapZoom()

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
    cleanupTouchGuards?.()
  })

  function disableDoubleTapZoom() {
    let lastTouchEnd = 0

    const onTouchEnd = (e: TouchEvent) => {
      const now = Date.now()

      if (now - lastTouchEnd <= 300 && e.cancelable) {
        e.preventDefault()
      }

      lastTouchEnd = now
    }

    document.addEventListener('touchend', onTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchend', onTouchEnd)
    }
  }

  function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
  }

  function changeCreationLimit(delta: number) {
    settings.creation_limit = clamp(settings.creation_limit + delta, 1, 30)
  }

  function changeGravity(delta: number) {
    settings.gravity = clamp(settings.gravity + delta, 100, 1000)
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
  <section>
    <div class="main_container">
      <div class="body_wr">
        <div class="hero">
          <img :src="heroImg" class="base" width="170" height="179" alt="title" />
        </div>

        <div class="app_container">
          <div class="info_container">
            <div class="info_wr">
              <span class="info_title">Visible:</span>
              <span>{{ stats.creation_number }}</span>
            </div>
            <div class="info_wr">
              <span class="info_title">Occupied:</span>
              <span class="info_value">{{ stats.activeShapesAreaPx }} px²</span>
            </div>
          </div>
          <div class="canvas_wr" ref="canvas_wr"></div>
        </div>

        <div class="controls_wr">
          <div class="buttons_controls_wr">
            <div class="btns">
              <button class="btn btn_dec" @click="changeCreationLimit(-1)">-</button>
              <button class="btn btn_inc" @click="changeCreationLimit(1)">+</button>
            </div>
            <div class="control_title">
              <span>gen/sec: </span>
              <span>{{ settings.creation_limit }}</span>
            </div>
          </div>
          <div class="buttons_controls_wr">
            <div class="btns">
              <button class="btn btn_dec" @click="changeGravity(-100)">-</button>
              <button class="btn btn_inc" @click="changeGravity(100)">+</button>
            </div>
            <div class="control_title">
              <span>Gravity: </span>
              <span>{{ settings.gravity / 100 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  $panel-width: 500px;
  $radius: 0.4rem;
  $shadow: 0 0 12px 2px #ded6b1;
  $text-color: rgb(147, 130, 244);
  $bg-panel: rgb(11, 11, 11);
  $btn-inc: rgb(108, 11, 150);
  $btn-dec: rgb(136, 33, 188);

  .main_container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100dvw;
    height: 100dvh;
    margin: auto;
    box-sizing: border-box;
    color: $text-color;
    text-align: center;

    @media (max-width: 400px) {
      font-size: 0.8rem;
    }
  }

  .body_wr {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: $panel-width;
    max-width: 85%;
    max-height: 90%;
    overflow: hidden;
    padding: 1rem;
    border-radius: $radius;
    background-color: $bg-panel;
    box-shadow: $shadow;
  }

  .hero {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .hero img {
    width: 100%;
    height: auto;
    border-radius: $radius;
  }

  .app_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: $panel-width;
    max-width: 100%;
    overflow: hidden;
  }

  .info_container {
    display: flex;
    gap: 2rem;
    align-self: flex-start;
  }

  .info_wr {
    display: flex;
    gap: 0.5rem;
  }

  .canvas_wr {
    width: 100%;
    height: 500px;
    box-sizing: border-box;
    overflow: hidden;
    border-radius: $radius;
    touch-action: none;
    background: url('/src/assets/background_canvas.jpg') center / cover no-repeat;
  }

  .controls_wr {
    display: flex;
    gap: 2rem;
    align-self: flex-start;
  }

  .buttons_controls_wr {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .btns {
    display: flex;
    gap: 0.4rem;
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    font-size: 1.2rem;
    line-height: 1;
    text-align: center;
    cursor: pointer;
  }

  .btn_inc {
    background-color: $btn-inc;
  }

  .btn_dec {
    background-color: $btn-dec;
  }
</style>
