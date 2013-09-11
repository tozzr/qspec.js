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

describe = function (description, block) {
	
	module(description, {
		setup: function() {
			for (var i = 0; i < _qspec.beforeEachFunctions.length; i++) {
				_qspec.beforeEachFunctions[i]();			
			}
		},
		teardown: function() {
			for (var i = 0; i < _qspec.afterEachFunctions.length; i++) {
				_qspec.afterEachFunctions[i]();			
			}
		}
	});	
	
	block();
};

xdescribe = function (description, block) {};

it = test;
xit = function (description, block) {};

beforeEach = function (beforeEachFunction) {
	_qspec.beforeEachFunctions.push(beforeEachFunction);
};

afterEach = function (afterEachFunction) {
	_qspec.afterEachFunctions.push(afterEachFunction);
};

expectAssertions = expect;

expect = function (actual) {
	
	this.toBe = function (expected) {
		deepEqual(actual, expected);
	};
	this.toEqual = function (expected) {
		equal(actual, expected);
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
	