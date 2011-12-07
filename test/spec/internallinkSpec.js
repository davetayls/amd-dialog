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
/*jslint browser: true, vars: true, white: true, forin: true, plusplus: true, indent: 4 */
/*global jQuery,define,require,describe,afterEach,beforeEach,expect,it,waitsFor,runs */
(function(){
    'use strict';

var SPEC_SETTINGS = {
    name: 'internal loading',
    module: 'dialog'
};
describe(SPEC_SETTINGS.name, function(){

    var mod, dialog, $ = jQuery;

    beforeEach(function(){
        this.addMatchers({
            toBeArray: function(){
                return this.actual.constructor === Array;
            },
            toContain: function(expected) {
                if (typeof this.actual === 'string') {
                    return this.actual.indexOf(expected) > -1;
                }
            },
            isHidden: function(){
                return this.actual.css('display') === 'none';
            }
        });
        waitsFor(function(){
            return mod && typeof mod === 'object';
        }, 'never got a ' + SPEC_SETTINGS.name + ' module', 1000);

        require(window.testRequireOptions, [SPEC_SETTINGS.module], function(module) {
                mod = dialog = module;
        });
    });

    it('should have the ' + SPEC_SETTINGS.name + ' module', function() {
        expect(mod).toBeDefined();
    });

    describe(SPEC_SETTINGS.name, function(){
        it('should be able to use jQuery', function(){
            expect(jQuery).toBeDefined();
        });
        it("should be able to use jQuery dialog", function() {
            expect(jQuery.fn.dialog).toBeDefined();
        });
        it("can be initialised", function() {
            dialog.init();
        });
        it("can show internal content", function() {
            waitsFor(function(){
                return $('.ui-dialog #internalContent').length > 0;
            }, 1000);
            jQuery('#internalContent-link').click();
        });
        it("close the dialog", function() {
            dialog.closeDialog();
            expect($('.ui-dialog')).isHidden();
        });
        it("can then open it again", function() {
            waitsFor(function(){
                return $('.ui-dialog #internalContent').length > 0;
            }, 1000);
            jQuery('#internalContent-link').click();
        });
        it("shouldn't have nested dialogs", function() {
            expect($('.ui-dialog').length).toBe(1);
        });
        it("can then open an external url", function() {
            waitsFor(function(){
                return $('.ui-dialog #dialog-content').length > 0;
            }, 1000);
            $('#external-link').click();
        });
        it("hasn't removed the internal content from the DOM", function() {
            expect($('#internalContent').length).toBe(1);
        });
        it("can then open the internal content again", function() {
            waitsFor(function(){
                return $('.ui-dialog #internalContent').length > 0;
            }, 1000);
            $('#internalContent-link').click();
        });
    });
});

}());

