/**
 * add some syntactic sugar to qunit
 * 
 * load qunit beforehand
 * @author Torsten Hein <hein@webworx.de>
 * licence: MIT
 * 
 */
/*global test, expect, equal, deepEqual, notEqual, notDeepEqual, ok */
function describe(description, block) {
  var beforeEachFunctions, afterEachFunctions;

  beforeEachFunctions = [];
  afterEachFunctions = [];

  this.beforeEach = function (beforeEachFunction) {
    beforeEachFunctions.push(beforeEachFunction);
  };

  this.afterEach = function (afterEachFunction) {
    afterEachFunctions.push(afterEachFunction);
  };

  module(description, {
    setup: function () {
      var i;
      for (i = 0; i < beforeEachFunctions.length; i++) {
        beforeEachFunctions[i]();
      }
    },
    teardown: function () {
      var i;
      for (i = 0; i < afterEachFunctions.length; i++) {
        afterEachFunctions[i]();
      }
    }
  });

  block();
}

var xdescribe = function (description, block) {};

var it = test;
var xit = function (description, block) {};

var expectAssertions = expect;

var expect = function (actual) {

  this.toBe = function (expected) {
    deepEqual(actual, expected);
  };
  this.toBeGreaterThan = function (expected) {
    ok(actual > expected);
  };
  this.toBeNull = function () {
    deepEqual(actual, null);
  };
  this.toEqual = function (expected) {
    equal(actual, expected);
  };

  this.not = {
    toBe: function (expected) {
      notDeepEqual(actual, expected);
    },
    toBeGreaterThan: function (expected) {
      ok(actual <= expected);
    },
    toBeNull: function () {
      notDeepEqual(actual, null);
    },
    toEqual: function (expected) {
      notEqual(actual, expected);
    }
  };

  return this;
};
