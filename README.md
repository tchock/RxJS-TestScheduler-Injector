# RxJs-TestScheduler-Injector

RxJs-TestScheduler-Injector injects your ```Rx.TestScheduler``` into time related ```Rx.Observable``` operations using Jasmine spies.

## Usage

To inject your test scheduler to all operators use:

```js
RxJsTestSchedulerInjector.inject(yourTestScheduler);
```

With this you inject your scheduler to the following chainable operations:

* debounce
* throttle
* delay
* timeout
* sample

And also inject the test scheduler into these ```Rx.Observable``` operations:

* ```Rx.Observable.interval```
* ```Rx.Observable.timer```

This function returns an ```Object``` containing the created spies. If you want to access the spy for the debounce operator, use:

```js
var debounceSpy = returnedObject.debounce;
```

## Injecting to specific operators

Besides the ```inject``` method to inject to all operators there is the possibility to just inject to a single one using

```js
RxJsTestSchedulerInjector.injectInto(operation, testScheduler);
```

with the name of the operator (as a ```String```) and the test scheduler index.

This function returns the spy that injects the operator.
