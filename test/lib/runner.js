/*global define,require,jasmineEnv,jasmine */
    // update title with state
window.testRequireOptions = {
    baseUrl: '../',
    paths: {
        jquery: 'lib/jquery-core/core',
        jqueryui: 'lib/jquery-core/ui',
        debug: 'lib/debug',
        spec: 'test/spec'
    }
};

(function($){
    'use strict';

    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;
    var trivialReporter = new jasmine.TrivialReporter();
    jasmineEnv.addReporter(trivialReporter);
    jasmineEnv.specFilter = function(spec) {
        return trivialReporter.specFilter(spec);
    };
    jasmineEnv.execute();
    var $runner = $('.runner');
    setInterval(function(){
        if (!$runner.length){
            $runner = $('.runner');
        }
        if ($runner.hasClass('failed')){
            document.title = '** FAIL*****';
        } else {
            document.title = ':o)';
        }
        $('html,body')[0].scrollTop = 0;
    }, 1000);

}(window.jQuery));
