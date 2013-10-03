/**
 * 
 * add some syntactic sugar to qunit
 * 
 * note: load qunit beforehand
 * @author Torsten Hein <hein@webworx.de>
 * licence: MIT
 * 
 */
/*global window, test, expect, equal, deepEqual, notEqual, notDeepEqual, ok */

(function (global) {
  var util = {
    each: function (object, callback) {
      if (object === undefined || callback === undefined || object === null || callback === null) {
          throw new Error("both 'target' and 'callback' arguments are required");
      }
      var name,
          i = 0,
          length = object.length,
          value;

      if (length === undefined) {
        for (name in object) {
          if (object.hasOwnProperty(name)) {
            if (callback.call(object[name], name, object[name]) === false) {
                break;
            }
          }
        }
      } else {
          value = object[0];
          while (i < length && callback.call(value, i, value) !== false) {
            value = object[++i];
          }
      }

      return object;
    },
    extend: function (dest, src) {
      if (dest === undefined || src === undefined || dest === null || src === null) {
          throw new Error("both 'source' and 'target' arguments " +
                          "are required");
      }
      var prop;
      for (prop in src) {
          if (src.hasOwnProperty(prop)) {
              dest[prop] = src[prop];
          }
      }
    }
  };

  var rollup = function (example, prop) {
    var items = [];
    while (example !== null) {
      items.push(example[prop]);
      example = example.parent;
    }
    return items;
  };

  var examples = [],
    currentExample = null;

  function Example(parent) {
    if (parent) {
      this.parent = parent;
      this.parent.children.push(this);
    } else {
      this.parent = null;
      examples.push(this);
    }

    this.children = [];
    this.specs = [];
  }

  util.extend(Example.prototype, {
    name: '',
    beforeEach: function () {},
    afterEach: function () {},
    beforeEachs: function () {
      return rollup(this, 'beforeEach').reverse();
    },
    afterEachs: function () {
      return rollup(this, 'afterEach');
    },
    names: function () {
      return rollup(this, 'name').reverse().join(', ');
    }
  });

  function ExpectationHandler(value, not) {
    this.value = value;
    this.isNot = not || false;
    
    if (!this.isNot)
        this.not = new ExpectationHandler(value, true);

    this.evaluate = function(expression) {
      return this.isNot ? !expression : expression;
    };
  }

  util.extend(ExpectationHandler.prototype, {
    toBe: function(expected) {
      if (this.isNot)
        ok(this.value !== expected, 'expected ' + this.value + ' not to be ' + expected);
      else
        ok(this.value === expected, 'expected ' + this.value + ' to be ' + expected);
    },
    toBeDefined: function() {
      if (this.isNot)
        ok(this.value === undefined, 'expected ' + this.value + ' not to be defined');
      else
        ok(this.value !== undefined, 'expected ' + this.value + ' to be defined');
    },
    toBeGreaterThan: function (expected) {
      var result = this.evaluate(this.value > expected);
      ok(result, 'expected ' + this.value + (this.isNot ? ' not' : '') + ' to be greater than ' + expected);
    },
    toBeLessThan: function (expected) {
      var result = this.evaluate(this.value < expected);
      ok(result, 'expected ' + this.value + (this.isNot ? ' not' : '') + ' to be less than ' + expected);
    },
    toBeUndefined: function() {
      if (this.isNot)
        ok(this.value !== undefined, 'expected ' + this.value + ' not to be undefined');
      else
        ok(this.value === undefined, 'expected ' + this.value + ' to be undefined');
    },
    toEqual: function(expected) {
      if (this.isNot)
        notDeepEqual(this.value, expected, 'not to equal');
      else
        deepEqual(this.value, expected, 'to equal');
    },
    toThrow: function (actual, expectedError, message) {
      // can optionally accept expected error message string or object
      try {
          actual();
          ok(false, message);
      } catch (e) {
          if (expectedError === undefined) {
              // e always === e so assertion always passes
              ok(e === e, message);
          } else if (typeof e === 'string') {
              ok(e === expectedError, message);
          } else if (typeof e === 'object') {
              if (typeof expectedError === 'object') {
                  ok(e.name === expectedError.name && e.message === expectedError.message, message);
              } else if(typeof expectedError === 'string')  {
                  ok(e.message === expectedError, message);
              }
          }
      }
    }
  });

  global.describe = function (description, fn) {
    if (arguments.length < 2) {
      throw new Error("both 'description' and 'fn' arguments " +
                        "are required");
    }

    this.beforeEach = function (fn) {
      if (arguments.length === 0) {
          throw new Error("'fn' argument is required");
      }
      currentExample.beforeEach = fn;
    };

    this.afterEach = function (fn) {
      if (arguments.length === 0) {
          throw new Error("'fn' argument is required");
      }
      currentExample.afterEach = fn;
    };

    var originalExample = currentExample;
    try {
      currentExample = new Example(currentExample);
      currentExample.name = description;
      fn();
    } finally {
      currentExample = originalExample;
    }
  };

  global.xdescribe = function (description, fn) {};

  global.context = global.describe;

  global.it = function (specification, fn) {
    var spec = specification;
    if (arguments.length === 0) {
      throw new Error("'specification' argument is required");
    }
    if (fn) {
      if (fn.async) {
          spec += " asynchronously";
      }
      currentExample.specs.push([spec, fn]);
    } else {
      // if not passed an implementation, create an implementation
      // that simply asserts fail
      it(spec, function () { fail('Not Implemented'); });
    }

    this.expect = expect;
  };

  var expect = function (value) {
    return new ExpectationHandler(value);
  };

  global.xit = function (specification, fn) {};

  global.pause = function () {
    stop();
  };

  global.resume = function () {
    start();
  };

  global.async = function (fn) {
    var implementation = function () {
        pause();
        fn.apply(this, arguments);
    };
    implementation.async = true;
    return implementation;
  };
  
  global.wait = function (ms, fn) {
    if (arguments.length < 2) {
      throw new Error("both 'ms' and 'fn' arguments are required");
    }
    pause();
    global.setTimeout(function () {
      fn();
      resume();
    }, ms);
  };

  global.fail = function (message) {
    ok(false, message);
  };

  function compileAndExecute() {
    var statements = [];

    /**
     * Compiles a single example and its children into QUnit statements
     * @param {Example} example Single example instance
     * possibly with nested instances
     */
    var compileDescription = function (example) {
        // get before and after rollups
        var beforeEachs = example.beforeEachs(),
          afterEachs = example.afterEachs();

        // create a module with setup and teardown
        // that executes all current befores/afters
        statements.push(function () {
            module(example.names(), {
                setup: function () {
                    util.each(beforeEachs, function () { this(); });
                },
                teardown: function () {
                    util.each(afterEachs, function () { this(); });
                }
            });
        });

        // create a test for each spec/"it" in the example
        util.each(example.specs, function () {
          var spec = this;
          statements.push(function () {
            test(spec[0], spec[1]);
          });
        });

        // recurse through example's nested examples
        util.each(example.children, function () {
          compileDescription(this);
        });
    };

    // compile all root examples
    util.each(examples, function () {
      compileDescription(this, statements);
    });

    // execute all statements
    util.each(statements, function () { this(); });
  }

  global.expectAssertions = QUnit.expect;

  global.qspec = {
    version: '0.1.0',
    execute: function() {
      compileAndExecute();
    }
  };



}(window));
