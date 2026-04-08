import { initPixiApp } from '../PixiEngine';
import { ref, onBeforeUnmount, reactive, watch, onMounted } from 'vue';
import heroImg from '../assets/title.jpg';
const settings = reactive({
    gravity: 50,
    creation_limit: 1,
});
const stats = reactive({
    activeShapesCount: 0,
    activeShapesAreaPx: 0,
    gravity: 50,
    creation_number: 1,
});
const pixiApi = ref(null);
const canvas_wr = ref(null);
let unsubscribeStats = null;
console.log('🚀 ~ onMounted:');
onMounted(async () => {
    if (!canvas_wr.value)
        return;
    const api = await initPixiApp(canvas_wr.value);
    pixiApi.value = api;
    unsubscribeStats = api.subscribeStats((next) => {
        stats.activeShapesCount = next.activeShapesCount;
        stats.activeShapesAreaPx = next.activeShapesAreaPx;
        stats.gravity = next.gravity;
        stats.creation_number = next.creation_number;
    });
    api.updateSettings(settings);
});
onBeforeUnmount(() => {
    unsubscribeStats?.();
});
function increaseLimit() {
    settings.creation_limit += 1;
    if (settings.creation_limit > 30) {
        settings.creation_limit = 30;
    }
}
function decreaseLimit() {
    settings.creation_limit -= 1;
    if (settings.creation_limit < 1) {
        settings.creation_limit = 1;
    }
}
function increaseGravity() {
    settings.gravity += 50;
    if (settings.gravity > 1000) {
        settings.gravity = 1000;
    }
}
function decreaseGravity() {
    settings.gravity -= 50;
    if (settings.gravity < 50) {
        settings.gravity = 50;
    }
}
watch(settings, (value) => {
    pixiApi.value?.updateSettings(value);
}, { deep: true });
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    id: "body",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "main_container" },
});
/** @type {__VLS_StyleScopedClasses['main_container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "body_wr" },
});
/** @type {__VLS_StyleScopedClasses['body_wr']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hero" },
});
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: (__VLS_ctx.heroImg),
    ...{ class: "base" },
    width: "170",
    height: "179",
    alt: "",
});
/** @type {__VLS_StyleScopedClasses['base']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "info_container" },
});
/** @type {__VLS_StyleScopedClasses['info_container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "info_wr" },
});
/** @type {__VLS_StyleScopedClasses['info_wr']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "info_title" },
});
/** @type {__VLS_StyleScopedClasses['info_title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.stats.creation_number);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "info_wr" },
});
/** @type {__VLS_StyleScopedClasses['info_wr']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "info_title" },
});
/** @type {__VLS_StyleScopedClasses['info_title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "info_value" },
});
/** @type {__VLS_StyleScopedClasses['info_value']} */ ;
(__VLS_ctx.stats.activeShapesAreaPx);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "canvas_wr" },
    ref: "canvas_wr",
});
/** @type {__VLS_StyleScopedClasses['canvas_wr']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "controls_wr" },
});
/** @type {__VLS_StyleScopedClasses['controls_wr']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "buttons_controls_wr" },
});
/** @type {__VLS_StyleScopedClasses['buttons_controls_wr']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "btns" },
});
/** @type {__VLS_StyleScopedClasses['btns']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.decreaseLimit) },
    ...{ class: "dec_btn" },
});
/** @type {__VLS_StyleScopedClasses['dec_btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.increaseLimit) },
    ...{ class: "inc_btn" },
});
/** @type {__VLS_StyleScopedClasses['inc_btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "control_title" },
});
/** @type {__VLS_StyleScopedClasses['control_title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.settings.creation_limit);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "buttons_controls_wr" },
});
/** @type {__VLS_StyleScopedClasses['buttons_controls_wr']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "btns" },
});
/** @type {__VLS_StyleScopedClasses['btns']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.decreaseGravity) },
    ...{ class: "dec_btn" },
});
/** @type {__VLS_StyleScopedClasses['dec_btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.increaseGravity) },
    ...{ class: "inc_btn" },
});
/** @type {__VLS_StyleScopedClasses['inc_btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "control_title" },
});
/** @type {__VLS_StyleScopedClasses['control_title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.settings.gravity);
// @ts-ignore
[heroImg, stats, stats, decreaseLimit, increaseLimit, settings, settings, decreaseGravity, increaseGravity,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
