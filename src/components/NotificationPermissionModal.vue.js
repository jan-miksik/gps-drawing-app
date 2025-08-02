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
var __VLS_props = defineProps();
var emit = defineEmits();
var handleRequestPermission = function () {
    emit('request-permission');
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.notificationPermission === 'denied') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-modal" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-content" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-text" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: (__VLS_ctx.handleRequestPermission) }, { class: "permission-button" }), { disabled: (__VLS_ctx.isRequesting) }));
    if (!__VLS_ctx.isRequesting) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
}
/** @type {__VLS_StyleScopedClasses['permission-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-content']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-text']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            handleRequestPermission: handleRequestPermission,
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
