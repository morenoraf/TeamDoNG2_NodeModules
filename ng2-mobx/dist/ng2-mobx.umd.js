(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('mobx')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', 'mobx'], factory) :
	(factory((global['ng2-mobx'] = global['ng2-mobx'] || {}),global._angular_core,global.mobx));
}(this, (function (exports,_angular_core,mobx) { 'use strict';

/* tslint:disable:max-line-length */
/* tslint:disable:no-console */
// function for turning debug on / off
var ng2MobxDebug = (function () {
    if (typeof localStorage === 'undefined' || typeof console === 'undefined') {
        return;
    }
    window['ng2MobxDebug'] = function (value) {
        if (value)
            localStorage['ng2-mobx-debug'] = true;
        else
            delete localStorage['ng2-mobx-debug'];
    };
    function isDebugOn() {
        return localStorage['ng2-mobx-debug'];
    }
    mobx.spy(function (change) { return isDebugOn() && consoleLogChange(change, function () { return true; }); });
    // Debugging element dependency tree
    function ng2MobxDebug(view, renderer, observer) {
        if (!isDebugOn())
            return;
        var element = view.rootNodes[0];
        var debugElement = document.createElement('span');
        element.prepend(debugElement); // No prepend in Angular Renderer
        renderer.setElementStyle(debugElement, 'position', 'absolute');
        renderer.setElementStyle(debugElement, 'border', '1px dotted red');
        renderer.setElementStyle(debugElement, 'transform', "translateY(-25px)");
        renderer.setElementStyle(debugElement, 'cursor', 'pointer');
        renderer.setElementStyle(debugElement, 'z-index', '1000000');
        renderer.setElementStyle(debugElement, 'padding', '5px 10px');
        renderer.setElementStyle(debugElement, 'font-size', '14px');
        renderer.setElementStyle(debugElement, 'line-height', '14px');
        renderer.setElementStyle(debugElement, 'display', 'none');
        renderer.createText(debugElement, 'mobx deps');
        renderer.listen(element, 'mouseenter', function () {
            renderer.setElementStyle(debugElement, 'display', 'inline');
        });
        renderer.listen(element, 'mouseleave', function () {
            renderer.setElementStyle(debugElement, 'display', 'none');
        });
        renderer.listen(debugElement, 'click', function () {
            console.log(mobx.extras.getDependencyTree(observer));
        });
    }
    /////////////////////////////////////////////////////////
    // console logging (copied from mobx-react)
    var advicedToUseChrome = false;
    var currentDepth = 0;
    var isInsideSkippedGroup = false;
    function consoleLogChange(change, filter) {
        if (advicedToUseChrome === false && typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Chrome') === -1) {
            console.warn('The output of the MobX logger is optimized for Chrome');
            advicedToUseChrome = true;
        }
        var isGroupStart = change.spyReportStart === true;
        var isGroupEnd = change.spyReportEnd === true;
        var show;
        if (currentDepth === 0) {
            show = filter(change);
            if (isGroupStart && !show) {
                isInsideSkippedGroup = true;
            }
        }
        else if (isGroupEnd && isInsideSkippedGroup && currentDepth === 1) {
            show = false;
            isInsideSkippedGroup = false;
        }
        else {
            show = isInsideSkippedGroup !== true;
        }
        if (show && isGroupEnd) {
            groupEnd(change.time);
        }
        else if (show) {
            var logNext = isGroupStart ? group : log;
            switch (change.type) {
                case 'action':
                    // name, target, arguments, fn
                    logNext("%caction '%s' %s", 'color:dodgerblue', change.name, autoWrap('(', getNameForThis(change.target)));
                    log(change.arguments);
                    trace();
                    break;
                case 'transaction':
                    // name, target
                    logNext("%ctransaction '%s' %s", 'color:gray', change.name, autoWrap('(', getNameForThis(change.target)));
                    break;
                case 'scheduled-reaction':
                    // object
                    logNext("%cscheduled async reaction '%s'", 'color:#10a210', observableName(change.object));
                    break;
                case 'reaction':
                    // object, fn
                    logNext("%creaction '%s'", 'color:#10a210', observableName(change.object));
                    // dir({
                    //     fn: change.fn
                    // });
                    trace();
                    break;
                case 'compute':
                    // object, target, fn
                    group("%ccomputed '%s' %s", 'color:#10a210', observableName(change.object), autoWrap('(', getNameForThis(change.target)));
                    // dir({
                    //    fn: change.fn,
                    //    target: change.target
                    // });
                    groupEnd();
                    break;
                case 'error':
                    // message
                    logNext('%cerror: %s', 'color:tomato', change.message);
                    trace();
                    closeGroupsOnError();
                    break;
                case 'update':
                    // (array) object, index, newValue, oldValue
                    // (map, obbject) object, name, newValue, oldValue
                    // (value) object, newValue, oldValue
                    if (mobx.isObservableArray(change.object)) {
                        logNext('updated \'%s[%s]\': %s (was: %s)', observableName(change.object), change.index, formatValue(change.newValue), formatValue(change.oldValue));
                    }
                    else if (mobx.isObservableObject(change.object)) {
                        logNext('updated \'%s.%s\': %s (was: %s)', observableName(change.object), change.name, formatValue(change.newValue), formatValue(change.oldValue));
                    }
                    else {
                        logNext('updated \'%s\': %s (was: %s)', observableName(change.object), change.name, formatValue(change.newValue), formatValue(change.oldValue));
                    }
                    dir({
                        newValue: change.newValue,
                        oldValue: change.oldValue
                    });
                    trace();
                    break;
                case 'splice':
                    // (array) object, index, added, removed, addedCount, removedCount
                    logNext('spliced \'%s\': index %d, added %d, removed %d', observableName(change.object), change.index, change.addedCount, change.removedCount);
                    dir({
                        added: change.added,
                        removed: change.removed
                    });
                    trace();
                    break;
                case 'add':
                    // (map, object) object, name, newValue
                    logNext('set \'%s.%s\': %s', observableName(change.object), change.name, formatValue(change.newValue));
                    dir({
                        newValue: change.newValue
                    });
                    trace();
                    break;
                case 'delete':
                    // (map) object, name, oldValue
                    logNext('removed \'%s.%s\' (was %s)', observableName(change.object), change.name, formatValue(change.oldValue));
                    dir({
                        oldValue: change.oldValue
                    });
                    trace();
                    break;
                case 'create':
                    // (value) object, newValue
                    logNext('set \'%s\': %s', observableName(change.object), formatValue(change.newValue));
                    dir({
                        newValue: change.newValue
                    });
                    trace();
                    break;
                default:
                    // generic fallback for future events
                    logNext(change.type);
                    dir(change);
                    break;
            }
        }
        if (isGroupStart)
            currentDepth++;
        if (isGroupEnd)
            currentDepth--;
    }
    var consoleSupportsGroups = typeof console.groupCollapsed === 'function';
    var currentlyLoggedDepth = 0;
    function group() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // TODO: firefox does not support formatting in groupStart methods..
        consoleSupportsGroups ?
            console.groupCollapsed.apply(console, args) :
            console.log.apply(console, args);
        currentlyLoggedDepth++;
    }
    function groupEnd(time) {
        currentlyLoggedDepth--;
        if (typeof time === 'number') {
            log('%ctotal time: %sms', 'color:gray', time);
        }
        if (consoleSupportsGroups)
            console.groupEnd();
    }
    function log() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, args);
    }
    function dir() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.dir.apply(console, args);
    }
    function trace() {
        // TODO: needs wrapping in firefox?
        if (console.trace) {
            console.trace('stack'); // TODO: use stacktrace.js or similar and strip off unrelevant stuff?
        }
    }
    function closeGroupsOnError() {
        for (var i = 0, m = currentlyLoggedDepth; i < m; i++)
            groupEnd();
    }
    var closeToken = {
        '"': '"',
        '\'': '\'',
        '(': ')',
        '[': ']',
        '<': ']',
        '#': ''
    };
    function autoWrap(token, value) {
        if (!value)
            return '';
        return (token || '') + value + (closeToken[token] || '');
    }
    function observableName(object) {
        return mobx.extras.getDebugName(object);
    }
    function formatValue(value) {
        if (isPrimitive(value)) {
            if (typeof value === 'string' && value.length > 100)
                return value.substr(0, 97) + '...';
            return value;
        }
        else
            return autoWrap('(', getNameForThis(value));
    }
    function getNameForThis(who) {
        if (who === null || who === undefined) {
            return '';
        }
        else if (who && typeof who === 'object') {
            if (who && who.$mobx) {
                return who.$mobx.name;
            }
            else if (who.constructor) {
                return who.constructor.name || 'object';
            }
        }
        return "" + typeof who;
    }
    function isPrimitive(value) {
        return value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
    }
    return ng2MobxDebug;
})();

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
exports.MobxAutorunDirective = (function () {
    function MobxAutorunDirective(templateRef, viewContainer, renderer) {
        this.templateRef = templateRef;
        this.viewContainer = viewContainer;
        this.renderer = renderer;
        this.templateBindings = {};
    }
    MobxAutorunDirective.prototype.ngOnInit = function () {
        this.view = this.viewContainer.createEmbeddedView(this.templateRef);
        if (this.dispose)
            this.dispose();
        this.autoDetect(this.view);
        ng2MobxDebug(this.view, this.renderer, this.dispose);
    };
    MobxAutorunDirective.prototype.autoDetect = function (view) {
        this.dispose = mobx.autorun(function () {
            view['detectChanges']();
        });
    };
    MobxAutorunDirective.prototype.ngOnDestroy = function () {
        if (this.dispose)
            this.dispose();
    };
    return MobxAutorunDirective;
}());
exports.MobxAutorunDirective = __decorate$1([
    _angular_core.Directive({ selector: '[mobxAutorun]' }),
    __metadata("design:paramtypes", [_angular_core.TemplateRef,
        _angular_core.ViewContainerRef,
        _angular_core.Renderer])
], exports.MobxAutorunDirective);

