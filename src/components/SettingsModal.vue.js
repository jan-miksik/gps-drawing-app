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
import { ref, watch, computed } from 'vue';
import { DEFAULT_GPS_CONFIG, DEFAULT_CANVAS_CONFIG } from '../constants/gpsConstants';
var props = defineProps();
var emit = defineEmits();
// Default values imported from constants
var defaultSettings = {
    ACCURACY_THRESHOLD: DEFAULT_GPS_CONFIG.ACCURACY_THRESHOLD,
    DISTANCE_THRESHOLD: DEFAULT_GPS_CONFIG.DISTANCE_THRESHOLD,
    MIN_TIME_INTERVAL: DEFAULT_GPS_CONFIG.MIN_TIME_INTERVAL / 1000, // Convert from ms to seconds for UI
    PINCH_ZOOM_SENSITIVITY: DEFAULT_CANVAS_CONFIG.PINCH_ZOOM_SENSITIVITY,
    MIN_SCALE: DEFAULT_CANVAS_CONFIG.MIN_SCALE,
    MAX_SCALE: DEFAULT_CANVAS_CONFIG.MAX_SCALE,
    LINE_WIDTH: DEFAULT_CANVAS_CONFIG.LINE_WIDTH,
};
// Local copy of settings for editing
var localSettings = ref(__assign({}, props.settings));
// Update local settings when props change
watch(function () { return props.settings; }, function (newSettings) {
    localSettings.value = __assign({}, newSettings);
}, { deep: true });
// Check if settings have changed from original
var hasChanges = computed(function () {
    return JSON.stringify(localSettings.value) !== JSON.stringify(props.settings);
});
// Check if any value differs from defaults
var hasChangesFromDefaults = computed(function () {
    return JSON.stringify(localSettings.value) !== JSON.stringify(defaultSettings);
});
var handleReset = function () {
    localSettings.value = __assign({}, defaultSettings);
    // Also emit the reset to parent so it can update the actual configs
    emit('save', defaultSettings);
};
var handleSave = function () {
    emit('save', __assign({}, localSettings.value));
    alert('Settings saved successfully!');
    emit('close');
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-input']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-button']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-button']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-button']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-button']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-button']} */ ;
/** @type {__VLS_StyleScopedClasses['save-button']} */ ;
/** @type {__VLS_StyleScopedClasses['save-button']} */ ;
/** @type {__VLS_StyleScopedClasses['save-button']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.show) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.show))
                return;
            __VLS_ctx.$emit('close');
        } }, { class: "modal-overlay" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ onClick: function () { } }, { class: "modal-content fullscreen" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "modal-header" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.show))
                return;
            __VLS_ctx.$emit('close');
        } }, { class: "close-button" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "modal-body" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-section" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-item" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)(__assign({ class: "setting-label" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-control" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)(__assign({ type: "number", min: "1", max: "10", step: "0.5" }, { class: "setting-input" }));
    (__VLS_ctx.localSettings.LINE_WIDTH);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "setting-unit" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-description" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-item" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)(__assign({ class: "setting-label" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-control scale-range" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "scale-input-group" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)(__assign({ class: "scale-label" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)(__assign({ type: "number", min: "0.01", max: "1", step: "0.01" }, { class: "setting-input" }));
    (__VLS_ctx.localSettings.MIN_SCALE);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "scale-input-group" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)(__assign({ class: "scale-label" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)(__assign({ type: "number", min: "1", max: "100", step: "0.5" }, { class: "setting-input" }));
    (__VLS_ctx.localSettings.MAX_SCALE);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-description" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-item" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)(__assign({ class: "setting-label" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-control" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)(__assign({ type: "number", min: "0.1", max: "5", step: "0.1" }, { class: "setting-input" }));
    (__VLS_ctx.localSettings.PINCH_ZOOM_SENSITIVITY);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-description" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-section" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-item" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)(__assign({ class: "setting-label" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-control" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)(__assign({ type: "number", min: "1", max: "100" }, { class: "setting-input" }));
    (__VLS_ctx.localSettings.ACCURACY_THRESHOLD);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "setting-unit" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-description" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-item" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)(__assign({ class: "setting-label" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-control" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)(__assign({ type: "number", min: "1", max: "100" }, { class: "setting-input" }));
    (__VLS_ctx.localSettings.DISTANCE_THRESHOLD);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "setting-unit" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-description" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-item" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)(__assign({ class: "setting-label" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-control" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)(__assign({ type: "number", min: "1", max: "60" }, { class: "setting-input" }));
    (__VLS_ctx.localSettings.MIN_TIME_INTERVAL);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "setting-unit" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "setting-description" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "modal-footer" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: (__VLS_ctx.handleReset) }, { class: "reset-button" }), { disabled: (!__VLS_ctx.hasChangesFromDefaults) }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "footer-right" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: (__VLS_ctx.handleSave) }, { class: "save-button" }), { disabled: (!__VLS_ctx.hasChanges) }));
}
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['fullscreen']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-label']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-input']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-unit']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-description']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-label']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-range']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-label']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-input']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-input-group']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-label']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-input']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-description']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-label']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-input']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-description']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-label']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-input']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-unit']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-description']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-label']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-input']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-unit']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-description']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-label']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-control']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-input']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-unit']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-description']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-button']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-right']} */ ;
/** @type {__VLS_StyleScopedClasses['save-button']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            localSettings: localSettings,
            hasChanges: hasChanges,
            hasChangesFromDefaults: hasChangesFromDefaults,
            handleReset: handleReset,
            handleSave: handleSave,
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
