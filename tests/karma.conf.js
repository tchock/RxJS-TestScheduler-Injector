// Karma configuration
// Generated on Tue Jul 07 2015 12:45:02 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({
    basePath: '../',
    reportSlowerThan: 100,

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],



    // list of files / patterns to load in the browser
    files: [
      'bower_components/lodash/lodash.js',
      'bower_components/rxjs/dist/rx.lite.js',
      'bower_components/rxjs/dist/rx.async.js',
      'bower_components/rxjs/dist/rx.virtualtime.js',
      'bower_components/rxjs/dist/rx.testing.js',
      'rxjs-testscheduler-injector.js',
      'tests/test.js',
    ],

    // list of files to exclude
    exclude: [],

    preprocessors: {
      'rxjs-testscheduler-injector.js': [
        'coverage'
      ]
    },

    reporters: ['spec' , 'coverage' ],


    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
