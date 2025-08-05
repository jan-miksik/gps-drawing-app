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
import { computed, ref } from 'vue';
import { getDistanceFromOrigin } from '../utils/coordinateUtils';
import SettingsModal from './SettingsModal.vue';
import BaseButton from './BaseButton.vue';
var props = defineProps();
var emit = defineEmits();
// Settings modal state
var showSettingsModal = ref(false);
// Current settings from props
var currentSettings = computed(function () { return props.settings; });
var handleSettingsSave = function (settings) {
    emit('settings-save', settings);
};
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
/** @type {__VLS_StyleScopedClasses['settings-button']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-button']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-checkbox']} */ ;
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.show))
                return;
            __VLS_ctx.showSettingsModal = true;
        } }, { class: "settings-button" }), { title: "Settings" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        width: "20",
        height: "20",
        viewBox: "0 0 24 24",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2579 9.77251 19.9887C9.5799 19.7195 9.31074 19.5149 8.99999 19.4C8.69843 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.74213 9.96512 4.01133 9.77251C4.28053 9.5799 4.48514 9.31074 4.6 8.99999C4.73312 8.69843 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61843 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61843 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
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
    /** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
    // @ts-ignore
    var __VLS_0 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign({ 'onClick': {} }, { variant: "primary", size: "medium" })));
    var __VLS_1 = __VLS_0.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "primary", size: "medium" })], __VLS_functionalComponentArgsRest(__VLS_0), false));
    var __VLS_3 = void 0;
    var __VLS_4 = void 0;
    var __VLS_5 = void 0;
    var __VLS_6 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.show))
                return;
            __VLS_ctx.$emit('export');
        }
    };
    __VLS_2.slots.default;
    var __VLS_2;
    /** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
    // @ts-ignore
    var __VLS_7 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign({ 'onClick': {} }, { variant: "primary", size: "medium" })));
    var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "primary", size: "medium" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
    var __VLS_10 = void 0;
    var __VLS_11 = void 0;
    var __VLS_12 = void 0;
    var __VLS_13 = {
        onClick: (__VLS_ctx.handleClearAll)
    };
    __VLS_9.slots.default;
    var __VLS_9;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "footer-right" }));
    /** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign({ 'onClick': {} }, { variant: "primary", size: "medium" })));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "primary", size: "medium" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
    var __VLS_17 = void 0;
    var __VLS_18 = void 0;
    var __VLS_19 = void 0;
    var __VLS_20 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.show))
                return;
            __VLS_ctx.$emit('close');
        }
    };
    __VLS_16.slots.default;
    var __VLS_16;
    /** @type {[typeof SettingsModal, ]} */ ;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent(SettingsModal, new SettingsModal(__assign(__assign(__assign(__assign(__assign({ 'onClose': {} }, { 'onSave': {} }), { 'onRequestLocation': {} }), { 'onRequestBackground': {} }), { 'onOpenSettings': {} }), { show: (__VLS_ctx.showSettingsModal), settings: (__VLS_ctx.currentSettings), locationPermission: ('granted'), backgroundLocationPermission: ('granted'), isNativePlatform: (true) })));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign({ 'onClose': {} }, { 'onSave': {} }), { 'onRequestLocation': {} }), { 'onRequestBackground': {} }), { 'onOpenSettings': {} }), { show: (__VLS_ctx.showSettingsModal), settings: (__VLS_ctx.currentSettings), locationPermission: ('granted'), backgroundLocationPermission: ('granted'), isNativePlatform: (true) })], __VLS_functionalComponentArgsRest(__VLS_21), false));
    var __VLS_24 = void 0;
    var __VLS_25 = void 0;
    var __VLS_26 = void 0;
    var __VLS_27 = {
        onClose: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.show))
                return;
            __VLS_ctx.showSettingsModal = false;
        }
    };
    var __VLS_28 = {
        onSave: (__VLS_ctx.handleSettingsSave)
    };
    var __VLS_29 = {
        onRequestLocation: (function () { })
    };
    var __VLS_30 = {
        onRequestBackground: (function () { })
    };
    var __VLS_31 = {
        onOpenSettings: (function () { })
    };
    var __VLS_23;
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
/** @type {__VLS_StyleScopedClasses['settings-button']} */ ;
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
/** @type {__VLS_StyleScopedClasses['footer-right']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            SettingsModal: SettingsModal,
            BaseButton: BaseButton,
            showSettingsModal: showSettingsModal,
            currentSettings: currentSettings,
            handleSettingsSave: handleSettingsSave,
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
