qspec.js
=

adding syntactic sugar to qunitjs.

With this loaded after qunit you can write your specs like this:

    describe('awesomeness', function() {
      it('should always be pure cooleness', function() {
        expect(stuff).toBe('cool');
      });
    });

Under the hood this is a simple wrappper for qunits api. This is the sugar you taste when qunit is dressed up sweet.

You can even do nested blocks and add beforeEach and afterEach sections:


    describe('awesomeness', function() {
      var stuff;

      beforeEach(function() {
        stuff = new CoolStuff();
      });

      it('should always be pure cooleness', function() {
        expect(stuff.sayAboutItself()).toBe('coolerThanIceInWinter');
      });
    });

Happy coding!

