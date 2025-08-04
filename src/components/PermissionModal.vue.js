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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { computed } from 'vue';
import BaseButton from './BaseButton.vue';
import { ref } from 'vue';
var props = defineProps();
var emit = defineEmits();
var isKeepShowingModal = ref(false);
var permissionsGranted = computed(function () {
    return props.locationPermission === 'granted' && (props.notificationPermission === 'granted' || props.notificationPermission === 'not-needed');
});
var shouldShowModal = computed(function () {
    if (isKeepShowingModal.value) {
        return true;
    }
    // the permission is not know if the states are in prompt
    if (props.locationPermission === null || props.notificationPermission === null) {
        return false;
    }
    // Show modal if any permission is not granted (except 'not-needed' for notifications)
    return !permissionsGranted.value;
});
var handleRequestLocationPermission = function () {
    emit('request-location-permission');
    isKeepShowingModal.value = true;
};
var handleOpenSettings = function () {
    emit('open-settings');
    isKeepShowingModal.value = true;
};
var handleRequestNotificationPermission = function () {
    emit('request-notification-permission');
    isKeepShowingModal.value = true;
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
        /** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
        // @ts-ignore
        var __VLS_0 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign(__assign({ 'onClick': {} }, { variant: "primary", size: "large" }), { class: "permission-button" })));
        var __VLS_1 = __VLS_0.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { variant: "primary", size: "large" }), { class: "permission-button" })], __VLS_functionalComponentArgsRest(__VLS_0), false));
        var __VLS_3 = void 0;
        var __VLS_4 = void 0;
        var __VLS_5 = void 0;
        var __VLS_6 = {
            onClick: (__VLS_ctx.handleRequestLocationPermission)
        };
        __VLS_2.slots.default;
        var __VLS_2;
    }
    else if (__VLS_ctx.locationPermission === 'denied') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-text" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
        /** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
        // @ts-ignore
        var __VLS_7 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign(__assign({ 'onClick': {} }, { variant: "primary", size: "large" }), { class: "permission-button" })));
        var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { variant: "primary", size: "large" }), { class: "permission-button" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
        var __VLS_10 = void 0;
        var __VLS_11 = void 0;
        var __VLS_12 = void 0;
        var __VLS_13 = {
            onClick: (__VLS_ctx.handleOpenSettings)
        };
        __VLS_9.slots.default;
        var __VLS_9;
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
        /** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
        // @ts-ignore
        var __VLS_14 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign(__assign(__assign({ 'onClick': {} }, { variant: "primary" }), { class: "permission-button" }), { size: "large", disabled: (__VLS_ctx.isRequesting) })));
        var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClick': {} }, { variant: "primary" }), { class: "permission-button" }), { size: "large", disabled: (__VLS_ctx.isRequesting) })], __VLS_functionalComponentArgsRest(__VLS_14), false));
        var __VLS_17 = void 0;
        var __VLS_18 = void 0;
        var __VLS_19 = void 0;
        var __VLS_20 = {
            onClick: (__VLS_ctx.handleRequestNotificationPermission)
        };
        __VLS_16.slots.default;
        if (!__VLS_ctx.isRequesting) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        var __VLS_16;
    }
    else if (__VLS_ctx.notificationPermission === 'denied') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-text" }));
        /** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
        // @ts-ignore
        var __VLS_21 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign(__assign({ 'onClick': {} }, { variant: "primary", size: "large" }), { class: "permission-button" })));
        var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { variant: "primary", size: "large" }), { class: "permission-button" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
        var __VLS_24 = void 0;
        var __VLS_25 = void 0;
        var __VLS_26 = void 0;
        var __VLS_27 = {
            onClick: (__VLS_ctx.handleOpenSettings)
        };
        __VLS_23.slots.default;
        var __VLS_23;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-text" }));
        /** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
        // @ts-ignore
        var __VLS_28 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign(__assign({ 'onClick': {} }, { variant: "primary", size: "large" }), { class: "permission-button" })));
        var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { variant: "primary", size: "large" }), { class: "permission-button" })], __VLS_functionalComponentArgsRest(__VLS_28), false));
        var __VLS_31 = void 0;
        var __VLS_32 = void 0;
        var __VLS_33 = void 0;
        var __VLS_34 = {
            onClick: (__VLS_ctx.handleOpenSettings)
        };
        __VLS_30.slots.default;
        var __VLS_30;
    }
    if (__VLS_ctx.permissionsGranted) {
        /** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
        // @ts-ignore
        var __VLS_35 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign(__assign({ 'onClick': {} }, { variant: "primary", size: "large" }), { class: "permission-button done-button" })));
        var __VLS_36 = __VLS_35.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { variant: "primary", size: "large" }), { class: "permission-button done-button" })], __VLS_functionalComponentArgsRest(__VLS_35), false));
        var __VLS_38 = void 0;
        var __VLS_39 = void 0;
        var __VLS_40 = void 0;
        var __VLS_41 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.shouldShowModal))
                    return;
                if (!(__VLS_ctx.permissionsGranted))
                    return;
                __VLS_ctx.isKeepShowingModal = false;
            }
        };
        __VLS_37.slots.default;
        var __VLS_37;
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
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['done-button']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            BaseButton: BaseButton,
            isKeepShowingModal: isKeepShowingModal,
            permissionsGranted: permissionsGranted,
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
