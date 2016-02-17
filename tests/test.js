describe('rxjs-inject-testscheduler', function() {
  describe('inject', function() {
    beforeEach(function () {
      spyOn(injectRxJsTestScheduler, '_injectInto').and.callFake(function(key) {
        var spy = key + 'Spy';
        return spy;
      });

      injectRxJsTestScheduler._spies = {
        shouldNot: 'surviveInjection',
      };
    });

    it('should inject all methods', function() {
      var spies = injectRxJsTestScheduler.inject('scheduler');
      expect(spies).toBe(injectRxJsTestScheduler._spies);

      expect(injectRxJsTestScheduler._spies.shouldNot).toBeUndefined();

      // observable methods
      expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('interval', 'scheduler', false);
      expect(injectRxJsTestScheduler._spies.interval).toBe('intervalSpy');
      expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('timer', 'scheduler', false);
      expect(injectRxJsTestScheduler._spies.timer).toBe('timerSpy');

      // prototype methods
      expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('debounce', 'scheduler', true);
      expect(injectRxJsTestScheduler._spies.debounce).toBe('debounceSpy');
      expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('throttle', 'scheduler', true);
      expect(injectRxJsTestScheduler._spies.throttle).toBe('throttleSpy');
      expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('delay', 'scheduler', true);
      expect(injectRxJsTestScheduler._spies.delay).toBe('delaySpy');
      expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('timeout', 'scheduler', true);
      expect(injectRxJsTestScheduler._spies.timeout).toBe('timeoutSpy');
      expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('sample', 'scheduler', true);
      expect(injectRxJsTestScheduler._spies.sample).toBe('sampleSpy');
    });

    it('should inject all methods with exception', function() {
      var spies = injectRxJsTestScheduler.inject('scheduler', [
        'interval', 'debounce', 'delay', 'delaySubscription', 'timeout',
        'sample', 'timeInterval'
      ]);

      expect(injectRxJsTestScheduler._spies).toEqual({
        timer: 'timerSpy',
        throttle: 'throttleSpy',
      });

      // observable methods
      expect(injectRxJsTestScheduler._injectInto).not.toHaveBeenCalledWith('interval', 'scheduler', false);
      expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('timer', 'scheduler', false);

      // prototype methods
      expect(injectRxJsTestScheduler._injectInto).not.toHaveBeenCalledWith('debounce', 'scheduler', true);
      expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('throttle', 'scheduler', true);
      expect(injectRxJsTestScheduler._injectInto).not.toHaveBeenCalledWith('delay', 'scheduler', true);
      expect(injectRxJsTestScheduler._injectInto).not.toHaveBeenCalledWith('timeout', 'scheduler', true);
      expect(injectRxJsTestScheduler._injectInto).not.toHaveBeenCalledWith('sample', 'scheduler', true);

    });
  });

  describe('injectInto', function() {
    var prototypeOriginalsBackup;
    var observableOriginalsBackup;

    beforeEach(function () {
      spyOn(injectRxJsTestScheduler, '_injectInto').and.returnValue('injectIntoSpy');

      // Just for testing reasons (safe against changes!)
      prototypeOriginalsBackup = injectRxJsTestScheduler._originals.prototypes;
      injectRxJsTestScheduler._originals.prototypes = {
        debounce: 'prototypeMethod',
      };
      observableOriginalsBackup = injectRxJsTestScheduler._originals.observable;
      injectRxJsTestScheduler._originals.observable = {
        interval: 'observableMethod',
      };
    });

    afterEach(function () {
      injectRxJsTestScheduler._originals.prototypes = prototypeOriginalsBackup;
      injectRxJsTestScheduler._originals.observable = observableOriginalsBackup;
    });

    it('should inject scheduler into Rx.Observable method', function() {
      var injectSpy = injectRxJsTestScheduler.injectInto('interval', 'intervalScheduler');
      expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('interval', 'intervalScheduler', false);
      expect(injectSpy).toBe('injectIntoSpy');
    });

    it('should inject scheduler into Rx.Observable.prototype method', function() {
      var injectSpy = injectRxJsTestScheduler.injectInto('debounce', 'debounceScheduler');
      expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('debounce', 'debounceScheduler', true);
      expect(injectSpy).toBe('injectIntoSpy');
    });

    it('should throw error because method can\'t be injected', function() {
      expect(function() {
        injectRxJsTestScheduler.injectInto('notfound', 'notfoundScheduler');
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
        var spy = injectRxJsTestScheduler._injectInto('throttle', 'testschedulerInstance', true);
        isNoException();
        expect(jasmine.isSpy(spy)).toBeTruthy();
        spyOn(injectRxJsTestScheduler._originals.prototypes.throttle, 'apply').and.returnValue('throttleApply');
        expect(Rx.Observable.prototype.throttle).toBe(spy);
        var spyReturn = spy(100);
        expect(injectRxJsTestScheduler._originals.prototypes.throttle.apply.calls.argsFor(0)[1]).toEqual([100, 'testschedulerInstance']);
        expect(spyReturn).toBe('throttleApply');
      });

      it('should spy on a method that is called with all arguments (including scheduler)', function() {
        var spy = injectRxJsTestScheduler._injectInto('throttle', 'testschedulerInstance', true);
        isNoException();
        expect(jasmine.isSpy(spy)).toBeTruthy();
        spyOn(injectRxJsTestScheduler._originals.prototypes.throttle, 'apply').and.returnValue('throttleApply');
        expect(Rx.Observable.prototype.throttle).toBe(spy);
        var spyReturn = spy(100, 'originalScheduler');
        expect(injectRxJsTestScheduler._originals.prototypes.throttle.apply.calls.argsFor(0)[1]).toEqual([100, 'testschedulerInstance']);
        expect(spyReturn).toBe('throttleApply');
      });

      it('should spy on a method that is called with one argument missing', function() {
        var spy = injectRxJsTestScheduler._injectInto('throttle', 'testschedulerInstance', true);
        isNoException();
        expect(jasmine.isSpy(spy)).toBeTruthy();
        spyOn(injectRxJsTestScheduler._originals.prototypes.throttle, 'apply').and.returnValue('throttleApply');
        expect(Rx.Observable.prototype.throttle).toBe(spy);
        var spyReturn = spy();
        expect(injectRxJsTestScheduler._originals.prototypes.throttle.apply.calls.argsFor(0)[1]).toEqual([undefined, 'testschedulerInstance']);
        expect(spyReturn).toBe('throttleApply');
      });

      describe('debounce', function() {
        it('should spy on the debounce method and call it with argument 1 being a number', function() {
          var spy = injectRxJsTestScheduler._injectInto('debounce', 'testschedulerInstance', true);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(injectRxJsTestScheduler._originals.prototypes.debounce, 'call').and.returnValue('debounceCall');
          expect(Rx.Observable.prototype.debounce).toBe(spy);
          var spyReturn = spy(100, 'originalScheduler');
          expect(injectRxJsTestScheduler._originals.prototypes.debounce.call.calls.argsFor(0)[1]).toEqual(100);
          expect(injectRxJsTestScheduler._originals.prototypes.debounce.call.calls.argsFor(0)[2]).toEqual('testschedulerInstance');
          expect(spyReturn).toBe('debounceCall');
        });

        it('should spy on the debounce method and call it with argument 1 NOT being a number', function() {
          var spy = injectRxJsTestScheduler._injectInto('debounce', 'testschedulerInstance', true);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(injectRxJsTestScheduler._originals.prototypes.debounce, 'call').and.returnValue('debounceCall');
          expect(Rx.Observable.prototype.debounce).toBe(spy);
          var spyReturn = spy('durationSelector');
          expect(injectRxJsTestScheduler._originals.prototypes.debounce.call.calls.argsFor(0)[1]).toEqual('durationSelector');
          expect(injectRxJsTestScheduler._originals.prototypes.debounce.call.calls.argsFor(0)[2]).toBeUndefined();
          expect(spyReturn).toBe('debounceCall');
        });
      });

      describe('timeout', function() {
        it('should spy on the timeout method and call it with argument 2 being a function', function() {
          var spy = injectRxJsTestScheduler._injectInto('timeout', 'testschedulerInstance', true);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(injectRxJsTestScheduler._originals.prototypes.timeout, 'call').and.returnValue('timeoutCall');
          expect(Rx.Observable.prototype.timeout).toBe(spy);
          var spyReturn = spy('observable', function(){}, 'arg3');
          expect(injectRxJsTestScheduler._originals.prototypes.timeout.call.calls.argsFor(0)[1]).toBe('observable');
          expect(_.isFunction(injectRxJsTestScheduler._originals.prototypes.timeout.call.calls.argsFor(0)[2])).toBe(true);
          expect(injectRxJsTestScheduler._originals.prototypes.timeout.call.calls.argsFor(0)[3]).toBe('arg3');
          expect(spyReturn).toBe('timeoutCall');
        });

        it('should spy on the timeout method and call it with argument 2 NOT being a function', function() {
          var spy = injectRxJsTestScheduler._injectInto('timeout', 'testschedulerInstance', true);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(injectRxJsTestScheduler._originals.prototypes.timeout, 'call').and.returnValue('timeoutCall');
          expect(Rx.Observable.prototype.timeout).toBe(spy);
          var spyReturn = spy(100, 'observable');
          expect(injectRxJsTestScheduler._originals.prototypes.timeout.call.calls.argsFor(0)[1]).toBe(100);
          expect(injectRxJsTestScheduler._originals.prototypes.timeout.call.calls.argsFor(0)[2]).toBe('observable');
          expect(injectRxJsTestScheduler._originals.prototypes.timeout.call.calls.argsFor(0)[3]).toBe('testschedulerInstance');
          expect(spyReturn).toBe('timeoutCall');
        });
      });

      describe('delay', function() {
        it('should spy on the delay method and call it with argument 2 being a function', function() {
          var spy = injectRxJsTestScheduler._injectInto('delay', 'testschedulerInstance', true);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(injectRxJsTestScheduler._originals.prototypes.delay, 'call').and.returnValue('delayCall');
          expect(Rx.Observable.prototype.delay).toBe(spy);
          var spyReturn = spy('observable', function(){});
          expect(injectRxJsTestScheduler._originals.prototypes.delay.call.calls.argsFor(0)[1]).toBe('observable');
          expect(_.isFunction(injectRxJsTestScheduler._originals.prototypes.delay.call.calls.argsFor(0)[2])).toBe(true);
          expect(spyReturn).toBe('delayCall');
        });

        it('should spy on the delay method and call it with argument 2 NOT being a function', function() {
          var spy = injectRxJsTestScheduler._injectInto('delay', 'testschedulerInstance', true);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(injectRxJsTestScheduler._originals.prototypes.delay, 'call').and.returnValue('delayCall');
          expect(Rx.Observable.prototype.delay).toBe(spy);
          var spyReturn = spy(100, 'donotuse');
          expect(injectRxJsTestScheduler._originals.prototypes.delay.call.calls.argsFor(0)[1]).toBe(100);
          expect(injectRxJsTestScheduler._originals.prototypes.delay.call.calls.argsFor(0)[2]).toBe('testschedulerInstance');
          expect(spyReturn).toBe('delayCall');
        });
      });
    });

    describe('Rx.Observable', function() {
      it('should spy on a method that is called with all arguments (except scheduler)', function() {
        var spy = injectRxJsTestScheduler._injectInto('interval', 'testschedulerInstance', false);
        isNoException();
        expect(jasmine.isSpy(spy)).toBeTruthy();
        spyOn(injectRxJsTestScheduler._originals.observable.interval, 'apply').and.returnValue('intervalApply');
        expect(Rx.Observable.interval).toBe(spy);
        var spyReturn = spy(100);
        expect(injectRxJsTestScheduler._originals.observable.interval.apply.calls.argsFor(0)[1]).toEqual([100, 'testschedulerInstance']);
        expect(spyReturn).toBe('intervalApply');
      });

      it('should spy on a method that is called with all arguments (including scheduler)', function() {
        var spy = injectRxJsTestScheduler._injectInto('interval', 'testschedulerInstance', false);
        isNoException();
        expect(jasmine.isSpy(spy)).toBeTruthy();
        spyOn(injectRxJsTestScheduler._originals.observable.interval, 'apply').and.returnValue('intervalApply');
        expect(Rx.Observable.interval).toBe(spy);
        var spyReturn = spy(100, 'originalScheduler');
        expect(injectRxJsTestScheduler._originals.observable.interval.apply.calls.argsFor(0)[1]).toEqual([100, 'testschedulerInstance']);
        expect(spyReturn).toBe('intervalApply');
      });

      it('should spy on a method that is called with one argument missing', function() {
        var spy = injectRxJsTestScheduler._injectInto('interval', 'testschedulerInstance', false);
        isNoException();
        expect(jasmine.isSpy(spy)).toBeTruthy();
        spyOn(injectRxJsTestScheduler._originals.observable.interval, 'apply').and.returnValue('intervalApply');
        expect(Rx.Observable.interval).toBe(spy);
        var spyReturn = spy();
        expect(injectRxJsTestScheduler._originals.observable.interval.apply.calls.argsFor(0)[1]).toEqual([undefined, 'testschedulerInstance']);
        expect(spyReturn).toBe('intervalApply');
      });

      describe('timer', function() {
        it('should spy on the timer method and call it with argument 2 being a number', function() {
          var spy = injectRxJsTestScheduler._injectInto('timer', 'testschedulerInstance', false);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(injectRxJsTestScheduler._originals.observable.timer, 'call').and.returnValue('timerCall');
          expect(Rx.Observable.timer).toBe(spy);
          var spyReturn = spy(500, 100, 'donotuse');
          expect(injectRxJsTestScheduler._originals.observable.timer.call.calls.argsFor(0)[1]).toBe(500);
          expect(injectRxJsTestScheduler._originals.observable.timer.call.calls.argsFor(0)[2]).toBe(100);
          expect(injectRxJsTestScheduler._originals.observable.timer.call.calls.argsFor(0)[3]).toBe('testschedulerInstance');
          expect(spyReturn).toBe('timerCall');
        });

        it('should spy on the timer method and call it with argument 2 NOT being a number', function() {
          var spy = injectRxJsTestScheduler._injectInto('timer', 'testschedulerInstance', false);
          expect(jasmine.isSpy(spy)).toBeTruthy();
          spyOn(injectRxJsTestScheduler._originals.observable.timer, 'call').and.returnValue('timerCall');
          expect(Rx.Observable.timer).toBe(spy);
          var spyReturn = spy(500, 'donotuse');
          expect(injectRxJsTestScheduler._originals.observable.timer.call.calls.argsFor(0)[1]).toBe(500);
          expect(injectRxJsTestScheduler._originals.observable.timer.call.calls.argsFor(0)[2]).toBe('testschedulerInstance');
          expect(injectRxJsTestScheduler._originals.observable.timer.call.calls.argsFor(0)[3]).toBeUndefined();
          expect(spyReturn).toBe('timerCall');
        });
      });
    });
  });



});
