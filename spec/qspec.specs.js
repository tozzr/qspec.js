module("Standard QUnit module");
var firstStandardQUnitTestRan = false;
test("should be able to run before qspec", function() {
    expectAssertions(1);
    firstStandardQUnitTestRan = true;
    ok(firstStandardQUnitTestRan);
});

function spyOnArgs(object, methodName, fn) {
    var args = [],
        originalFunction;

    try {
        originalFunction = object[methodName];
        object[methodName] = function() {
            args = Array.prototype.slice.call(arguments);
        };
        fn.apply(this, args);
    }
    finally {
        object[methodName] = originalFunction;
    }

    return args;
}

test('simple spyOnArgs', function() {
    var obj = {
        toString: function(arg) {
            return 'arg is: ' + arg;
        },
        foo: 1
    };
    var args = spyOnArgs(obj, 'toString', function() {
        obj.toString('awesome');
    });
    deepEqual(args, ['awesome']);
});

function expectOkCalledWithArgs(fn, expectedArgs) {
   var calledArgs = spyOnArgs(window, 'ok', fn);
    deepEqual(calledArgs, expectedArgs);
}

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

function Foo() {
    this.a = 1;
}
function Bar() {
    this.b = 2;
}

describe(Foo, function() {
    it('gives access to that metadata', function() {
        expect(this.describedClass).toEqual(Foo);
        expect(new this.describedClass().a).toBe(1);
    });

    it('provides derived object', function() {
        expect(this.foo).toEqual(new Foo());
    });
});

