describe('rx-inject-testscheduler', function() {

  it('should inject all methods', function() {
    spyOn(injectRxJsTestScheduler, '_injectInto').and.callFake(function(key) {
      var spy = key + 'Spy';
      return spy;
    });

    injectRxJsTestScheduler._spies = {
      shouldNot: 'surviveInjection',
    };

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
    expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('delaySubscription', 'scheduler', true);
    expect(injectRxJsTestScheduler._spies.delaySubscription).toBe('delaySubscriptionSpy');
    expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('timeout', 'scheduler', true);
    expect(injectRxJsTestScheduler._spies.timeout).toBe('timeoutSpy');
    expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('sample', 'scheduler', true);
    expect(injectRxJsTestScheduler._spies.sample).toBe('sampleSpy');
    expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('bufferWithTime', 'scheduler', true);
    expect(injectRxJsTestScheduler._spies.bufferWithTime).toBe('bufferWithTimeSpy');
    expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('windowWithTime', 'scheduler', true);
    expect(injectRxJsTestScheduler._spies.windowWithTime).toBe('windowWithTimeSpy');
    expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('timeInterval', 'scheduler', true);
    expect(injectRxJsTestScheduler._spies.timeInterval).toBe('timeIntervalSpy');
  });

  describe('injectInto', function() {
    beforeEach(function () {
      spyOn(injectRxJsTestScheduler, '_injectInto').and.returnValue('injectIntoSpy');

      // Just for testing reasons (safe against changes!)
      injectRxJsTestScheduler._originals.prototypes = {
        debounce: 'prototypeMethod',
      };
      injectRxJsTestScheduler._originals.observable = {
        interval: 'observableMethod',
      };
    });

    it('should inject scheduler into Rx.Observable method', function() {
      var injectSpy = injectRxJsTestScheduler.injectInto('interval', 'intervalScheduler');
      expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('interval', 'debounceScheduler', false);
      expect(injectSpy).toBe('injectIntoSpy');
    });

    it('should inject scheduler into Rx.Observable.prototyp method', function() {
      var injectSpy = injectRxJsTestScheduler.injectInto('debouce', 'debouceScheduler');
      expect(injectRxJsTestScheduler._injectInto).toHaveBeenCalledWith('debounce', 'debounceScheduler', true);
      expect(injectSpy).toBe('injectIntoSpy');
    });

    it('should throw error because method can\' be injected', function() {
      expect(function() {
        injectRxJsTestScheduler.injectInto('notfound', 'notfoundScheduler');
      }).toThrowError('The method "notfound" can\'t be injected with a scheduler');
    });
  });


});