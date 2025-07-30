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
import { getDistanceFromOrigin } from '../utils/coordinateUtils';
var props = defineProps();
var emit = defineEmits();
var reversedDisplayPoints = computed(function () {
    var reversed = __spreadArray([], props.displayPoints, true).reverse();
    return reversed;
});
var getPointDistance = function (point) {
    return getDistanceFromOrigin(point, props.anonymizationOrigin, props.isAnonymized);
};
var getAccuracy = function (point) {
    if (point.accuracy !== undefined && point.accuracy !== null) {
        return "".concat(Math.round(point.accuracy), "m");
    }
    return 'N/A';
};
var getDateString = function (timestamp) {
    var date = new Date(timestamp);
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    }
    else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }
};
var getTimeString = function (timestamp) {
    var date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};
var handleClearAll = function () {
    if (confirm("Are you sure you want to delete all ".concat(props.points.length, " GPS points? This cannot be undone."))) {
        emit('clear');
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['point-row']} */ ;
/** @type {__VLS_StyleScopedClasses['point-row']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['index']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['latitude']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['longitude']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['x-distance']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['y-distance']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['distance']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['accuracy']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['time']} */ ;
/** @type {__VLS_StyleScopedClasses['export-button']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-button-1']} */ ;
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "header-left" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (__VLS_ctx.points.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "header-controls" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "geopoint-section" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)(__assign({ class: "toggle-label" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)(__assign(__assign({ onChange: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.show))
                return;
            __VLS_ctx.$emit('toggle-anonymization');
        } }, { type: "checkbox", checked: (!__VLS_ctx.isAnonymized) }), { class: "toggle-checkbox" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "toggle-text" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "accuracy-info" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "accuracy-label" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "accuracy-value" }));
    if (__VLS_ctx.currentAccuracy !== null) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "accuracy-text" }));
        (__VLS_ctx.currentAccuracy.toFixed(0));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "accuracy-text" }));
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
        } }, { class: "close-button" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "modal-body" }));
    if (__VLS_ctx.points.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "no-points" }));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "points-list" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "list-header" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "header-item index" }));
        if (!__VLS_ctx.isAnonymized) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "header-item latitude" }));
        }
        if (!__VLS_ctx.isAnonymized) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "header-item longitude" }));
        }
        if (__VLS_ctx.isAnonymized) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "header-item distance" }));
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "header-item time" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "header-item accuracy" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "list-body" }));
        for (var _i = 0, _a = __VLS_getVForSourceType((__VLS_ctx.reversedDisplayPoints)); _i < _a.length; _i++) {
            var _b = _a[_i], point = _b[0], index = _b[1];
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign(__assign({ key: ("".concat(point.lat, "-").concat(point.lon, "-").concat(point.timestamp)) }, { class: "point-row" }), { class: ({ 'current-point': index === 0 }) }));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "row-item index" }));
            (__VLS_ctx.points.length - index);
            if (!__VLS_ctx.isAnonymized) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "row-item latitude" }));
                (point.lat.toFixed(6));
            }
            if (!__VLS_ctx.isAnonymized) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "row-item longitude" }));
                (point.lon.toFixed(6));
            }
            if (__VLS_ctx.isAnonymized) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "row-item distance" }));
                (__VLS_ctx.getPointDistance(point).toFixed(0));
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "row-item time" }));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "time-date" }));
            (__VLS_ctx.getDateString(point.timestamp));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "time-time" }));
            (__VLS_ctx.getTimeString(point.timestamp));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "row-item accuracy" }));
            (__VLS_ctx.getAccuracy(point));
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "modal-footer" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "footer-left" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.show))
                return;
            __VLS_ctx.$emit('export');
        } }, { class: "export-button" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ onClick: (__VLS_ctx.handleClearAll) }, { class: "clear-button-1" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "footer-right" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.show))
                return;
            __VLS_ctx.$emit('close');
        } }, { class: "close-button-footer" }));
}
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['header-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['geopoint-section']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-label']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-text']} */ ;
/** @type {__VLS_StyleScopedClasses['accuracy-info']} */ ;
/** @type {__VLS_StyleScopedClasses['accuracy-label']} */ ;
/** @type {__VLS_StyleScopedClasses['accuracy-value']} */ ;
/** @type {__VLS_StyleScopedClasses['accuracy-text']} */ ;
/** @type {__VLS_StyleScopedClasses['accuracy-text']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['no-points']} */ ;
/** @type {__VLS_StyleScopedClasses['points-list']} */ ;
/** @type {__VLS_StyleScopedClasses['list-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['index']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['latitude']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['longitude']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['distance']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['time']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['accuracy']} */ ;
/** @type {__VLS_StyleScopedClasses['list-body']} */ ;
/** @type {__VLS_StyleScopedClasses['point-row']} */ ;
/** @type {__VLS_StyleScopedClasses['current-point']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['index']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['latitude']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['longitude']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['distance']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['time']} */ ;
/** @type {__VLS_StyleScopedClasses['time-date']} */ ;
/** @type {__VLS_StyleScopedClasses['time-time']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['accuracy']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-left']} */ ;
/** @type {__VLS_StyleScopedClasses['export-button']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-button-1']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-right']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button-footer']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            reversedDisplayPoints: reversedDisplayPoints,
            getPointDistance: getPointDistance,
            getAccuracy: getAccuracy,
            getDateString: getDateString,
            getTimeString: getTimeString,
            handleClearAll: handleClearAll,
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