var __extends = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$1 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
exports.MobxAutorunSyncDirective = (function (_super) {
    __extends(MobxAutorunSyncDirective, _super);
    function MobxAutorunSyncDirective(templateRef, viewContainer, renderer) {
        var _this = _super.call(this, templateRef, viewContainer, renderer) || this;
        _this.templateRef = templateRef;
        _this.viewContainer = viewContainer;
        _this.renderer = renderer;
        return _this;
    }
    MobxAutorunSyncDirective.prototype.autoDetect = function (view) {
        console.warn('mobxAutorunSync is deprected, please use mobxAutorun instead - it\'s doing exactly the same thing');
        this.dispose = mobx.autorun(function () {
            view['detectChanges']();
        });
    };
    return MobxAutorunSyncDirective;
}(exports.MobxAutorunDirective));
exports.MobxAutorunSyncDirective = __decorate$2([
    _angular_core.Directive({ selector: '[mobxAutorunSync]' }),
    __metadata$1("design:paramtypes", [_angular_core.TemplateRef,
        _angular_core.ViewContainerRef,
        _angular_core.Renderer])
], exports.MobxAutorunSyncDirective);

var __extends$1 = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$2 = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
exports.MobxReactionDirective = (function (_super) {
    __extends$1(MobxReactionDirective, _super);
    function MobxReactionDirective(templateRef, viewContainer, renderer) {
        var _this = _super.call(this, templateRef, viewContainer, renderer) || this;
        _this.templateRef = templateRef;
        _this.viewContainer = viewContainer;
        _this.renderer = renderer;
        return _this;
    }
    MobxReactionDirective.prototype.autoDetect = function (view) {
        this.dispose = mobx.reaction(this.mobxReaction, function () {
            view['detectChanges']();
        }, { fireImmediately: true });
    };
    return MobxReactionDirective;
}(exports.MobxAutorunDirective));
__decorate$3([
    _angular_core.Input(),
    __metadata$2("design:type", Object)
], exports.MobxReactionDirective.prototype, "mobxReaction", void 0);
exports.MobxReactionDirective = __decorate$3([
    _angular_core.Directive({ selector: '[mobxReaction]' }),
    __metadata$2("design:paramtypes", [_angular_core.TemplateRef,
        _angular_core.ViewContainerRef,
        _angular_core.Renderer])
], exports.MobxReactionDirective);

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DIRECTIVES = [exports.MobxAutorunDirective, exports.MobxAutorunSyncDirective, exports.MobxReactionDirective];
exports.Ng2MobxModule = (function () {
    function Ng2MobxModule() {
    }
    return Ng2MobxModule;
}());
exports.Ng2MobxModule = __decorate([
    _angular_core.NgModule({
        declarations: DIRECTIVES.slice(),
        exports: DIRECTIVES.slice(),
        imports: [],
        providers: []
    })
], exports.Ng2MobxModule);
function observable$1() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return mobx.observable.apply(void 0, args);
}
function computed$1() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return mobx.computed.apply(void 0, args);
}

exports.observable = observable$1;
exports.computed = computed$1;

Object.defineProperty(exports, '__esModule', { value: true });

})));
