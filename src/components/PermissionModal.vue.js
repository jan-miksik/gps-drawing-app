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
import { computed } from 'vue';
var props = defineProps();
var emit = defineEmits();
var shouldShowModal = computed(function () {
    // the permission is not know if the states are in prompt
    if (props.locationPermission === null || props.notificationPermission === null) {
        return false;
    }
    // Show modal if any permission is not granted (except 'not-needed' for notifications)
    return props.locationPermission !== 'granted' || (props.notificationPermission !== 'granted' && props.notificationPermission !== 'not-needed');
});
var handleRequestLocationPermission = function () {
    emit('request-location-permission');
};
var handleOpenSettings = function () {
    emit('open-settings');
};
var handleRequestNotificationPermission = function () {
    emit('request-notification-permission');
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['permission-section']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-status']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.shouldShowModal) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-modal" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-content" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-section" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-text" }));
    if (__VLS_ctx.locationPermission === 'granted') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-status granted" }));
    }
    else if (__VLS_ctx.locationPermission === 'prompt' || __VLS_ctx.locationPermission === 'prompt-with-rationale') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: (__VLS_ctx.handleRequestLocationPermission) }, { class: "permission-button" }));
    }
    else if (__VLS_ctx.locationPermission === 'denied') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-text" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: (__VLS_ctx.handleOpenSettings) }, { class: "permission-button" }));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-text" }));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-section" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-text" }));
    if (__VLS_ctx.notificationPermission === 'granted' || __VLS_ctx.notificationPermission === 'not-needed') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-status granted" }));
    }
    else if (__VLS_ctx.notificationPermission === 'prompt' || __VLS_ctx.notificationPermission === 'prompt-with-rationale') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: (__VLS_ctx.handleRequestNotificationPermission) }, { class: "permission-button" }), { disabled: (__VLS_ctx.isRequesting) }));
        if (!__VLS_ctx.isRequesting) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
    }
    else if (__VLS_ctx.notificationPermission === 'denied') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-text" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: (__VLS_ctx.handleOpenSettings) }, { class: "permission-button" }));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-text" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: (__VLS_ctx.handleOpenSettings) }, { class: "permission-button" }));
    }
}
/** @type {__VLS_StyleScopedClasses['permission-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-content']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-section']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-text']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-status']} */ ;
/** @type {__VLS_StyleScopedClasses['granted']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-text']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-text']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-section']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-text']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-status']} */ ;
/** @type {__VLS_StyleScopedClasses['granted']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-text']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-text']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            shouldShowModal: shouldShowModal,
            handleRequestLocationPermission: handleRequestLocationPermission,
            handleOpenSettings: handleOpenSettings,
            handleRequestNotificationPermission: handleRequestNotificationPermission,
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
