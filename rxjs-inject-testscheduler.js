var injectRxJsTestScheduler = {
  _originals: {
    prototypes: {
      debounce: Rx.Observable.prototype.debounce,
      throttle: Rx.Observable.prototype.throttle,
      delay: Rx.Observable.prototype.delay,
      delaySubscription: Rx.Observable.prototype.delaySubscription,
      timeout: Rx.Observable.prototype.timeout,
      sample: Rx.Observable.prototype.sample,
      bufferWithTime: Rx.Observable.prototype.bufferWithTime,
      windowWithTime: Rx.Observable.prototype.windowWithTime,
      timeInterval: Rx.Observable.prototype.timeInterval,
    },
    observable: {
      interval: Rx.Observable.inverval,
      timer: Rx.Observable.timer,
    },
  },

  _spies: {},

  _injectInto: function _injectInto(method, schedulerInstance, isProto) {
    var containerObj = (isProto) ? Rx.Observable.prototype : Rx.Observable;
    var original = (isProto) ? injectRxJsTestScheduler_originals.prototypes[method] : injectRxJsTestScheduler._originals.observable[method];

    switch (method) {
      case 'timeout':
        spyOn(containerObj, 'timeout').and.callFake(function() {
          if (!_.isFunction(args[1])) {
            return original.call(this, args[0], args[1], schedulerInstance);
          }
          return original.apply(this, args);
        });
        break;

      case 'bufferWithTime':
        spyOn(containerObj, 'bufferWithTime').and.callFake(function() {
          if (_.isNumber(args[1])) {
            return original.call(this, args[0], args[1], schedulerInstance);
          }
          return original.call(this, args[0], schedulerInstance);
        });
        break;

      case 'windowWithTime':
        spyOn(containerObj, 'windowWithTime').and.callFake(function() {
          if (_.isNumber(args[1])) {
            return original.apply(this, args);
          }
          return original.call(this, args[0], schedulerInstance);
        });
        break;
      default:
        spyOn(containerObj, method).and.callFake(function() {
          var args = [];
          for (var i = 0; i < original.length; i++) {
            args[i] = arguments[i];
          }

          args[args.length-1] = schedulerInstance;
          return original.apply(this, args);
        });
    }

    return containerObj[method];
  },

  injectInto: function injectInto(method, schedulerInstance) {
    if (_.has(injectRxJsTestScheduler._originals.prototypes, method)) {
      return injectRxJsTestScheduler._injectInto(method, schedulerInstance, true);
    } else if (_.has(injectRxJsTestScheduler._originals.observable, method)) {
      return injectRxJsTestScheduler._injectInto(method, schedulerInstance, false);
    } else {
      throw new Error('The method "' + method + '" can\'t be injected with a scheduler');
    }
  },

  inject: function inject(schedulerInstance, exceptions) {
    var _exceptions = exceptions || [];
    injectRxJsTestScheduler._spies = {};
    _.forEach(injectRxJsTestScheduler._originals.observable, function(original, method) {
      if (!_.includes(_exceptions, method)) {
        injectRxJsTestScheduler._spies[method] = injectRxJsTestScheduler._injectInto(method, schedulerInstance, false);
      }
    });

    _.forEach(injectRxJsTestScheduler._originals.prototypes, function(original, method) {
      if (!_.includes(_exceptions, method)) {
        injectRxJsTestScheduler._spies[method] = injectRxJsTestScheduler._injectInto(method, schedulerInstance, true);
      }
    });

    return injectRxJsTestScheduler._spies;
  },
};
