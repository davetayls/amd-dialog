/*
    Jasmine BDD example spec
    ========================

    Built in matchers
    -----------------
    expect(x).toEqual(y); compares objects or primitives x and y and passes if they are equivalent
    expect(x).toBe(y); compares objects or primitives x and y and passes if they are the same object
    expect(x).toMatch(pattern); compares x to string or regular expression pattern and passes if they match
    expect(x).toBeDefined(); passes if x is not undefined
    expect(x).toBeUndefined(); passes if x is undefined
    expect(x).toBeNull(); passes if x is null
    expect(x).toBeTruthy(); passes if x evaluates to true
    expect(x).toBeFalsy(); passes if x evaluates to false
    expect(x).toContain(y); passes if array or string x contains y
    expect(x).toBeLessThan(y); passes if x is less than y
    expect(x).toBeGreaterThan(y); passes if x is greater than y
    expect(function(){fn();}).toThrow(e); passes if function fn throws exception e when executed
*/
/*jslint browser: true, vars: true, white: true, forin: true, nomen: true */
/*global jQuery,define,require,describe,afterEach,beforeEach,expect,it,waitsFor,runs */
(function(){
    'use strict';

var SPEC_SETTINGS = {
    name: 'xhr loading',
    module: 'dialog'
};
describe(SPEC_SETTINGS.name, function(){

    var mod, dialog;

    beforeEach(function(){
        this.addMatchers({
            toBeArray: function(){
                return this.actual.constructor === Array;
            },
            toContain: function(expected) {
                if (typeof this.actual === 'string') {
                    return this.actual.indexOf(expected) > -1;
                }
            }
        });
        waitsFor(function(){
            return mod && typeof mod === 'object';
        }, 'never got a ' + SPEC_SETTINGS.name + ' module', 1000);

        require(window.testRequireOptions, [SPEC_SETTINGS.module], function(module) {
                mod = dialog = module;
                dialog.init();
        });
    });

    it('should have the ' + SPEC_SETTINGS.name + ' module', function() {
        expect(mod).toBeDefined();
    });

    describe(SPEC_SETTINGS.name, function(){
        
        it("detects an absolute dialog type", function() {
            var dType = spyOn(dialog.dialogTypes, 'xhr').andReturn();
            mod.showDialogType('/internal/link');
            expect(dType).toHaveBeenCalled();
        });

        it("detects a relative dialog type", function() {
            var dType = spyOn(dialog.dialogTypes, 'xhr').andReturn();
            mod.showDialogType('internal/link');
            expect(dType).toHaveBeenCalled();
        });

        it("detects an internal dialog type", function() {
            var dType = spyOn(dialog.dialogTypes, 'internal').andReturn();
            mod.showDialogType('#internal');
            expect(dType).toHaveBeenCalled();
        });

        it("detects an external dialog type that needs an iframe", function() {
            var dType = spyOn(dialog.dialogTypes, 'iframe').andReturn();
            mod.showDialogType('http://the-taylors.org');
            expect(dType).toHaveBeenCalled();
        });

        it("detects an internal dialog type when a full url is used", function() {
            var dType = spyOn(dialog.dialogTypes, 'internal').andReturn();
            mod.showDialogType(location.href + '#internal');
            expect(dType).toHaveBeenCalled();
        });

        it("detects an external dialog type when external url includes hash", function() {
            var dType = spyOn(dialog.dialogTypes, 'iframe').andReturn();
            mod.showDialogType('http://the-taylors.org#external');
            expect(dType).toHaveBeenCalled();
        });

    });
});

}());