describe(Bar, function() {
    it('gives access to that metadata', function() {
        expect(this.describedClass).toEqual(Bar);
        expect(new this.describedClass().b).toBe(2);
    });

    it('provides derived object', function() {
        expect(this.bar).toEqual(new Bar());
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

        function toArray (array) {
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
                        args = toArray(arguments);
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

        it("should run pause(), run a setTimeout() for duration, then execute lambda and run resume()", function() {
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
        it("should proxy pause()", function(){
            var originalPause = pause;
            var paused = false;
            pause = function() { paused = true; };
            pause();
            pause = originalPause;
            expect(paused).toBe(true);
        });
    });

    describe("with a resume()", function(){
        it("should proxy resume()", function(){
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
    var executed = false;
    xit("should not execute fn", function(){
        executed = true;
    });
       
    it("should not have executed fn", function(){
        expect(executed).toBe(false);
    });
});

describe('expectations', function() {
    
    describe('toBe', function() {
        it('passes when actual === expected', function() {
            expectOkCalledWithArgs(
                function(){
                    expect(true).toBe(true);
                },
                [true, 'expected true to be true']
            );
        });
        it('fails when actual !== expected', function() {
            expectOkCalledWithArgs(
                function(){
                    expect(true).toBe(false);
                },
                [false, 'expected true to be false']
            );
        });
    });

    describe('not.toBe', function() {
        it('passes when actual !== expected', function() {
            expectOkCalledWithArgs(
                function(){
                    expect(true).not.toBe(false);
                },
                [true, 'expected true not to be false']
            );
        });
        it('fails when actual === expected', function() {
            expectOkCalledWithArgs(
                function(){
                    expect(true).not.toBe(true);
                },
                [false, 'expected true not to be true']
            );
        });
    });

    describe('toBeDefined', function() {
        var foo = 0, bar;

        it('passes if actual !== "undefined"', function() {
            expectOkCalledWithArgs(
                function(){
                    expect(foo).toBeDefined();
                },
                [true, 'expected 0 to be defined']
            );
        });

        it('fails if actual === "undefined"', function() {
            expectOkCalledWithArgs(
                function(){
                    expect(bar).toBeDefined();
                },
                [false, 'expected undefined to be defined']
            );
        });
    });

    describe('not.toBeDefined', function() {
        var foo, bar = 0;
        
        it('passes if actual === "undefined"', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(foo).not.toBeDefined();
                },
                [true, 'expected undefined not to be defined']
            );
        });

        it('fails if actual !== "undefined"', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(bar).not.toBeDefined();
                },
                [false, 'expected 0 not to be defined']
            );
        });
    });

    describe('toBeGreaterThan', function() {
        it('passes if actual > expected', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(2).toBeGreaterThan(1);
                },
                [true, 'expected 2 to be greater than 1']
            );
        });

        it('fails if actual == expected', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(2).toBeGreaterThan(2);
                },
                [false, 'expected 2 to be greater than 2']
            );
        });

        it('fails if actual < expected', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(2).toBeGreaterThan(3);
                },
                [false, 'expected 2 to be greater than 3']
            );
        });
    });

    describe('not.toBeGreaterThan', function() {
        it('passes if actual < expected', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(2).not.toBeGreaterThan(3);
                },
                [true, 'expected 2 not to be greater than 3']
            );
        });

        it('passes if actual == expected', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(2).not.toBeGreaterThan(2);
                },
                [true, 'expected 2 not to be greater than 2']
            );
        });

        it('fails if actual > expected', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(2).not.toBeGreaterThan(1);
                },
                [false, 'expected 2 not to be greater than 1']
            );
        });
    });

    describe('toBeLessThan', function() {
        it('passes if actual < expected', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(1).toBeLessThan(2);
                },
                [true, 'expected 1 to be less than 2']
            );
        });

        it('fails if actual == expected', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(1).toBeLessThan(1);
                },
                [false, 'expected 1 to be less than 1']
            );
        });

        it('fails if actual > expected', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(1).toBeLessThan(0);
                },
                [false, 'expected 1 to be less than 0']
            );
        });
    });

    describe('not.toBeLessThan', function() {
        it('passes if actual > expected', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(1).not.toBeLessThan(0);
                },
                [true, 'expected 1 not to be less than 0']
            );
        });

        it('passes if actual == expected', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(1).not.toBeLessThan(1);
                },
                [true, 'expected 1 not to be less than 1']
            );
        });

        it('fails if actual < expected', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(1).not.toBeLessThan(2);
                },
                [false, 'expected 1 not to be less than 2']
            );
        });
    });

    describe('toBeNull', function() {
        var foo = null, bar = 0;
        
        it('passes when actal === null', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(foo).toBeNull();
                },
                [true, 'expected null to be null']
            );
        });

        it('fails when actal !== null', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(bar).toBeNull();
                },
                [false, 'expected 0 to be null']
            );
        });
    });

    describe('not.toBeNull', function() {
        var foo = null, bar = 0;
        
        it('passes when actal !== null', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(bar).not.toBeNull();
                },
                [true, 'expected 0 not to be null']
            );
        });
        it('fails when actal === null', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(foo).not.toBeNull();
                },
                [false, 'expected null not to be null']
            );
        });
    });

    describe('toBeUndefined', function() {
        var foo;

        it('passes if actual === "undefined"', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(foo).toBeUndefined();
                },
                [true, 'expected undefined to be undefined']
            );
        });

        it('fails if actual !== "undefined"', function() {
            foo = 0;
            expectOkCalledWithArgs(
                function() {
                    expect(foo).toBeUndefined();
                },
                [false, 'expected 0 to be undefined']
            );
        });
    });

    describe('not.toBeUndefined', function() {
        it('passes if actual !== "undefined"', function() {
            var foo = 0;
            expectOkCalledWithArgs(
                function() {
                    expect(foo).not.toBeUndefined();
                },
                [true, 'expected 0 not to be undefined']
            );
        });

        it('fails if actual === "undefined"', function() {
            var bar;
            expectOkCalledWithArgs(
                function() {
                    expect(bar).not.toBeUndefined();
                },
                [false, 'expected undefined not to be undefined']
            );
        });
    });

    describe('toEqual', function() {
        var foo = { x: 1 },
            bar = { x: 1 };

        it('passes correct args to deepEqual', function() {
            var args = spyOnArgs(window, 'deepEqual', function() {
                expect(foo).toEqual(bar);
            });
            equal(args[0], foo);
            equal(args[1], bar);
            equal(args[2], 'to equal');
        });
    });

    describe('not.toEqual', function() {
        var foo = { x: 1 },
            bar = { x: 2 };

        it('passes correct args to notDeepEqual', function() {
            var args = spyOnArgs(window, 'notDeepEqual', function() {
                expect(foo).not.toEqual(bar);
            });
            equal(args[0], foo);
            equal(args[1], bar);
            equal(args[2], 'not to equal');
        });
    });

    describe('toMatch', function() {
        var foo = 'foo bar baz';
        
        describe('RegExp', function() {
            it('passes when RegExp matches', function(){
                expectOkCalledWithArgs(
                    function() {
                        expect(foo).toMatch(/bar/);
                    },
                    [true, 'expected foo bar baz to match /bar/']
                );
            });

            it('fails when RegExp not matches', function(){
                expectOkCalledWithArgs(
                    function() {
                        expect(foo).toMatch(/xyz/);
                    },
                    [false, 'expected foo bar baz to match /xyz/']
                );
            });
        });
        
        describe('strings', function(){
            it('passes when string is found', function(){
                expectOkCalledWithArgs(
                    function() {
                        expect(foo).toMatch('bar');
                    },
                    [true, 'expected foo bar baz to match bar']
                );
            });

            it('fails when string is not found', function(){
                expectOkCalledWithArgs(
                    function() {
                        expect(foo).toMatch('xyz');
                    },
                    [false, 'expected foo bar baz to match xyz']
                );
            });
        });
    });

    describe('not.toMatch', function() {
        var foo = 'foo bar baz';
        
        describe('RegExp', function() {
            it('passes when RegExp does not match', function(){
                expectOkCalledWithArgs(
                    function() {
                        expect(foo).not.toMatch(/xyz/);
                    },
                    [true, 'expected foo bar baz not to match /xyz/']
                );
            });

            it('fails when RegExp not matches', function(){
                expectOkCalledWithArgs(
                    function() {
                        expect(foo).not.toMatch(/bar/);
                    },
                    [false, 'expected foo bar baz not to match /bar/']
                );
            });
        });

        describe('strings', function(){
            it('passes when string is not found', function(){
                expectOkCalledWithArgs(
                    function() {
                        expect(foo).not.toMatch('xyz');
                    },
                    [true, 'expected foo bar baz not to match xyz']
                );
            });

            it('fails when string is found', function(){
                expectOkCalledWithArgs(
                    function() {
                        expect(foo).not.toMatch('bar');
                    },
                    [false, 'expected foo bar baz not to match bar']
                );
            });
        });
    });

    describe('pass()', function() {
        it('pass when lambda executes', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(function(){}).toPass();
                },
                [true, 'expect lambda to pass']
            );
        });
        it('fails when lambda throws', function() {
            expectOkCalledWithArgs(
                function() {
                    expect(function(){ throw 'exception'; }).toPass();
                },
                [false, 'expect lambda to pass']
            );
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
