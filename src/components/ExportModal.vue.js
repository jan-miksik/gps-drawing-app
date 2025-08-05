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
import BaseButton from './BaseButton.vue';
var __VLS_props = defineProps();
var emit = defineEmits();
var handleExportImage = function () {
    emit('export-image');
};
var handleExportRelativeData = function () {
    emit('export-data', 'relative');
};
var handleExportExactData = function () {
    emit('export-data', 'exact');
};
var handleCancel = function () {
    console.log('Cancel button clicked - closing modal without export');
    emit('close');
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button']} */ ;
/** @type {__VLS_StyleScopedClasses['export-section']} */ ;
/** @type {__VLS_StyleScopedClasses['export-option-button']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button-footer']} */ ;
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ onClick: function () { } }, { class: "modal-content" }));
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "export-section" }));
    /** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
    // @ts-ignore
    var __VLS_0 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign({ 'onClick': {} }, { class: "export-option-button" })));
    var __VLS_1 = __VLS_0.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "export-option-button" })], __VLS_functionalComponentArgsRest(__VLS_0), false));
    var __VLS_3 = void 0;
    var __VLS_4 = void 0;
    var __VLS_5 = void 0;
    var __VLS_6 = {
        onClick: (__VLS_ctx.handleExportImage)
    };
    __VLS_2.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "button-text-title" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "button-text" }));
    var __VLS_2;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "export-section" }));
    /** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
    // @ts-ignore
    var __VLS_7 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign({ 'onClick': {} }, { class: "export-option-button" })));
    var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "export-option-button" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
    var __VLS_10 = void 0;
    var __VLS_11 = void 0;
    var __VLS_12 = void 0;
    var __VLS_13 = {
        onClick: (__VLS_ctx.handleExportRelativeData)
    };
    __VLS_9.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "button-text-title" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "button-text" }));
    var __VLS_9;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "export-section" }));
    /** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign({ 'onClick': {} }, { class: "export-option-button" })));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "export-option-button" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
    var __VLS_17 = void 0;
    var __VLS_18 = void 0;
    var __VLS_19 = void 0;
    var __VLS_20 = {
        onClick: (__VLS_ctx.handleExportExactData)
    };
    __VLS_16.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "button-text-title" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "button-text" }));
    var __VLS_16;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "modal-footer" }));
    /** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign({ 'onClick': {} }, { variant: "primary", size: "medium" })));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "primary", size: "medium" })], __VLS_functionalComponentArgsRest(__VLS_21), false));
    var __VLS_24 = void 0;
    var __VLS_25 = void 0;
    var __VLS_26 = void 0;
    var __VLS_27 = {
        onClick: (__VLS_ctx.handleCancel)
    };
    __VLS_23.slots.default;
    var __VLS_23;
}
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['export-section']} */ ;
/** @type {__VLS_StyleScopedClasses['export-option-button']} */ ;
/** @type {__VLS_StyleScopedClasses['button-text-title']} */ ;
/** @type {__VLS_StyleScopedClasses['button-text']} */ ;
/** @type {__VLS_StyleScopedClasses['export-section']} */ ;
/** @type {__VLS_StyleScopedClasses['export-option-button']} */ ;
/** @type {__VLS_StyleScopedClasses['button-text-title']} */ ;
/** @type {__VLS_StyleScopedClasses['button-text']} */ ;
/** @type {__VLS_StyleScopedClasses['export-section']} */ ;
/** @type {__VLS_StyleScopedClasses['export-option-button']} */ ;
/** @type {__VLS_StyleScopedClasses['button-text-title']} */ ;
/** @type {__VLS_StyleScopedClasses['button-text']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            BaseButton: BaseButton,
            handleExportImage: handleExportImage,
            handleExportRelativeData: handleExportRelativeData,
            handleExportExactData: handleExportExactData,
            handleCancel: handleCancel,
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
