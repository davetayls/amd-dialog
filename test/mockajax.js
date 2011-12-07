/*jslint browser: true, vars: true, white: true, forin: true, indent: 4 */
/*global define,require,jQuery */
var ajax = jQuery.ajax
,   redirects = {
      '/Services/TimelineService.svc/?prev=10&contextId=827': [
          '/testsuite/data/timelinesvc/prev10next0context109153711745531904.json'
      ]
    , '/Services/TimelineService.svc/?next=5&contextId=350': [
          '/testsuite/data/timelinesvc/prev0next10context66682DE1F0484B1ABFEBD84388FE5C7A.json'
      ]
    , '/services/CommentaryFeedService.svc/?match=88001': [
            '/testsuite/data/commentaryService/commentaryService-0.js'
        ,   '/testsuite/data/commentaryService/commentaryService-1.js'
        ,   '/testsuite/data/commentaryService/commentaryService-2.js'
        ,   '/testsuite/data/commentaryService/commentaryService-3.js'
        ,   '/testsuite/data/commentaryService/commentaryService-4.js'
        ,   '/testsuite/data/commentaryService/commentaryService-5.js'
        ,   '/testsuite/data/commentaryService/commentaryService-6.js'
        ,   '/testsuite/data/commentaryService/commentaryService-7.js'
        ,   '/testsuite/data/commentaryService/commentaryService-8.js'
      ]
}
;

jQuery.ajax = function(options){
    'use strict';

    // console.log('ajax request: ' + options.url);
    var redirect = redirects[options.url]
    ;
    if (redirect){
        if (redirect.length > 1){
            arguments[0].url = redirect.splice(0,1)[0];
        } else {
            arguments[0].url = redirect[0];
        }
        
    }
    return ajax.apply(this, arguments);
};
