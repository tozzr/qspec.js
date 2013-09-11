/**
 * add some syntactic sugar to qunit
 * 
 * load qunit beforehand
 * @author Torsten Hein <hein@webworx.de>
 * licence: MIT
 * 
 */
var _qspec = {
	nested: 0,
	beforeEachFunctions: [],
	afterEachFunctions: []
};


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
		setup: function() {
			for (var i = 0; i < beforeEachFunctions.length; i++) {
				beforeEachFunctions[i]();			
			}
		},
		teardown: function() {
			for (var i = 0; i < afterEachFunctions.length; i++) {
				afterEachFunctions[i]();			
			}
		}
	});	
	
	block();
};

xdescribe = function (description, block) {};

it = test;
xit = function (description, block) {};

expectAssertions = expect;

expect = function (actual) {
	
	this.toBe = function (expected) {
		deepEqual(actual, expected);
	};
	this.toEqual = function (expected) {
		equal(actual, expected);
	};
	this.toBeGreaterThan = function (expected) {
		ok(actual > expected);
	};
	
	this.not = {
		toBe: function (expected) {
			notDeepEqual(actual, expected);
		},
		toEqual: function (expected) {
			notEqual(actual, expected);
		}
	};
	
	return this;
};
	