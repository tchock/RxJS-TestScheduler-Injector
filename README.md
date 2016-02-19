# RxJs-TestScheduler-Injector

RxJs-TestScheduler-Injector injects your ```Rx.TestScheduler``` into time related ```Rx.Observable``` operations using Jasmine spies.

## Installation

Just use bower to install RxJs-TestScheduler-Injector:

```
bower install rxjs-testscheduler-injector --save-dev
```

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

### Handling exceptions

The `inject()` method also has the ability to exclude some methods when injecting the `TestScheduler`:

```js
RxJsTestSchedulerInjector.inject(yourTestScheduler, ['debouce', 'inverval', 'delay']);
```

The exceptions always have to be passed as an array of method names (look for possible methods in the lists above).

## Injecting to specific operators

Besides the `inject` method to inject to all operators there is the possibility to just inject to a single one using

```js
RxJsTestSchedulerInjector.injectInto(operatorName, testScheduler);
```

with the name of the operator (as a ```String```) and the test scheduler index.

This function returns the spy that injects the operator.
