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
var props = withDefaults(defineProps(), {
    variant: 'primary',
    size: 'medium',
    disabled: false,
    title: '',
    position: ''
});
var buttonClasses = computed(function () {
    var classes = ['base-button'];
    // Add variant class
    classes.push("base-button--".concat(props.variant));
    // Add size class
    classes.push("base-button--".concat(props.size));
    // Add position class if specified
    if (props.position) {
        classes.push("base-button--".concat(props.position));
    }
    // Add disabled class
    if (props.disabled) {
        classes.push('base-button--disabled');
    }
    return classes;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_withDefaultsArg = (function (t) { return t; })({
    variant: 'primary',
    size: 'medium',
    disabled: false,
    title: '',
    position: ''
});
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['base-button--primary']} */ ;
/** @type {__VLS_StyleScopedClasses['base-button--circular']} */ ;
/** @type {__VLS_StyleScopedClasses['base-button--disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['base-button--small']} */ ;
/** @type {__VLS_StyleScopedClasses['base-button--circular']} */ ;
/** @type {__VLS_StyleScopedClasses['base-button--medium']} */ ;
/** @type {__VLS_StyleScopedClasses['base-button--circular']} */ ;
/** @type {__VLS_StyleScopedClasses['base-button--large']} */ ;
/** @type {__VLS_StyleScopedClasses['base-button--circular']} */ ;
/** @type {__VLS_StyleScopedClasses['base-button--disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['base-button--disabled']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ class: (__VLS_ctx.buttonClasses) }, { disabled: (__VLS_ctx.disabled), title: (__VLS_ctx.title) }));
var __VLS_0 = {};
// @ts-ignore
var __VLS_1 = __VLS_0;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            buttonClasses: buttonClasses,
        };
    },
    __typeProps: {},
    props: {},
});
var __VLS_component = (await import('vue')).defineComponent({
    setup: function () {
        return {};
    },
    __typeProps: {},
    props: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
