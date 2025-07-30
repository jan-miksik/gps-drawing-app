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
// Computed properties
var needsLocationPermission = computed(function () { return props.locationPermission !== 'granted'; });
var needsBackgroundLocationPermission = computed(function () {
    return props.locationPermission === 'granted' && props.backgroundLocationPermission !== 'granted';
});
var needsBackgroundLocation = computed(function () { return props.backgroundLocationPermission !== 'granted'; });
var showSettingsButton = computed(function () {
    return props.locationPermission === 'denied' || props.backgroundLocationPermission === 'denied';
});
var locationStatusClass = computed(function () {
    switch (props.locationPermission) {
        case 'granted': return 'status-granted';
        case 'denied': return 'status-denied';
        default: return 'status-pending';
    }
});
var backgroundStatusClass = computed(function () {
    switch (props.backgroundLocationPermission) {
        case 'granted': return 'status-granted';
        case 'denied': return 'status-denied';
        default: return 'status-pending';
    }
});
var locationStatusText = computed(function () {
    switch (props.locationPermission) {
        case 'granted': return '✓ Granted';
        case 'denied': return '✗ Denied';
        case 'prompt': return '⏳ Pending';
        case 'prompt-with-rationale': return '⏳ Pending';
        default: return 'Unknown';
    }
});
var backgroundStatusText = computed(function () {
    switch (props.backgroundLocationPermission) {
        case 'granted': return '✓ Granted';
        case 'denied': return '✗ Denied';
        case 'prompt': return '⏳ Pending';
        case 'prompt-with-rationale': return '⏳ Pending';
        default: return 'Unknown';
    }
});
// Event handlers
var handleRequestLocation = function () {
    console.log('Requesting location permission...');
    emit('request-location');
};
var handleRequestBackground = function () {
    console.log('Requesting background location permission...');
    emit('request-background');
};
var handleOpenSettings = function () {
    emit('open-settings');
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['permission-modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-text']} */ ;
/** @type {__VLS_StyleScopedClasses['status-item']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['settings']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.show) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-modal-overlay" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-modal-content" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-modal-header" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-modal-body" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-section" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-icon" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-text" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    if (__VLS_ctx.needsBackgroundLocation) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-section" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-icon" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-text" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-status" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "status-item" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "status-label" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: (['status-value', __VLS_ctx.locationStatusClass]) }));
    (__VLS_ctx.locationStatusText);
    if (__VLS_ctx.needsBackgroundLocation) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "status-item" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "status-label" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: (['status-value', __VLS_ctx.backgroundStatusClass]) }));
        (__VLS_ctx.backgroundStatusText);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-modal-footer" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "button-group" }));
    if (__VLS_ctx.needsLocationPermission) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: (__VLS_ctx.handleRequestLocation) }, { disabled: (__VLS_ctx.isRequesting) }), { class: "permission-button primary" }));
        (__VLS_ctx.isRequesting ? 'Requesting...' : 'Enable Location');
    }
    if (__VLS_ctx.needsBackgroundLocationPermission) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: (__VLS_ctx.handleRequestBackground) }, { disabled: (__VLS_ctx.isRequesting) }), { class: "permission-button secondary" }));
        (__VLS_ctx.isRequesting ? 'Requesting...' : 'Enable Background');
    }
    if (__VLS_ctx.showSettingsButton) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: (__VLS_ctx.handleOpenSettings) }, { class: "permission-button settings" }));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.show))
                return;
            __VLS_ctx.$emit('close');
        } }, { class: "permission-button cancel" }));
}
/** @type {__VLS_StyleScopedClasses['permission-modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-section']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-text']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-section']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-text']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-status']} */ ;
/** @type {__VLS_StyleScopedClasses['status-item']} */ ;
/** @type {__VLS_StyleScopedClasses['status-label']} */ ;
/** @type {__VLS_StyleScopedClasses['status-value']} */ ;
/** @type {__VLS_StyleScopedClasses['status-item']} */ ;
/** @type {__VLS_StyleScopedClasses['status-label']} */ ;
/** @type {__VLS_StyleScopedClasses['status-value']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['button-group']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['settings']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            needsLocationPermission: needsLocationPermission,
            needsBackgroundLocationPermission: needsBackgroundLocationPermission,
            needsBackgroundLocation: needsBackgroundLocation,
            showSettingsButton: showSettingsButton,
            locationStatusClass: locationStatusClass,
            backgroundStatusClass: backgroundStatusClass,
            locationStatusText: locationStatusText,
            backgroundStatusText: backgroundStatusText,
            handleRequestLocation: handleRequestLocation,
            handleRequestBackground: handleRequestBackground,
            handleOpenSettings: handleOpenSettings,
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
