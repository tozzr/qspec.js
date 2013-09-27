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

    xdescribe("when not passed a test lambda", function(){

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

                var originalFail = assert.fail;
                failMessage = null;
                try
                {
                    assert.fail = function(message) {
                        failMessage = message;
                    };
                    todoGeneratingFn();
                } finally {
                    assert.fail = originalFail;
                }

            } finally {
                it = originalIt;
            }
            assert(args[0]).equals("no lambda");
            assert(args.length).equals(2);
            assert(failMessage).equals("Not Implemented");
        });

    });

    xdescribe("after a given()", function() {

        it("should throw exception when given() not passed at least an arg", function(){
            assert(function(){
                given();
            }).throwsException("at least one argument is required");
        });

        var singleArgGivenCount = 0;

        given(1, 2, 3).
            it("should test for each of given()'s args when passed flat args", function(x) {
                assert(x).equals(singleArgGivenCount + 1);
                singleArgGivenCount++;
            });

        var multiArgGivenCount = 0;

        given([1, 2, 3], [4, 5, 6], [7, 8, 9]).
            it("should test for each of given()'s args when passed array arguments", function(x, y, z) {
                assert(x).equals(multiArgGivenCount * 3 + 1, "some message");
                assert(y).equals(multiArgGivenCount * 3 + 2);
                assert(z).equals(multiArgGivenCount * 3 + 3);
                multiArgGivenCount++;
        });

        var arrayPassedMultiArgGivenCount = 0;

        given([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).
            it("should test for each of given()'s args when passed array of array arguments", function(x, y, z) {
                assert(x).equals(arrayPassedMultiArgGivenCount * 3 + 1, "some message");
                assert(y).equals(arrayPassedMultiArgGivenCount * 3 + 2);
                assert(z).equals(arrayPassedMultiArgGivenCount * 3 + 3);
                arrayPassedMultiArgGivenCount++;
        });

        given([1,1],[2,2],[3,3]).
            it("should delegate arguments to async tests", async(function(a,b){
                assert(typeof a).isNotEqualTo("undefined");
                assert(typeof b).isNotEqualTo("undefined");
                assert(a).equals(b);
                resume();
            }));
    });

    xdescribe("with a wait()", function() {

        it("should throw exception if not passed both fn and ms", function(){
            assert(function(){
                wait();
            }).throwsException("both 'ms' and 'fn' arguments are required");
            assert(function(){
                wait(54);
            }).throwsException("both 'ms' and 'fn' arguments are required");
            assert(function(){
                wait(function(){});
            }).throwsException("both 'ms' and 'fn' arguments are required");
        });

        it("should run adapter's pause(), run a setTimeout() for duration, then execute lambda and run adapter's resume()", function() {
            var original = {
                pause: pavlov.adapter.pause,
                resume: pavlov.adapter.resume,
                setTimeout: global.setTimeout
            };
            var calls = [];
            var setTimeoutMs = 0;
            var waitLambdaCalled = false;

            try{
                // mock timing functions to capture their calls from wait()
                pavlov.adapter.pause = function() { calls.push('pause'); };
                pavlov.adapter.resume = function() { calls.push('resume'); };
                global.setTimeout = function(fn, ms) {
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
                pavlov.adapter.pause = original.pause;
                pavlov.adapter.resume = original.resume;
                global.setTimeout = original.setTimeout;
            }

            // check if calls to mocked fn's occurred correctly
            assert(calls).contentsEqual(['pause','settimeout','waitlambda','resume']);
            assert(setTimeoutMs).equals(40);
        });

    });

    xdescribe("with a pause()", function(){
        it("should proxy adapter's pause()", function(){
            var originalPause = pavlov.adapter.pause;
            var paused = false;
            pavlov.adapter.pause = function() { paused = true; };
            pause();
            pavlov.adapter.pause = originalPause;
            assert(paused).isTrue();
        });
    });

    xdescribe("with a resume()", function(){
        it("should proxy adapter's resume()", function(){
            var originalResume = pavlov.adapter.resume;
            var resumed = false;
            pavlov.adapter.resume = function() { resumed = true; };
            resume();
            pavlov.adapter.resume = originalResume;
            assert(resumed).isTrue();
        });
    });

    xdescribe("with an async()", function(){
        it("should return a function which calls pause and then the original function", function(){
            var calls = [];
            var specImplementation = function() { calls.push('spec'); };
            var originalPause = pavlov.adapter.pause;
            pavlov.adapter.pause = function(){ calls.push('pause'); };

            var asyncSpecImplementation = async(specImplementation);
            asyncSpecImplementation();

            pavlov.adapter.pause = originalPause;
            assert(calls).contentsEqual(['pause','spec']);
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
