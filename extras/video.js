/*global define, require */
define(
	[
	'jquery',
	'dialog'
	],
	function($, dialog){
		'use strict';

		return {
			videoTemplate: '<iframe src="{{url}}" width="{{width}}" height="{{height}}" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>',
			getVimeoId: function(url) {
				var matches = /vimeo\.com\/(\d*)/i.exec(url);
				if (matches.length === 2) {
					return matches[1];
				} else {
					return null;
				}
			},
			getVimeoPlayerUrl: function(vimeoId) {
				return 'http://player.vimeo.com/video/' + vimeoId;
			},
			init: function(){
				var self = this;
				dialog.init();
				$('body').delegate('a[href*="vimeo.com"]', 'click', function(e) {
					var vimeoId = self.getVimeoId(this.href),
						playerUrl = self.getVimeoPlayerUrl(vimeoId)
					;
					dialog.showDialogType(playerUrl, 'iframe', {
						iframeTemplate: self.videoTemplate
					});
				});
			}
		};
	});