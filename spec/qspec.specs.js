module("Standard QUnit module");
var firstStandardQUnitTestRan = false;
test("should be able to run before qspec", function() {
    expectAssertions(1);
    firstStandardQUnitTestRan = true;
    ok(firstStandardQUnitTestRan);
});

describe("describe()", function() {
    var variableDefinedInDescribe = "y";
    var beforeCalls = [];
    var afterCalls = [];

    var beforeCallCount = 0;
    beforeEach(function() {
        beforeCallCount++;
        beforeCalls.push('x');
    });

    var afterCallCount = 0;
    afterEach(function() {
        afterCallCount++;
        afterCalls.push('y');
    });

    it("should throw exception if not passed a description and fn", function(){
        expect(function(){
            describe("some description");
        }).toThrow("both 'description' and 'fn' arguments are required");
        expect(function(){
            describe(function(){});
        }).toThrow("both 'description' and 'fn' arguments are required");
    });

    it("should throw exception when beforeEach() not passed an fn", function(){
        expect(function(){
            beforeEach();
        }).toThrow("'fn' argument is required");
    });

    it("should throw exception when afterEach() not passed an fn", function(){
        expect(function(){
            afterEach();
        }).toThrow("'fn' argument is required");
    });

    it("should execute lambda", function() {
        // implicitly true by virtue of this running
        expect(true).toBe(true);
    });

    it("should execute beforeEach() before each it()", function() {
        expect(beforeCallCount).toBe(5);
        expect(afterCallCount).toBe(4);
    });

    it("should execute afterEach() after each it()", function() {
        expect(beforeCallCount).toBe(6);
        expect(afterCallCount).toBe(5);
    });

    describe("with a nested describe()", function() {
        var variableDefinedInNestedDescribe = "x";

        beforeEach(function() {
            beforeCalls.push('a');
        });

        afterEach(function() {
            afterCalls.push('b');
        });

        it("should execute all beforeEach()s from outside-in", function() {
            expect(beforeCalls).toEqual(['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'a']);
            expect(afterCalls).toEqual(['y', 'y', 'y', 'y', 'y', 'y', 'y']);
        });

        it("should execute all afterEach()s from inside-out", function() {
            expect(beforeCalls).toEqual(['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'a', 'x', 'a']);
            expect(afterCalls).toEqual(['y', 'y', 'y', 'y', 'y', 'y', 'y', 'b', 'y']);
        });

        it("should have access to own describe scope", function() {
            expect(variableDefinedInNestedDescribe).toBeDefined();
        });

        it("should have access to parent describe scope", function() {
            expect(variableDefinedInDescribe).toBeDefined();
        });
    });

    it("should have access to describe scope", function() {
        expect(variableDefinedInDescribe).toBeDefined();
    });
});

describe("xdescribe()", function() {
    var executionCount = 0;
    it("should not execute fn", function() {
        xdescribe("something", function() {
            executionCount++;
        });
        expect(executionCount).toBe(0);
    });
});

describe("context", function() {
    var foo = 0;
    context("is an alias for describe", function() {
        foo++;
    });

    it("should execute fn", function() {
        expect(foo).toBe(1);
    });
});

describe("it()", function() {
    it("should throw exception if not passed at least a specification", function(){
        expect(function(){
            it();
        }).toThrow("'specification' argument is required");
    });

    it("should generate and run a test", function() {
        ok(true);  // implicitly true by virtue of this running
    });

    describe("when not passed a test lambda", function(){

        function makeArray (array) {
            return Array.prototype.slice.call(array);
        }

        it("should generate a failing (todo) test when not passed a lambda", function(){
            var originalIt = it;
            var args;
            var fialMessage;
            try{
                // mock up an it
                // when passed single arg, let Pavlov do it's job (to test it)
                // when passed 2 args, intercept and capture the response to
                // keep Pavlov from doing its job
                // later, will verify the correct behavior happened with 1 arg.
                it = function() {
                    if(arguments.length === 2) {
                        args = makeArray(arguments);
                    } else {
                        originalIt.apply(this,arguments);
                    }
                };

                // run the method under test
                it("no lambda");

                var todoGeneratingFn = args[1];

                var originalFail = fail;
                failMessage = null;
                try
                {
                    fail = function(message) {
                        failMessage = message;
                    };
                    todoGeneratingFn();
                } finally {
                    fail = originalFail;
                }

            } finally {
                it = originalIt;
            }
            expect(args[0]).toBe("no lambda");
            expect(args.length).toEqual(2);
            expect(failMessage).toEqual("Not Implemented");
        });

    });

    describe("with a wait()", function() {

        it("should throw exception if not passed both fn and ms", function(){
            expect(function(){
                wait();
            }).toThrow("both 'ms' and 'fn' arguments are required");
            expect(function(){
                wait(54);
            }).toThrow("both 'ms' and 'fn' arguments are required");
            expect(function(){
                wait(function(){});
            }).toThrow("both 'ms' and 'fn' arguments are required");
        });

        it("should run adapter's pause(), run a setTimeout() for duration, then execute lambda and run adapter's resume()", function() {
            var original = {
                pause: pause,
                resume: resume,
                setTimeout: window.setTimeout
            };
            var calls = [];
            var setTimeoutMs = 0;
            var waitLambdaCalled = false;

            try{
                // mock timing functions to capture their calls from wait()
                pause = function() { calls.push('pause'); };
                resume = function() { calls.push('resume'); };
                window.setTimeout = function(fn, ms) {
                    calls.push('settimeout');
                    setTimeoutMs = ms;
                    fn();
                };

                // call wait
                wait(40, function(){
                    calls.push('waitlambda');
                });

            } finally {
                // undo mocking
                pause = original.pause;
                resume = original.resume;
                window.setTimeout = original.setTimeout;
            }

            // check if calls to mocked fn's occurred correctly
            expect(calls).toEqual(['pause','settimeout','waitlambda','resume']);
            expect(setTimeoutMs).toBe(40);
        });

    });

    describe("with a pause()", function(){
        it("should proxy adapter's pause()", function(){
            var originalPause = pause;
            var paused = false;
            pause = function() { paused = true; };
            pause();
            pause = originalPause;
            expect(paused).toBe(true);
        });
    });

    describe("with a resume()", function(){
        it("should proxy adapter's resume()", function(){
            var originalResume = resume;
            var resumed = false;
            resume = function() { resumed = true; };
            resume();
            resume = originalResume;
            expect(resumed).toBe(true);
        });
    });

    describe("with an async()", function(){
        it("should return a function which calls pause and then the original function", function(){
            var calls = [];
            var specImplementation = function() { calls.push('spec'); };
            var originalPause = pause;
            pause = function(){ calls.push('pause'); };

            var asyncSpecImplementation = async(specImplementation);
            asyncSpecImplementation();

            pause = originalPause;
            expect(calls).toEqual(['pause','spec']);
        });
    });
});

describe("xit()", function(){
    var executionCount = 0;
    xit("should not execute fn", function(){
        executionCount++;
        expect(executionCount).toBe(1);
    });
       
    it("should not execute fn", function(){
        expect(executionCount).toBe(0);
    });
});
describe('assertions', function() {
    
    describe('toBe', function() {
        it('passes when actual === expected', function() {
            expectAssertions(1);
            expect(true).toBe(true);
        });
    });

    describe('not.toBe', function() {
        it('passes when actual !== expected', function() {
            expectAssertions(1);
            expect(true).not.toBe(false);
        });
    });

    describe('toBeDefined', function() {
        var foo = 0;

        it('passes if actual !== "undefined"', function() {
            expectAssertions(1);
            expect(foo).toBeDefined();
        });
    });

    describe('not.toBeDefined', function() {
        var foo;
        it('passes if actual !== "undefined"', function() {
            expectAssertions(1);
            expect(foo).not.toBeDefined();
        });
    });

    describe('toEqual', function() {
        var foo = { x: 1 },
            bar = { x: 1 };

        it('passes when true identity is given', function() {
            expectAssertions(1);
            expect(foo).toEqual(bar);
        });
    });

    describe('not.toEqual', function() {
        var foo = { x: 1 },
            bar = { x: 2 };

        it('matches when true identity is not given', function() {
            expectAssertions(1);
            expect(foo).not.toEqual(bar);
        });
    });
});

qspec.execute();

module("Second Standard QUnit module");
var secondStandardQUnitTestRan = false;
test("should be able to run after qspec", function() {
    expectAssertions(1);
    secondStandardQUnitTestRan = true;
    ok(secondStandardQUnitTestRan);
});
