/**
 * Dialog
 * ======
 * Loading and controling the global dialog
 *
 * @version 0.1
 * @license The MIT License (MIT)
 * @preserve Copyright (c) <2011> <Dave Taylor http://the-taylors.org>
 *
 */
/*jslint browser: true, vars: true, white: true, forin: true */
/*global define, require */
define(
[
    'jquery/core',
    'debug'
],
function($, debug){
    'use strict';


    var module,           // this will hold the modules public functions
        isOldIE           = (navigator.appName === "Microsoft Internet Explorer" && (parseFloat(navigator.appVersion.substr(21)) || parseFloat(navigator.appVersion)) < 7),
        isSmallScreen     = window.screen ? window.screen.width < 700 : false,
        $dialog,
        isSupported       = !isOldIE && !isSmallScreen,
        $body,
        $container,
        $externalContent  = $('<div id="dialog" class="mod-dialog-ext" />'),
        $iframeContent    = $('<div id="dialog" class="mod-dialog-iframe" />'),
        $loading          = $('<div class="mod-dialog-loading"><h2>Loading...</h2></div>'),
        settings,
        initialised = false,

        DEFAULT_OPTIONS = {
            dialogContentId: 'dialog-content'
        },
        DIALOG_DEFAULTS = {
            title: '',
            closeText: 'Close',
            draggable: false,
            modal: true,
            resizable: false,
            width: 640
        }
    ;

    var loadUrl = function (url, callback) {
        $dialog.load(url + ' #' + settings.dialogContentId, function (data, status) {
            if (status === 'success') {
                $dialog.find('form').each(function () {
                    var actionUrl = $(this).attr('action');
                    $(this).attr('action', module.getActionUrl(actionUrl));
                });
                module.hideLoading();
                module.urlLoaded(url);
                if (typeof callback === 'function') { callback.call(this, url); }
            } else {
                debug.error('problem loading dialog', module, status);
            }
        });
    };
    var initialiseExternalContent = function() {
        $externalContent.empty();
    };

    // define the modules public functions
    module = {
        init: function ($dialogContainer, options) {
            if (isSupported && !initialised) {
                initialised = true;
                settings = $.extend({}, DEFAULT_OPTIONS, options);
                $body = $('body');
                $container = $dialogContainer || $body;
                module.attachEvents($container);
            }
        },   
        attachEvents: function($dialogContainer) {
            var self = this;
            $dialogContainer.delegate('a.dialog', 'click', function (e) {
                var $this = $(this),
                href = $this.attr('href');
                self.showUrlInDialog(href);
                e.preventDefault();
            });
            $body.delegate('.dialog-close', 'click', function (e) {
                module.closeDialog();
                e.preventDefault();
            });
        },
        showLoading: function () {
            if (!$loading) {
                $loading.hide()
                    .appendTo($dialog.closest('.ui-dialog'));
            }
            $loading.fadeIn(500);
        },
        hideLoading: function () {
            if ($loading) {
                $loading.fadeOut(500);
            }
        },
        showDialog: function($elemToShow, options){
            this.removeDialog();
			if ($elemToShow.dialog){
				$dialog = $elemToShow.dialog($.extend({}, DIALOG_DEFAULTS, options));
			}
        },
        emptyDialog: function () {
            $dialog.children().remove();
            $dialog.html('');
        },
        removeDialog: function() {
            if ($dialog) {
                $dialog.remove();
                $dialog = null;
            }
        },
        showUrlInDialog: function (url, callback) {
            this.removeDialog();
            initialiseExternalContent();
            this.showLoading();
            loadUrl(url, callback);
            return true;
        },
        closeDialog: function () {
            $dialog.dialog('close');
            this.removeDialog();
            return true;
        },
        getActionUrl: function (url) {
            return url;
        },
        urlLoaded: function (listener) {
            if (typeof listener === 'function') {
                $(module).bind('_urlLoaded', listener);
                return true;
            } else {
                $(module).trigger('_urlLoaded', arguments);
            }
        }
    };

    // expose the public module functions
    return module;
});


