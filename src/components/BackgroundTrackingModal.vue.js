var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { ref } from 'vue';
var props = defineProps();
var emit = defineEmits();
var dontShowAgain = ref(false);
var handleEnableBackground = function () {
    emit('enable-background');
};
var handleSkip = function () {
    emit('skip', dontShowAgain.value);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['background-modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['explanation-content']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-note']} */ ;
/** @type {__VLS_StyleScopedClasses['enable-button']} */ ;
/** @type {__VLS_StyleScopedClasses['enable-button']} */ ;
/** @type {__VLS_StyleScopedClasses['skip-button']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (props.show) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "background-modal-overlay" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "background-modal-content" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "background-modal-header" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "background-modal-body" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "explanation-section" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "explanation-icon" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "explanation-content" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "benefits-section" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "benefit-item" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "benefit-icon" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "benefit-text" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "benefit-item" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "benefit-icon" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "benefit-text" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "benefit-item" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "benefit-icon" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "benefit-text" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-note" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "dont-show-again" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)(__assign({ class: "checkbox-label" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)(__assign({ type: "checkbox" }, { class: "checkbox-input" }));
    (__VLS_ctx.dontShowAgain);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "checkbox-text" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "background-modal-footer" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "button-group" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: (__VLS_ctx.handleEnableBackground) }, { disabled: (props.isRequesting) }), { class: "enable-button" }));
    if (props.isRequesting) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: (__VLS_ctx.handleSkip) }, { class: "skip-button" }));
}
/** @type {__VLS_StyleScopedClasses['background-modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['background-modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['background-modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['background-modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['explanation-section']} */ ;
/** @type {__VLS_StyleScopedClasses['explanation-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['explanation-content']} */ ;
/** @type {__VLS_StyleScopedClasses['benefits-section']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-item']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-text']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-item']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-text']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-item']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['benefit-text']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-note']} */ ;
/** @type {__VLS_StyleScopedClasses['dont-show-again']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-label']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-input']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-text']} */ ;
/** @type {__VLS_StyleScopedClasses['background-modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['button-group']} */ ;
/** @type {__VLS_StyleScopedClasses['enable-button']} */ ;
/** @type {__VLS_StyleScopedClasses['skip-button']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            dontShowAgain: dontShowAgain,
            handleEnableBackground: handleEnableBackground,
            handleSkip: handleSkip,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup: function () {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
