var _ = require('lodash');
var Rx = require('rx');




var RxJsTestSchedulerInjector = {
  _originals: {
    prototypes: {
      debounce: Rx.Observable.prototype.debounce,
      throttle: Rx.Observable.prototype.throttle,
      delay: Rx.Observable.prototype.delay,
      timeout: Rx.Observable.prototype.timeout,
      sample: Rx.Observable.prototype.sample,
    },
    observable: {
      interval: Rx.Observable.interval,
      timer: Rx.Observable.timer,
    },
  },

  _spies: {},

  _injectInto: function _injectInto(method, schedulerInstance, isProto) {
    var containerObj = (isProto) ? Rx.Observable.prototype : Rx.Observable;
    var original = (isProto) ? RxJsTestSchedulerInjector._originals.prototypes[method] : RxJsTestSchedulerInjector._originals.observable[method];

    switch (method) {
      case 'timer':
        spyOn(containerObj, 'timer').and.callFake(function(arg1, arg2, arg3) {
          if (_.isNumber(arg2)) {
            return original.call(this, arg1, arg2, schedulerInstance);
          }
          return original.call(this, arg1, schedulerInstance);
        });
        break;

      case 'delay':
        spyOn(containerObj, 'delay').and.callFake(function(arg1, arg2) {
          if (_.isFunction(arg2)) {
            return original.call(this, arg1, arg2);
          }
          return original.call(this, arg1, schedulerInstance);
        });
        break;

      case 'timeout':
        spyOn(containerObj, 'timeout').and.callFake(function(arg1, arg2, arg3) {
          if (_.isFunction(arg2)) {
            return original.call(this, arg1, arg2, arg3);
          }
          return original.call(this, arg1, arg2, schedulerInstance);
        });
        break;

      case 'debounce':
        spyOn(containerObj, 'debounce').and.callFake(function(arg1, arg2) {
          if (_.isNumber(arg1)) {
            return original.call(this, arg1, schedulerInstance);
          }
          return original.call(this, arg1);
        });
        break;
      default:
        spyOn(containerObj, method).and.callFake(function(arg1, arg2, arg3) {
          var _arguments = [arg1, arg2, arg3];
          var args = [];

          for (var i = 0; i < original.length; i++) {
            args[i] = _arguments[i];
          }

          args[args.length - 1] = schedulerInstance;
          return original.apply(this, args);
        });
    }

    return containerObj[method];
  },

  injectInto: function injectInto(method, schedulerInstance) {
    if (_.has(RxJsTestSchedulerInjector._originals.prototypes, method)) {
      return RxJsTestSchedulerInjector._injectInto(method, schedulerInstance, true);
    } else if (_.has(RxJsTestSchedulerInjector._originals.observable, method)) {
      return RxJsTestSchedulerInjector._injectInto(method, schedulerInstance, false);
    } else {
      throw new Error('The method "' + method + '" can\'t be injected with a scheduler');
    }
  },

  inject: function inject(schedulerInstance, exceptions) {
    var _exceptions = exceptions || [];
    RxJsTestSchedulerInjector._spies = {};
    _.forEach(RxJsTestSchedulerInjector._originals.observable, function(original, method) {
      if (!_.includes(_exceptions, method)) {
        RxJsTestSchedulerInjector._spies[method] = RxJsTestSchedulerInjector._injectInto(method, schedulerInstance, false);
      }
    });

    _.forEach(RxJsTestSchedulerInjector._originals.prototypes, function(original, method) {
      if (!_.includes(_exceptions, method)) {
        RxJsTestSchedulerInjector._spies[method] = RxJsTestSchedulerInjector._injectInto(method, schedulerInstance, true);
      }
    });

    return RxJsTestSchedulerInjector._spies;
  },
}

module.exports = RxJsTestSchedulerInjector;
