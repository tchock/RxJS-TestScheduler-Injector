describe('rxjs-inject-testscheduler', function() {
  describe('inject', function() {
    beforeEach(function () {
      spyOn(RxJsTestSchedulerInjector, '_injectInto').and.callFake(function(key) {
        var spy = key + 'Spy';
        return spy;
      });

      RxJsTestSchedulerInjector._spies = {
        shouldNot: 'surviveInjection',
      };
    });

    it('should inject all methods', function() {
      var spies = RxJsTestSchedulerInjector.inject('scheduler');
      expect(spies).toBe(RxJsTestSchedulerInjector._spies);

      expect(RxJsTestSchedulerInjector._spies.shouldNot).toBeUndefined();

      // observable methods
      expect(RxJsTestSchedulerInjector._injectInto).toHaveBeenCalledWith('interval', 'scheduler', false);
      expect(RxJsTestSchedulerInjector._spies.interval).toBe('intervalSpy');
      expect(RxJsTestSchedulerInjector._injectInto).toHaveBeenCalledWith('timer', 'scheduler', false);
      expect(RxJsTestSchedulerInjector._spies.timer).toBe('timerSpy');

      // prototype methods
      expect(RxJsTestSchedulerInjector._injectInto).toHaveBeenCalledWith('debounce', 'scheduler', true);
      expect(RxJsTestSchedulerInjector._spies.debounce).toBe('debounceSpy');
      expect(RxJsTestSchedulerInjector._injectInto).toHaveBeenCalledWith('throttle', 'scheduler', true);
      expect(RxJsTestSchedulerInjector._spies.throttle).toBe('throttleSpy');
      expect(RxJsTestSchedulerInjector._injectInto).toHaveBeenCalledWith('delay', 'scheduler', true);
      expect(RxJsTestSchedulerInjector._spies.delay).toBe('delaySpy');
      expect(RxJsTestSchedulerInjector._injectInto).toHaveBeenCalledWith('timeout', 'scheduler', true);
      expect(RxJsTestSchedulerInjector._spies.timeout).toBe('timeoutSpy');
      expect(RxJsTestSchedulerInjector._injectInto).toHaveBeenCalledWith('sample', 'scheduler', true);
      expect(RxJsTestSchedulerInjector._spies.sample).toBe('sampleSpy');
    });

    it('should inject all methods with exception', function() {
      var spies = RxJsTestSchedulerInjector.inject('scheduler', [
        'interval', 'debounce', 'delay', 'delaySubscription', 'timeout',
        'sample', 'timeInterval'
      ]);

      expect(RxJsTestSchedulerInjector._spies).toEqual({
        timer: 'timerSpy',
        throttle: 'throttleSpy',
      });

      // observable methods
      expect(RxJsTestSchedulerInjector._injectInto).not.toHaveBeenCalledWith('interval', 'scheduler', false);
      expect(RxJsTestSchedulerInjector._injectInto).toHaveBeenCalledWith('timer', 'scheduler', false);

      // prototype methods
      expect(RxJsTestSchedulerInjector._injectInto).not.toHaveBeenCalledWith('debounce', 'scheduler', true);
      expect(RxJsTestSchedulerInjector._injectInto).toHaveBeenCalledWith('throttle', 'scheduler', true);
      expect(RxJsTestSchedulerInjector._injectInto).not.toHaveBeenCalledWith('delay', 'scheduler', true);
      expect(RxJsTestSchedulerInjector._injectInto).not.toHaveBeenCalledWith('timeout', 'scheduler', true);
      expect(RxJsTestSchedulerInjector._injectInto).not.toHaveBeenCalledWith('sample', 'scheduler', true);

    });
  });

  describe('injectInto', function() {
    var prototypeOriginalsBackup;
    var observableOriginalsBackup;

    beforeEach(function () {
      spyOn(RxJsTestSchedulerInjector, '_injectInto').and.returnValue('injectIntoSpy');

      // Just for testing reasons (safe against changes!)
      prototypeOriginalsBackup = RxJsTestSchedulerInjector._originals.prototypes;
      RxJsTestSchedulerInjector._originals.prototypes = {
        debounce: 'prototypeMethod',
      };
      observableOriginalsBackup = RxJsTestSchedulerInjector._originals.observable;
      RxJsTestSchedulerInjector._originals.observable = {
        interval: 'observableMethod',
      };
    });

    afterEach(function () {
      RxJsTestSchedulerInjector._originals.prototypes = prototypeOriginalsBackup;
      RxJsTestSchedulerInjector._originals.observable = observableOriginalsBackup;
    });

    it('should inject scheduler into Rx.Observable method', function() {
      var injectSpy = RxJsTestSchedulerInjector.injectInto('interval', 'intervalScheduler');
      expect(RxJsTestSchedulerInjector._injectInto).toHaveBeenCalledWith('interval', 'intervalScheduler', false);
      expect(injectSpy).toBe('injectIntoSpy');
    });

    it('should inject scheduler into Rx.Observable.prototype method', function() {
      var injectSpy = RxJsTestSchedulerInjector.injectInto('debounce', 'debounceScheduler');
      expect(RxJsTestSchedulerInjector._injectInto).toHaveBeenCalledWith('debounce', 'debounceScheduler', true);
      expect(injectSpy).toBe('injectIntoSpy');
    });

    it('should throw error because method can\'t be injected', function() {
      expect(function() {
        RxJsTestSchedulerInjector.injectInto('notfound', 'notfoundScheduler');
      }).toThrowError('The method "notfound" can\'t be injected with a scheduler');
    });
  });

  describe('_injectInto', function() {
    function isNoException() {
      expect(jasmine.isSpy(Rx.Observable.prototype.timeout)).toBe(false);
      expect(jasmine.isSpy(Rx.Observable.prototype.debounce)).toBe(false);
      expect(jasmine.isSpy(Rx.Observable.timer)).toBe(false);
    }

    describe('Rx.Observable.prototype', function() {
      it('should spy on a method that is called with all arguments (except scheduler)', function() {
        var spy = RxJsTestSchedulerInjector._injectInto('throttle', 'testschedulerInstance', true);
        isNoException();
        expect(jasmine.isSpy(spy)).toBeTruthy();
        spyOn(RxJsTestSchedulerInjector._originals.prototypes.throttle, 'apply').and.returnValue('throttleApply');
        expect(Rx.Observable.prototype.throttle).toBe(spy);
        var spyReturn = spy(100);
        expect(RxJsTestSchedulerInjector._originals.prototypes.throttle.apply.calls.argsFor(0)[1]).toEqual([100, 'testschedulerInstance']);
        expect(spyReturn).toBe('throttleApply');
      });

      it('should spy on a method that is called with all arguments (including scheduler)', function() {
        var spy = RxJsTestSchedulerInjector._injectInto('throttle', 'testschedulerInstance', true);
        isNoException();
        expect(jasmine.isSpy(spy)).toBeTruthy();
        spyOn(RxJsTestSchedulerInjector._originals.prototypes.throttle, 'apply').and.returnValue('throttleApply');
        expect(Rx.Observable.prototype.throttle).toBe(spy);
        var spyReturn = spy(100, 'originalScheduler');
        expect(RxJsTestSchedulerInjector._originals.prototypes.throttle.apply.calls.argsFor(0)[1]).toEqual([100, 'testschedulerInstance']);
        expect(spyReturn).toBe('throttleApply');
      });

      it('should spy on a method that is called with one argument missing', function() {
        var spy = RxJsTestSchedulerInjector._injectInto('throttle', 'testschedulerInstance', true);
        isNoException();
        expect(jasmine.isSpy(spy)).toBeTruthy();
        spyOn(RxJsTestSchedulerInjector._originals.prototypes.throttle, 'apply').and.returnValue('throttleApply');
        expect(Rx.Observable.prototype.throttle).toBe(spy);
        var spyReturn = spy();
        expect(RxJsTestSchedulerInjector._originals.prototypes.throttle.apply.calls.argsFor(0)[1]).toEqual([undefined, 'testschedulerInstance']);
        expect(spyReturn).toBe('throttleApply');
      });

      describe('debounce', function() {
        it('should spy on the debounce method and call it with argument 1 being a number', function() {
          var spy = RxJsTestSchedulerInjector._injectInto('debounce', 'testschedulerInstance', true);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(RxJsTestSchedulerInjector._originals.prototypes.debounce, 'call').and.returnValue('debounceCall');
          expect(Rx.Observable.prototype.debounce).toBe(spy);
          var spyReturn = spy(100, 'originalScheduler');
          expect(RxJsTestSchedulerInjector._originals.prototypes.debounce.call.calls.argsFor(0)[1]).toEqual(100);
          expect(RxJsTestSchedulerInjector._originals.prototypes.debounce.call.calls.argsFor(0)[2]).toEqual('testschedulerInstance');
          expect(spyReturn).toBe('debounceCall');
        });

        it('should spy on the debounce method and call it with argument 1 NOT being a number', function() {
          var spy = RxJsTestSchedulerInjector._injectInto('debounce', 'testschedulerInstance', true);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(RxJsTestSchedulerInjector._originals.prototypes.debounce, 'call').and.returnValue('debounceCall');
          expect(Rx.Observable.prototype.debounce).toBe(spy);
          var spyReturn = spy('durationSelector');
          expect(RxJsTestSchedulerInjector._originals.prototypes.debounce.call.calls.argsFor(0)[1]).toEqual('durationSelector');
          expect(RxJsTestSchedulerInjector._originals.prototypes.debounce.call.calls.argsFor(0)[2]).toBeUndefined();
          expect(spyReturn).toBe('debounceCall');
        });
      });

      describe('timeout', function() {
        it('should spy on the timeout method and call it with argument 2 being a function', function() {
          var spy = RxJsTestSchedulerInjector._injectInto('timeout', 'testschedulerInstance', true);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(RxJsTestSchedulerInjector._originals.prototypes.timeout, 'call').and.returnValue('timeoutCall');
          expect(Rx.Observable.prototype.timeout).toBe(spy);
          var spyReturn = spy('observable', function(){}, 'arg3');
          expect(RxJsTestSchedulerInjector._originals.prototypes.timeout.call.calls.argsFor(0)[1]).toBe('observable');
          expect(_.isFunction(RxJsTestSchedulerInjector._originals.prototypes.timeout.call.calls.argsFor(0)[2])).toBe(true);
          expect(RxJsTestSchedulerInjector._originals.prototypes.timeout.call.calls.argsFor(0)[3]).toBe('arg3');
          expect(spyReturn).toBe('timeoutCall');
        });

        it('should spy on the timeout method and call it with argument 2 NOT being a function', function() {
          var spy = RxJsTestSchedulerInjector._injectInto('timeout', 'testschedulerInstance', true);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(RxJsTestSchedulerInjector._originals.prototypes.timeout, 'call').and.returnValue('timeoutCall');
          expect(Rx.Observable.prototype.timeout).toBe(spy);
          var spyReturn = spy(100, 'observable');
          expect(RxJsTestSchedulerInjector._originals.prototypes.timeout.call.calls.argsFor(0)[1]).toBe(100);
          expect(RxJsTestSchedulerInjector._originals.prototypes.timeout.call.calls.argsFor(0)[2]).toBe('observable');
          expect(RxJsTestSchedulerInjector._originals.prototypes.timeout.call.calls.argsFor(0)[3]).toBe('testschedulerInstance');
          expect(spyReturn).toBe('timeoutCall');
        });
      });

      describe('delay', function() {
        it('should spy on the delay method and call it with argument 2 being a function', function() {
          var spy = RxJsTestSchedulerInjector._injectInto('delay', 'testschedulerInstance', true);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(RxJsTestSchedulerInjector._originals.prototypes.delay, 'call').and.returnValue('delayCall');
          expect(Rx.Observable.prototype.delay).toBe(spy);
          var spyReturn = spy('observable', function(){});
          expect(RxJsTestSchedulerInjector._originals.prototypes.delay.call.calls.argsFor(0)[1]).toBe('observable');
          expect(_.isFunction(RxJsTestSchedulerInjector._originals.prototypes.delay.call.calls.argsFor(0)[2])).toBe(true);
          expect(spyReturn).toBe('delayCall');
        });

        it('should spy on the delay method and call it with argument 2 NOT being a function', function() {
          var spy = RxJsTestSchedulerInjector._injectInto('delay', 'testschedulerInstance', true);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(RxJsTestSchedulerInjector._originals.prototypes.delay, 'call').and.returnValue('delayCall');
          expect(Rx.Observable.prototype.delay).toBe(spy);
          var spyReturn = spy(100, 'donotuse');
          expect(RxJsTestSchedulerInjector._originals.prototypes.delay.call.calls.argsFor(0)[1]).toBe(100);
          expect(RxJsTestSchedulerInjector._originals.prototypes.delay.call.calls.argsFor(0)[2]).toBe('testschedulerInstance');
          expect(spyReturn).toBe('delayCall');
        });
      });
    });

    describe('Rx.Observable', function() {
      it('should spy on a method that is called with all arguments (except scheduler)', function() {
        var spy = RxJsTestSchedulerInjector._injectInto('interval', 'testschedulerInstance', false);
        isNoException();
        expect(jasmine.isSpy(spy)).toBeTruthy();
        spyOn(RxJsTestSchedulerInjector._originals.observable.interval, 'apply').and.returnValue('intervalApply');
        expect(Rx.Observable.interval).toBe(spy);
        var spyReturn = spy(100);
        expect(RxJsTestSchedulerInjector._originals.observable.interval.apply.calls.argsFor(0)[1]).toEqual([100, 'testschedulerInstance']);
        expect(spyReturn).toBe('intervalApply');
      });

      it('should spy on a method that is called with all arguments (including scheduler)', function() {
        var spy = RxJsTestSchedulerInjector._injectInto('interval', 'testschedulerInstance', false);
        isNoException();
        expect(jasmine.isSpy(spy)).toBeTruthy();
        spyOn(RxJsTestSchedulerInjector._originals.observable.interval, 'apply').and.returnValue('intervalApply');
        expect(Rx.Observable.interval).toBe(spy);
        var spyReturn = spy(100, 'originalScheduler');
        expect(RxJsTestSchedulerInjector._originals.observable.interval.apply.calls.argsFor(0)[1]).toEqual([100, 'testschedulerInstance']);
        expect(spyReturn).toBe('intervalApply');
      });

      it('should spy on a method that is called with one argument missing', function() {
        var spy = RxJsTestSchedulerInjector._injectInto('interval', 'testschedulerInstance', false);
        isNoException();
        expect(jasmine.isSpy(spy)).toBeTruthy();
        spyOn(RxJsTestSchedulerInjector._originals.observable.interval, 'apply').and.returnValue('intervalApply');
        expect(Rx.Observable.interval).toBe(spy);
        var spyReturn = spy();
        expect(RxJsTestSchedulerInjector._originals.observable.interval.apply.calls.argsFor(0)[1]).toEqual([undefined, 'testschedulerInstance']);
        expect(spyReturn).toBe('intervalApply');
      });

      describe('timer', function() {
        it('should spy on the timer method and call it with argument 2 being a number', function() {
          var spy = RxJsTestSchedulerInjector._injectInto('timer', 'testschedulerInstance', false);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(RxJsTestSchedulerInjector._originals.observable.timer, 'call').and.returnValue('timerCall');
          expect(Rx.Observable.timer).toBe(spy);
          var spyReturn = spy(500, 100, 'donotuse');
          expect(RxJsTestSchedulerInjector._originals.observable.timer.call.calls.argsFor(0)[1]).toBe(500);
          expect(RxJsTestSchedulerInjector._originals.observable.timer.call.calls.argsFor(0)[2]).toBe(100);
          expect(RxJsTestSchedulerInjector._originals.observable.timer.call.calls.argsFor(0)[3]).toBe('testschedulerInstance');
          expect(spyReturn).toBe('timerCall');
        });

        it('should spy on the timer method and call it with argument 2 NOT being a number', function() {
          var spy = RxJsTestSchedulerInjector._injectInto('timer', 'testschedulerInstance', false);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(RxJsTestSchedulerInjector._originals.observable.timer, 'call').and.returnValue('timerCall');
          expect(Rx.Observable.timer).toBe(spy);
          var spyReturn = spy(500, 'donotuse');
          expect(RxJsTestSchedulerInjector._originals.observable.timer.call.calls.argsFor(0)[1]).toBe(500);
          expect(RxJsTestSchedulerInjector._originals.observable.timer.call.calls.argsFor(0)[2]).toBe('testschedulerInstance');
          expect(RxJsTestSchedulerInjector._originals.observable.timer.call.calls.argsFor(0)[3]).toBeUndefined();
          expect(spyReturn).toBe('timerCall');
        });
      });
    });
  });



});
